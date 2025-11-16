"""Tests for data models."""

from datetime import datetime

from src.models import InstagramPost, InstagramProfile, ScrapeJobData, ScrapeJobResult


def test_instagram_post_creation() -> None:
    """Test creating an InstagramPost model."""
    post = InstagramPost(
        shortcode="ABC123",
        caption="Test post",
        timestamp=datetime.now(),
        likes_count=100,
        comments_count=10,
        media_url="https://example.com/image.jpg",
        is_video=False,
        hashtags=["test", "instagram"],
    )

    assert post.shortcode == "ABC123"
    assert post.caption == "Test post"
    assert post.likes_count == 100
    assert len(post.hashtags) == 2


def test_instagram_profile_creation() -> None:
    """Test creating an InstagramProfile model."""
    profile = InstagramProfile(
        username="test_user",
        full_name="Test User",
        biography="Test bio",
        followers_count=1000,
        following_count=500,
        posts_count=50,
        is_verified=True,
    )

    assert profile.username == "test_user"
    assert profile.followers_count == 1000
    assert profile.is_verified is True


def test_scrape_job_data_defaults() -> None:
    """Test ScrapeJobData model defaults."""
    job_data = ScrapeJobData(username="test_user")

    assert job_data.username == "test_user"
    assert job_data.max_posts == 10
    assert job_data.include_profile is True


def test_scrape_job_result_creation() -> None:
    """Test creating a ScrapeJobResult model."""
    profile = InstagramProfile(username="test_user", posts_count=0)

    result = ScrapeJobResult(username="test_user", profile=profile, posts=[], success=True)

    assert result.username == "test_user"
    assert result.success is True
    assert result.error is None
    assert isinstance(result.scraped_at, datetime)
