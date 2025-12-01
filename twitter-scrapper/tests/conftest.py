"""Pytest configuration and fixtures for Twitter scrapper tests."""

import pytest
from unittest.mock import MagicMock, AsyncMock

from src.config import Settings


@pytest.fixture
def mock_settings():
    """Create mock settings for testing."""
    settings = MagicMock(spec=Settings)
    settings.redis_url = "redis://localhost:6379"
    settings.twitter_fetcher_queue = "sources.twitter-fetcher"
    settings.fetch_results_queue = "sources.fetch-results"
    settings.media_upload_queue = "media.upload"
    settings.twitter_accounts_db = "test_accounts.db"
    settings.twitter_rate_limit_delay = 0.1
    settings.twitter_max_tweets = 10
    settings.worker_concurrency = 1
    settings.s3_endpoint = "http://localhost:9001"
    settings.s3_access_key = "test"
    settings.s3_secret_key = "test"
    settings.s3_bucket = "test-bucket"
    return settings


@pytest.fixture
def mock_twitter_profile():
    """Create mock Twitter profile for testing."""
    from src.scraper.twitter_scraper import TwitterProfile

    return TwitterProfile(
        id="12345",
        username="testuser",
        display_name="Test User",
        avatar_url="https://pbs.twimg.com/profile_images/test.jpg",
        verified=False,
        followers_count=1000,
        following_count=500,
        tweets_count=100,
    )


@pytest.fixture
def mock_twitter_post(mock_twitter_profile):
    """Create mock Twitter post for testing."""
    from datetime import datetime
    from src.scraper.twitter_scraper import TwitterPost

    return TwitterPost(
        id="1234567890",
        content="Test tweet content #test",
        created_at=datetime(2024, 1, 15, 12, 0, 0),
        author=mock_twitter_profile,
        media_urls=["https://pbs.twimg.com/media/test.jpg"],
        likes_count=100,
        retweets_count=50,
        replies_count=25,
        quotes_count=10,
        views_count=5000,
    )

