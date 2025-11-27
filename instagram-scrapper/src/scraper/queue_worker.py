"""Queue worker for processing Instagram fetch jobs."""

import logging
import time


from bullmq import Job, Worker

from src.config import Settings
from src.models import CollectorJobData
from src.scraper.instagram_scraper import InstagramScraper
from src.scraper.mappers import InstagramPostMapper
from src.scraper.result_publisher import ResultPublisher
from src.scraper.media_upload_publisher import MediaUploadPublisher

logger = logging.getLogger(__name__)


class InstagramQueueWorker:
    """Worker for processing Instagram fetch jobs from BullMQ."""

    def __init__(
        self,
        settings: Settings,
        scraper: InstagramScraper,
        publisher: ResultPublisher,
        media_publisher: MediaUploadPublisher,
    ):
        """Initialize queue worker."""
        self.settings = settings
        self.scraper = scraper
        self.publisher = publisher
        self.media_publisher = media_publisher
        self.worker: Worker | None = None

    def start(self) -> None:
        """Start the queue worker."""
        logger.info(
            f"Starting Instagram queue worker for queue: {self.settings.instagram_fetcher_queue}",
        )

        self.worker = Worker(
            self.settings.instagram_fetcher_queue,
            self._process_job,
            {
                "connection": self.settings.redis_url,
                "concurrency": self.settings.worker_concurrency,
            },
        )

        logger.info("Instagram queue worker started successfully")

    async def _process_job(self, job: Job, token: str) -> None:
        """
        Process a single Instagram fetch job.

        Args:
            job: BullMQ job containing CollectorJobData
            token: Cancellation token for the job
        """
        job_id = job.id or "unknown"
        start_time = time.time() * 1000  # Convert to milliseconds

        logger.info(f"Processing Instagram fetch job {job_id}")

        error_occurred = False
        error_instance = None

        try:
            # Parse job data
            job_data = CollectorJobData.model_validate(job.data, from_attributes=True)

            # Validate source type
            if job_data.sourceType != "instagram":
                raise ValueError(
                    f"Invalid source type: {job_data.sourceType}. Expected 'instagram'",
                )

            logger.info(
                f"Fetching Instagram posts for @{job_data.externalId} "
                f"(sourceId={job_data.sourceId}, limit={job_data.limit}, cursor={job_data.cursor})",
            )

            # Fetch posts using scraper
            posts, next_cursor = self.scraper.fetch_profile_posts(
                username=job_data.externalId,
                limit=job_data.limit,
                cursor=job_data.cursor,
            )

            # Map posts to FetchedPost format and collect media upload jobs
            fetched_posts = []
            all_media_jobs = []

            for post in posts:
                fetched_post, media_jobs = InstagramPostMapper.to_fetched_post(
                    post,
                    source_id=job_data.sourceId,
                )
                fetched_posts.append(fetched_post)
                all_media_jobs.extend(media_jobs)

            # Queue media upload jobs in bulk
            if all_media_jobs:
                await self.media_publisher.publish_bulk(all_media_jobs)
                logger.info(
                    f"Queued {len(all_media_jobs)} media upload jobs for source {job_data.sourceId}",
                )

            # Calculate processing time
            processing_time = int(
                (time.time() * 1000) - start_time,
            )

            # Publish success result
            await self.publisher.publish_success(
                source_id=job_data.sourceId,
                source_type=job_data.sourceType,
                collector_job_id=job_id,
                orchestrator_job_id=job_data.metadata.orchestratorJobId,
                posts=fetched_posts,
                next_cursor=next_cursor,
                processing_time=processing_time,
                priority=job_data.priority,
            )

            logger.info(
                f"Successfully processed job {job_id}: {len(fetched_posts)} posts, "
                f"{len(all_media_jobs)} media files",
            )

        except Exception as error:
            error_occurred = True
            # Calculate processing time
            processing_time = int(
                (time.time() * 1000) - start_time,
            )

            error_instance = error if isinstance(error, Exception) else Exception(str(error))

            logger.error(
                f"Failed to process job {job_id}: {error_instance}",
                exc_info=True,
            )

            # Try to get job data for error reporting
            try:
                job_data = CollectorJobData.model_validate(
                    job.data,
                    from_attributes=True,
                )

                # Publish error result
                await self.publisher.publish_error(
                    source_id=job_data.sourceId,
                    source_type=job_data.sourceType,
                    collector_job_id=job_id,
                    orchestrator_job_id=job_data.metadata.orchestratorJobId,
                    error=error_instance,
                    processing_time=processing_time,
                    priority=job_data.priority,
                )
            except Exception as parse_error:
                logger.error(
                    f"Failed to parse job data for error reporting: {parse_error}",
                )

        # Re-raise error after publishing result to trigger BullMQ retry mechanism
        if error_occurred and error_instance:
            raise error_instance

    async def stop(self) -> None:
        """Stop the queue worker gracefully."""
        logger.info("Stopping Instagram queue worker...")

        if self.worker:
            await self.worker.close()

        await self.publisher.close()
        await self.media_publisher.close()

        logger.info("Instagram queue worker stopped")
