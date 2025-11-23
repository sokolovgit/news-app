"""Mappers to transform instaloader data to FetchedPost format."""

import logging
from datetime import datetime

import instaloader

from src.models import FetchedPost, PostAuthor, PostMetrics

logger = logging.getLogger(__name__)


class InstagramPostMapper:
    """Mapper for converting instaloader Post to FetchedPost."""

    @staticmethod
    def to_fetched_post(post: instaloader.Post) -> FetchedPost:
        """
        Convert instaloader Post to FetchedPost format.

        Args:
            post: instaloader Post object

        Returns:
            FetchedPost object matching NestJS format
        """
        # Extract media URLs
        media_urls = InstagramPostMapper._extract_media_urls(post)

        # Extract author information
        author = InstagramPostMapper._extract_author(post)

        # Extract metrics
        metrics = InstagramPostMapper._extract_metrics(post)

        # Format published date as ISO string
        published_at = post.date_utc.isoformat()

        return FetchedPost(
            externalId=post.shortcode,
            content=post.caption or "",
            mediaUrls=media_urls,
            publishedAt=published_at,
            author=author,
            metrics=metrics,
        )

    @staticmethod
    def _extract_media_urls(post: instaloader.Post) -> list[str]:
        """Extract all media URLs from a post."""
        media_urls = []

        # Add main post URL (image or video)
        if post.is_video:
            # For videos, use the video URL
            if post.video_url:
                media_urls.append(post.video_url)
        else:
            # For images, use the display URL
            if post.url:
                media_urls.append(post.url)

        # Add sidecar media (for posts with multiple images/videos)
        if post.typename == "GraphSidecar":
            try:
                for node in post.get_sidecar_nodes():
                    if node.is_video:
                        if node.video_url:
                            media_urls.append(node.video_url)
                    else:
                        if node.display_url:
                            media_urls.append(node.display_url)
            except Exception as e:
                logger.warning(
                    f"Failed to extract sidecar media for post {post.shortcode}: {e}",
                )

        return media_urls

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
