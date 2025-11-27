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


def generate_media_key(
    source_type: str,
    source_id: str,
    post_external_id: str,
    index: int,
    extension: str,
) -> str:
    """
    Generate S3 key for media file.

    Format: {sourceType}/{sourceId}/{postExternalId}/{index}.{extension}
    Example: instagram/src_abc123/CxY2Ab3pQ/1.jpg
    """
    return f"{source_type}/{source_id}/{post_external_id}/{index}.{extension}"


def get_extension_from_url(url: str) -> str:
    """
    Get file extension from URL.

    Tries to extract extension from the URL path.
    Falls back to 'jpg' for images if unable to determine.
    """
    # Remove query parameters
    path = url.split("?")[0]

    # Get the last part of the path
    filename = path.split("/")[-1]

    # Get extension
    if "." in filename:
        ext = filename.split(".")[-1].lower()
        # Validate it's a reasonable extension
        if ext in ("jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm"):
            return ext if ext != "jpeg" else "jpg"

    # Default based on URL patterns
    if "video" in url.lower():
        return "mp4"

    return "jpg"


def get_content_type_from_extension(extension: str) -> str:
    """Get content type from file extension."""
    mapping = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
        "mp4": "video/mp4",
        "mov": "video/quicktime",
        "webm": "video/webm",
    }
    return mapping.get(extension, "application/octet-stream")

