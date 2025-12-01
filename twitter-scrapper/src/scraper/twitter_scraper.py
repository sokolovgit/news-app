"""Twitter scraper using twscrape."""

import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from twscrape import API, gather
from twscrape.models import Tweet, User

from src.config import Settings

logger = logging.getLogger(__name__)


@dataclass
class TwitterProfile:
    """Twitter user profile data."""

    id: str
    username: str
    display_name: str
    avatar_url: Optional[str]
    verified: bool
    followers_count: int
    following_count: int
    tweets_count: int


@dataclass
class TwitterPost:
    """Twitter post/tweet data."""

    id: str
    content: str
    created_at: datetime
    author: TwitterProfile
    media_urls: list[str]
    likes_count: int
    retweets_count: int
    replies_count: int
    quotes_count: int
    views_count: Optional[int]


class TwitterScraperError(Exception):
    """Base error for Twitter scraper."""

    pass


class TwitterAccountNotFoundError(TwitterScraperError):
    """Twitter account not found error."""

    pass


class TwitterRateLimitError(TwitterScraperError):
    """Twitter rate limit error."""

    pass


class TwitterAuthError(TwitterScraperError):
    """Twitter authentication error."""

    pass


class TwitterScraper:
    """Wrapper around twscrape for fetching Twitter posts."""

    def __init__(self, settings: Settings):
        """Initialize Twitter scraper with settings."""
        self.settings = settings
        self.api: Optional[API] = None

    async def initialize(self) -> None:
        """Initialize the twscrape API with accounts from database."""
        db_path = self.settings.get_accounts_db_path()
        logger.info(f"Initializing twscrape API with database: {db_path}")

        self.api = API(str(db_path))

        # Check if we have any accounts
        accounts = await self.api.pool.accounts_info()
        if not accounts:
            logger.warning(
                "No Twitter accounts configured in database. "
                "Run 'make setup-account' to add accounts.",
            )
        else:
            active_accounts = [a for a in accounts if a.get("active", False)]
            logger.info(
                f"Found {len(accounts)} account(s), {len(active_accounts)} active",
            )

    def _ensure_initialized(self) -> API:
        """Ensure API is initialized."""
        if self.api is None:
            raise TwitterScraperError("Twitter API not initialized. Call initialize() first.")
        return self.api

    async def fetch_user_tweets(
        self,
        username: str,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> tuple[list[TwitterPost], Optional[str]]:
        """
        Fetch tweets from a Twitter user.

        Args:
            username: Twitter username (without @)
            limit: Maximum number of tweets to fetch
            cursor: Cursor for pagination (tweet ID)

        Returns:
            Tuple of (list of TwitterPost objects, next cursor/tweet ID)

        Raises:
            TwitterAccountNotFoundError: User not found
            TwitterRateLimitError: Rate limit exceeded
            TwitterAuthError: Authentication error
        """
        api = self._ensure_initialized()
        limit = limit or self.settings.twitter_max_tweets

        logger.info(
            f"Fetching tweets for @{username} (limit={limit}, cursor={cursor})",
        )

        try:
            # Get user ID from username
            user = await api.user_by_login(username)
            if user is None:
                raise TwitterAccountNotFoundError(f"Twitter user @{username} not found")

            user_profile = self._parse_user(user)

            # Fetch tweets
            tweets_data = await gather(api.user_tweets(user.id, limit=limit))

            posts = []
            next_cursor = None
            found_cursor = cursor is None  # If no cursor, start collecting immediately

            for tweet in tweets_data:
                # If we have a cursor, skip until we find it
                if not found_cursor:
                    if str(tweet.id) == cursor:
                        found_cursor = True
                    continue

                post = self._parse_tweet(tweet, user_profile)
                posts.append(post)

                # Store the tweet ID as next cursor
                next_cursor = str(tweet.id)

                # Check limit
                if len(posts) >= limit:
                    break

            logger.info(
                f"Fetched {len(posts)} tweets for @{username}, next_cursor={next_cursor}",
            )

            return posts, next_cursor

        except TwitterAccountNotFoundError:
            raise
        except Exception as e:
            error_msg = str(e).lower()

            # Check for rate limit
            if "rate limit" in error_msg or "429" in error_msg:
                logger.error(f"Rate limit exceeded while fetching @{username}: {e}")
                raise TwitterRateLimitError(f"Rate limit exceeded: {e}")

            # Check for auth errors
            if "401" in error_msg or "unauthorized" in error_msg or "auth" in error_msg:
                logger.error(f"Authentication error while fetching @{username}: {e}")
                raise TwitterAuthError(f"Authentication error: {e}")

            # Check for user not found
            if "not found" in error_msg or "404" in error_msg:
                logger.error(f"User @{username} not found: {e}")
                raise TwitterAccountNotFoundError(f"User @{username} not found: {e}")

            logger.error(f"Unexpected error fetching @{username}: {e}")
            raise TwitterScraperError(f"Error fetching tweets: {e}")

    def _parse_user(self, user: User) -> TwitterProfile:
        """Parse twscrape User into TwitterProfile."""
        return TwitterProfile(
            id=str(user.id),
            username=user.username,
            display_name=user.displayname or user.username,
            avatar_url=user.profileImageUrl if hasattr(user, "profileImageUrl") else None,
            verified=user.verified if hasattr(user, "verified") else False,
            followers_count=user.followersCount if hasattr(user, "followersCount") else 0,
            following_count=user.friendsCount if hasattr(user, "friendsCount") else 0,
            tweets_count=user.statusesCount if hasattr(user, "statusesCount") else 0,
        )

    def _parse_tweet(self, tweet: Tweet, author: TwitterProfile) -> TwitterPost:
        """Parse twscrape Tweet into TwitterPost."""
        # Extract media URLs
        media_urls = []
        if tweet.media:
            # tweet.media is a Media object with photos, videos, and animated properties
            if hasattr(tweet.media, "photos") and tweet.media.photos:
                for photo in tweet.media.photos:
                    if hasattr(photo, "url") and photo.url:
                        media_urls.append(photo.url)

            if hasattr(tweet.media, "videos") and tweet.media.videos:
                for video in tweet.media.videos:
                    # Get the highest quality video variant
                    if hasattr(video, "variants") and video.variants:
                        # Find the best quality video URL
                        best_url = None
                        best_bitrate = 0
                        for variant in video.variants:
                            if hasattr(variant, "bitrate") and variant.bitrate:
                                if variant.bitrate > best_bitrate:
                                    best_bitrate = variant.bitrate
                                    best_url = variant.url
                            elif hasattr(variant, "url") and variant.url and not best_url:
                                best_url = variant.url
                        if best_url:
                            media_urls.append(best_url)
                    elif hasattr(video, "thumbnailUrl") and video.thumbnailUrl:
                        media_urls.append(video.thumbnailUrl)

            if hasattr(tweet.media, "animated") and tweet.media.animated:
                for gif in tweet.media.animated:
                    if hasattr(gif, "videoUrl") and gif.videoUrl:
                        media_urls.append(gif.videoUrl)
                    elif hasattr(gif, "thumbnailUrl") and gif.thumbnailUrl:
                        media_urls.append(gif.thumbnailUrl)

        # Get view count if available
        views_count = None
        if hasattr(tweet, "viewCount"):
            views_count = tweet.viewCount

        return TwitterPost(
            id=str(tweet.id),
            content=tweet.rawContent or "",
            created_at=tweet.date,
            author=author,
            media_urls=media_urls,
            likes_count=tweet.likeCount or 0,
            retweets_count=tweet.retweetCount or 0,
            replies_count=tweet.replyCount or 0,
            quotes_count=tweet.quoteCount or 0,
            views_count=views_count,
        )

    async def get_user_profile(self, username: str) -> TwitterProfile:
        """
        Get Twitter user profile.

        Args:
            username: Twitter username (without @)

        Returns:
            TwitterProfile object

        Raises:
            TwitterAccountNotFoundError: User not found
        """
        api = self._ensure_initialized()

        try:
            user = await api.user_by_login(username)
            if user is None:
                raise TwitterAccountNotFoundError(f"Twitter user @{username} not found")
            return self._parse_user(user)
        except TwitterAccountNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Error fetching profile for @{username}: {e}")
            raise TwitterScraperError(f"Error fetching profile: {e}")
