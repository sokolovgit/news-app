"""Mappers to transform RSS feed data to FetchedPost format."""

import logging
import re
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

from src.models import FetchedPost, MediaUploadJobData, PostAuthor, PostMetrics
from src.scraper.rss_scraper import RssFeedEntry, RssFeedInfo

logger = logging.getLogger(__name__)


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
    Example: rss/src_abc123/entry-guid/1.jpg
    """
    # Sanitize post_external_id for use in path (remove special chars)
    safe_post_id = re.sub(r"[^a-zA-Z0-9_-]", "_", post_external_id)[:100]
    return f"{source_type}/{source_id}/{safe_post_id}/{index}.{extension}"


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
        valid_extensions = {
            "jpg",
            "jpeg",
            "png",
            "gif",
            "webp",
            "mp4",
            "mov",
            "webm",
            "mp3",
            "wav",
            "ogg",
            "m4a",
            "pdf",
        }
        if ext in valid_extensions:
            return "jpg" if ext == "jpeg" else ext

    return "jpg"


def get_extension_from_content_type(content_type: str) -> str:
    """Get file extension from content type."""
    mapping = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "video/mp4": "mp4",
        "video/quicktime": "mov",
        "video/webm": "webm",
        "audio/mpeg": "mp3",
        "audio/mp3": "mp3",
        "audio/wav": "wav",
        "audio/ogg": "ogg",
        "audio/m4a": "m4a",
        "application/pdf": "pdf",
    }
    return mapping.get(content_type.lower(), "bin")


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
        "mp3": "audio/mpeg",
        "wav": "audio/wav",
        "ogg": "audio/ogg",
        "m4a": "audio/m4a",
        "pdf": "application/pdf",
    }
    return mapping.get(extension.lower(), "application/octet-stream")


class RssEntryMapper:
    """Mapper for converting RssFeedEntry to FetchedPost."""

    @staticmethod
    def to_fetched_post(
        entry: RssFeedEntry,
        feed_info: RssFeedInfo,
        source_id: str,
    ) -> tuple[FetchedPost, list[MediaUploadJobData]]:
        """
        Convert RssFeedEntry to FetchedPost format.

        Args:
            entry: RSS feed entry
            feed_info: Feed metadata
            source_id: Source ID for generating S3 paths

        Returns:
            Tuple of (FetchedPost, list of MediaUploadJobData)
        """
        # Extract media URLs and create upload jobs
        media_urls, media_jobs = RssEntryMapper._extract_media_with_jobs(
            entry,
            source_id,
        )

        # Extract author information
        author = RssEntryMapper._extract_author(entry, feed_info)

        # Format published date as ISO string
        published_at = RssEntryMapper._format_published_date(entry.published)

        # Build content - combine title and content
        content = RssEntryMapper._build_content(entry)

        fetched_post = FetchedPost(
            externalId=entry.id,
            content=content,
            mediaUrls=media_urls,
            publishedAt=published_at,
            author=author,
            metrics=PostMetrics(),  # RSS doesn't have engagement metrics
            link=entry.link,
            title=entry.title,
        )

        return fetched_post, media_jobs

    @staticmethod
    def _extract_media_with_jobs(
        entry: RssFeedEntry,
        source_id: str,
    ) -> tuple[list[str], list[MediaUploadJobData]]:
        """
        Extract all media from an entry and create upload jobs.

        Returns:
            Tuple of (list of S3 paths, list of MediaUploadJobData)
        """
        s3_paths: list[str] = []
        media_jobs: list[MediaUploadJobData] = []
        media_index = 0

        for enclosure in entry.enclosures:
            url = enclosure.get("url", "")
            if not url:
                continue

            media_index += 1

            # Determine extension from content type or URL
            content_type = enclosure.get("type", "")
            if content_type:
                extension = get_extension_from_content_type(content_type)
            else:
                extension = get_extension_from_url(url)

            if not content_type:
                content_type = get_content_type_from_extension(extension)

            # Generate S3 key
            s3_key = generate_media_key(
                source_type="rss",
                source_id=source_id,
                post_external_id=entry.id,
                index=media_index,
                extension=extension,
            )

            s3_paths.append(s3_key)

            # Create upload job
            media_jobs.append(
                MediaUploadJobData(
                    sourceType="rss",
                    sourceId=source_id,
                    postExternalId=entry.id,
                    mediaIndex=media_index,
                    targetPath=s3_key,
                    contentType=content_type,
                    source="url",
                    sourceUrl=url,
                ),
            )

        return s3_paths, media_jobs

    @staticmethod
    def _extract_author(entry: RssFeedEntry, feed_info: RssFeedInfo) -> PostAuthor:
        """Extract author information from entry or fall back to feed info."""
        # Try entry author first
        if entry.author:
            return PostAuthor(
                username=RssEntryMapper._sanitize_username(entry.author),
                displayName=entry.author,
                avatarUrl=feed_info.image_url,
            )

        # Fall back to feed author
        if feed_info.author:
            return PostAuthor(
                username=RssEntryMapper._sanitize_username(feed_info.author),
                displayName=feed_info.author,
                avatarUrl=feed_info.image_url,
            )

        # Fall back to feed title
        return PostAuthor(
            username=RssEntryMapper._sanitize_username(feed_info.title),
            displayName=feed_info.title,
            avatarUrl=feed_info.image_url,
        )

    @staticmethod
    def _sanitize_username(name: str) -> str:
        """Sanitize a name for use as username."""
        # Remove special characters, keep alphanumeric and underscores
        sanitized = re.sub(r"[^a-zA-Z0-9_]", "_", name)
        # Trim to reasonable length
        return sanitized[:50].strip("_") or "unknown"

    @staticmethod
    def _format_published_date(published: Optional[datetime]) -> str:
        """Format published date as ISO string."""
        if published:
            # Ensure timezone-aware
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            return published.isoformat()
        # Default to current time if no date available
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _build_content(entry: RssFeedEntry) -> str:
        """Build content from entry, combining title and content if needed."""
        content_parts = []

        # Include title if different from content
        if entry.title and entry.title not in (entry.content or ""):
            content_parts.append(f"**{entry.title}**")

        if entry.content:
            content_parts.append(entry.content)

        # If we have tags, add them
        if entry.tags:
            tags_str = " ".join(f"#{tag.replace(' ', '_')}" for tag in entry.tags[:10])
            content_parts.append(f"\n\n{tags_str}")

        return "\n\n".join(content_parts) if content_parts else entry.title or ""

