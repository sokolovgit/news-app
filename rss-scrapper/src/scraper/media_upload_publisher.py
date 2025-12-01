"""Publisher for media upload jobs to BullMQ queue."""

import logging

from bullmq import Queue

from src.config import Settings
from src.models import MediaUploadJobData

logger = logging.getLogger(__name__)


class MediaUploadPublisher:
    """Publisher for posting media upload jobs to BullMQ queue."""

    def __init__(self, settings: Settings):
        """Initialize media upload publisher with settings."""
        self.settings = settings
        self.queue = Queue(
            settings.media_upload_queue,
            {
                "connection": settings.redis_url,
            },
        )

    async def publish(self, job_data: MediaUploadJobData) -> str:
        """
        Publish a single media upload job.

        Args:
            job_data: Media upload job data

        Returns:
            Job ID
        """
        data = job_data.model_dump(mode="json", by_alias=True)

        job = await self.queue.add(
            "upload-media",
            data,
            {
                "attempts": 5,
                "backoff": {
                    "type": "exponential",
                    "delay": 2000,
                },
                "removeOnComplete": 100,
                "removeOnFail": 1000,
            },
        )

        logger.debug(f"Published media upload job {job.id} for {job_data.targetPath}")

        return job.id

    async def publish_bulk(self, jobs: list[MediaUploadJobData]) -> list[str]:
        """
        Publish multiple media upload jobs in bulk.

        Args:
            jobs: List of media upload job data

        Returns:
            List of job IDs
        """
        if not jobs:
            return []

        bulk_jobs = [
            {
                "name": "upload-media",
                "data": job.model_dump(mode="json", by_alias=True),
                "opts": {
                    "attempts": 5,
                    "backoff": {
                        "type": "exponential",
                        "delay": 2000,
                    },
                    "removeOnComplete": 100,
                    "removeOnFail": 1000,
                },
            }
            for job in jobs
        ]

        added_jobs = await self.queue.addBulk(bulk_jobs)

        logger.debug(f"Published {len(added_jobs)} media upload jobs in bulk")

        return [job.id for job in added_jobs]

    async def close(self) -> None:
        """Close the queue connection."""
        await self.queue.close()

