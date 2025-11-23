"""Result publisher for posting results to BullMQ results queue."""

import logging
from datetime import datetime

from bullmq import Queue

from src.config import Settings
from src.models import ErrorData, FetchedPost, ResultJobData, ResultJobMetadata

logger = logging.getLogger(__name__)


class ResultPublisher:
    """Publisher for posting fetch results to BullMQ results queue."""

    def __init__(self, settings: Settings):
        """Initialize result publisher with settings."""
        self.settings = settings
        self.queue = Queue(
            settings.fetch_results_queue,
            {
                "connection": settings.redis_url,
            },
        )

    async def publish_success(
        self,
        source_id: str,
        source_type: str,
        collector_job_id: str,
        orchestrator_job_id: str,
        posts: list[FetchedPost],
        next_cursor: str | None,
        processing_time: int,
        priority: int,
    ) -> None:
        """
        Publish successful fetch result to results queue.

        Args:
            source_id: Source ID
            source_type: Source type ("instagram" or "telegram")
            collector_job_id: Collector job ID
            orchestrator_job_id: Orchestrator job ID
            posts: List of fetched posts
            next_cursor: Next cursor for pagination
            processing_time: Processing time in milliseconds
            priority: Job priority
        """
        result_job = ResultJobData(
            sourceId=source_id,
            sourceType=source_type,
            status="success",
            posts=posts,
            nextCursor=next_cursor,
            processingTime=processing_time,
            metadata=ResultJobMetadata(
                collectorJobId=collector_job_id,
                orchestratorJobId=orchestrator_job_id,
                fetchedAt=datetime.utcnow(),
            ),
        )

        # Convert to dict for BullMQ (handling datetime serialization)
        job_data = result_job.model_dump(mode="json", by_alias=True)

        await self.queue.add(
            "process-result",
            job_data,
            {
                "priority": priority,
                "attempts": 5,
                "backoff": {
                    "type": "exponential",
                    "delay": 2000,
                },
                "removeOnComplete": 100,
                "removeOnFail": 1000,
            },
        )

        logger.info(
            f"Published success result for source {source_id}: {len(posts)} posts",
        )

    async def publish_error(
        self,
        source_id: str,
        source_type: str,
        collector_job_id: str,
        orchestrator_job_id: str,
        error: Exception,
        processing_time: int,
        priority: int,
    ) -> None:
        """
        Publish error result to results queue.

        Args:
            source_id: Source ID
            source_type: Source type ("instagram" or "telegram")
            collector_job_id: Collector job ID
            orchestrator_job_id: Orchestrator job ID
            error: Exception that occurred
            processing_time: Processing time in milliseconds
            priority: Job priority
        """
        error_code = ResultPublisher._get_error_code(error)
        retryable = ResultPublisher._is_retryable_error(error)

        error_data = ErrorData(
            code=error_code,
            message=str(error),
            retryable=retryable,
        )

        result_job = ResultJobData(
            sourceId=source_id,
            sourceType=source_type,
            status="error",
            error=error_data,
            processingTime=processing_time,
            metadata=ResultJobMetadata(
                collectorJobId=collector_job_id,
                orchestratorJobId=orchestrator_job_id,
                fetchedAt=datetime.utcnow(),
            ),
        )

        # Convert to dict for BullMQ
        job_data = result_job.model_dump(mode="json", by_alias=True)

        await self.queue.add(
            "process-result",
            job_data,
            {
                "priority": priority,
                "attempts": 5,
                "backoff": {
                    "type": "exponential",
                    "delay": 2000,
                },
                "removeOnComplete": 100,
                "removeOnFail": 1000,
            },
        )

        logger.info(
            f"Published error result for source {source_id}: {error_code} - {str(error)}",
        )

    async def close(self) -> None:
        """Close the queue connection."""
        await self.queue.close()

    @staticmethod
    def _get_error_code(error: Exception) -> str:
        """Get error code based on error type."""
        error_name = type(error).__name__
        error_message = str(error).lower()

        # Check for rate limit patterns first (before ConnectionException)
        # Instagram often returns rate limits as 401 with "please wait" messages
        rate_limit_patterns = [
            "rate limit",
            "ratelimitexception",
            "please wait",
            "wait a few minutes",
            "try again",
        ]
        # Check for 401 with rate limit message (Instagram's rate limit response)
        if "401" in error_message and any(
            pattern in error_message for pattern in ["wait", "try again", "few minutes"]
        ):
            return "RATE_LIMIT_ERROR"
        # Check for explicit rate limit patterns
        if any(pattern in error_message for pattern in rate_limit_patterns):
            return "RATE_LIMIT_ERROR"
        if "RateLimitException" in error_name:
            return "RATE_LIMIT_ERROR"

        # Check for specific instaloader exceptions
        if "ProfileNotExistsException" in error_name or "not found" in error_message:
            return "PROFILE_NOT_FOUND_ERROR"
        if "LoginRequiredException" in error_name or "authentication" in error_message:
            return "AUTH_ERROR"
        if "ConnectionException" in error_name or "connection" in error_message:
            return "CLIENT_NOT_CONNECTED_ERROR"

        return "COLLECTION_ERROR"

    @staticmethod
    def _is_retryable_error(error: Exception) -> bool:
        """Determine if error is retryable."""
        error_name = type(error).__name__
        error_message = str(error).lower()

        # Profile not found and auth errors are not retryable
        non_retryable_patterns = [
            "profilenotexistsexception",
            "not found",
            "loginrequiredexception",
            "authentication",
        ]

        # Check non-retryable first
        if any(
            pattern in error_message or pattern in error_name for pattern in non_retryable_patterns
        ):
            return False

        # Rate limit errors are retryable (but should be handled with backoff)
        rate_limit_patterns = [
            "rate limit",
            "ratelimitexception",
            "please wait",
            "wait a few minutes",
            "try again",
        ]
        # Check for 401 with rate limit message (Instagram's rate limit response)
        if "401" in error_message and any(
            pattern in error_message for pattern in ["wait", "try again", "few minutes"]
        ):
            return True
        # Check for explicit rate limit patterns
        if any(pattern in error_message for pattern in rate_limit_patterns):
            return True
        if "RateLimitException" in error_name:
            return True

        retryable_patterns = [
            "timeout",
            "network",
            "connection",
            "connectionexception",
            "econnrefused",
            "etimedout",
            "timeouterror",
            "networkerror",
            "connectionerror",
        ]

        # Check retryable patterns
        return any(
            pattern in error_message or pattern in error_name for pattern in retryable_patterns
        )
