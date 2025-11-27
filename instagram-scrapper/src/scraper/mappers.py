"""Mappers to transform instaloader data to FetchedPost format."""

import logging
from datetime import datetime

import instaloader

from src.models import FetchedPost, MediaUploadJobData, PostAuthor, PostMetrics
from src.scraper.media_upload_publisher import (
    generate_media_key,
    get_content_type_from_extension,
    get_extension_from_url,
)

logger = logging.getLogger(__name__)


class InstagramPostMapper:
    """Mapper for converting instaloader Post to FetchedPost."""

    @staticmethod
    def to_fetched_post(
        post: instaloader.Post,
        source_id: str,
    ) -> tuple[FetchedPost, list[MediaUploadJobData]]:
        """
        Convert instaloader Post to FetchedPost format.

        Args:
            post: instaloader Post object
            source_id: Source ID for generating S3 paths

        Returns:
            Tuple of (FetchedPost, list of MediaUploadJobData)
        """
        # Extract media URLs and create upload jobs
        media_urls, media_jobs = InstagramPostMapper._extract_media_with_jobs(
            post,
            source_id,
        )

        # Extract author information
        author = InstagramPostMapper._extract_author(post)

        # Extract metrics
        metrics = InstagramPostMapper._extract_metrics(post)

        # Format published date as ISO string
        published_at = post.date_utc.isoformat()

        fetched_post = FetchedPost(
            externalId=post.shortcode,
            content=post.caption or "",
            mediaUrls=media_urls,
            publishedAt=published_at,
            author=author,
            metrics=metrics,
        )

        return fetched_post, media_jobs

    @staticmethod
    def _extract_media_with_jobs(
        post: instaloader.Post,
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

        def add_media(url: str, is_video: bool = False) -> None:
            nonlocal media_index
            media_index += 1

            # Determine extension and content type
            if is_video:
                extension = "mp4"
            else:
                extension = get_extension_from_url(url)

            content_type = get_content_type_from_extension(extension)

            # Generate S3 key
            s3_key = generate_media_key(
                source_type="instagram",
                source_id=source_id,
                post_external_id=post.shortcode,
                index=media_index,
                extension=extension,
            )

            s3_paths.append(s3_key)

            # Create upload job
            media_jobs.append(
                MediaUploadJobData(
                    sourceType="instagram",
                    sourceId=source_id,
                    postExternalId=post.shortcode,
                    mediaIndex=media_index,
                    targetPath=s3_key,
                    contentType=content_type,
                    source="url",
                    sourceUrl=url,
                ),
            )

        # Handle single post (image or video)
        if post.typename != "GraphSidecar":
            if post.is_video:
                if post.video_url:
                    add_media(post.video_url, is_video=True)
            else:
                if post.url:
                    add_media(post.url, is_video=False)
        else:
            # Handle sidecar (multiple images/videos)
            try:
                for node in post.get_sidecar_nodes():
                    if node.is_video:
                        if node.video_url:
                            add_media(node.video_url, is_video=True)
                    else:
                        if node.display_url:
                            add_media(node.display_url, is_video=False)
            except Exception as e:
                logger.warning(
                    f"Failed to extract sidecar media for post {post.shortcode}: {e}",
                )
                # Fallback to main media
                if post.is_video:
                    if post.video_url:
                        add_media(post.video_url, is_video=True)
                else:
                    if post.url:
                        add_media(post.url, is_video=False)

        return s3_paths, media_jobs

    @staticmethod
    def _extract_author(post: instaloader.Post) -> PostAuthor:
        """Extract author information from a post."""
        profile = post.owner_profile

        return PostAuthor(
            username=profile.username,
            displayName=profile.full_name or profile.username,
            avatarUrl=profile.profile_pic_url if profile.profile_pic_url else None,
        )

    @staticmethod
    def _extract_metrics(post: instaloader.Post) -> PostMetrics:
        """Extract engagement metrics from a post."""
        return PostMetrics(
            likes=post.likes if post.likes else None,
            comments=post.comments if post.comments else None,
            shares=None,  # Instagram API doesn't provide share count
        )
