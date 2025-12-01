"""Mappers to transform Twitter data to FetchedPost format."""

import logging

from src.models import FetchedPost, MediaUploadJobData, PostAuthor, PostMetrics
from src.scraper.twitter_scraper import TwitterPost
from src.scraper.media_upload_publisher import (
    generate_media_key,
    get_content_type_from_extension,
    get_extension_from_url,
)

logger = logging.getLogger(__name__)


class TwitterPostMapper:
    """Mapper for converting TwitterPost to FetchedPost."""

    @staticmethod
    def to_fetched_post(
        post: TwitterPost,
        source_id: str,
    ) -> tuple[FetchedPost, list[MediaUploadJobData]]:
        """
        Convert TwitterPost to FetchedPost format.

        Args:
            post: TwitterPost object
            source_id: Source ID for generating S3 paths

        Returns:
            Tuple of (FetchedPost, list of MediaUploadJobData)
        """
        # Extract media URLs and create upload jobs
        media_urls, media_jobs = TwitterPostMapper._extract_media_with_jobs(
            post,
            source_id,
        )

        # Extract author information
        author = TwitterPostMapper._extract_author(post)

        # Extract metrics
        metrics = TwitterPostMapper._extract_metrics(post)

        # Format published date as ISO string
        published_at = post.created_at.isoformat()

        fetched_post = FetchedPost(
            externalId=post.id,
            content=post.content,
            mediaUrls=media_urls,
            publishedAt=published_at,
            author=author,
            metrics=metrics,
        )

        return fetched_post, media_jobs

    @staticmethod
    def _extract_media_with_jobs(
        post: TwitterPost,
        source_id: str,
    ) -> tuple[list[str], list[MediaUploadJobData]]:
        """
        Extract all media from a post and create upload jobs.

        Returns:
            Tuple of (list of S3 paths, list of MediaUploadJobData)
        """
        s3_paths: list[str] = []
        media_jobs: list[MediaUploadJobData] = []
        media_index = 0

        for url in post.media_urls:
            media_index += 1

            # Determine if it's a video based on URL
            is_video = any(ext in url.lower() for ext in [".mp4", ".mov", ".webm", "video"])

            # Determine extension and content type
            if is_video:
                extension = "mp4"
            else:
                extension = get_extension_from_url(url)

            content_type = get_content_type_from_extension(extension)

            # Generate S3 key
            s3_key = generate_media_key(
                source_type="twitter",
                source_id=source_id,
                post_external_id=post.id,
                index=media_index,
                extension=extension,
            )

            s3_paths.append(s3_key)

            # Create upload job
            media_jobs.append(
                MediaUploadJobData(
                    sourceType="twitter",
                    sourceId=source_id,
                    postExternalId=post.id,
                    mediaIndex=media_index,
                    targetPath=s3_key,
                    contentType=content_type,
                    source="url",
                    sourceUrl=url,
                ),
            )

        return s3_paths, media_jobs

    @staticmethod
    def _extract_author(post: TwitterPost) -> PostAuthor:
        """Extract author information from a post."""
        return PostAuthor(
            username=post.author.username,
            displayName=post.author.display_name,
            avatarUrl=post.author.avatar_url,
        )

    @staticmethod
    def _extract_metrics(post: TwitterPost) -> PostMetrics:
        """Extract engagement metrics from a post."""
        return PostMetrics(
            likes=post.likes_count,
            comments=post.replies_count,
            shares=post.retweets_count,
        )

