"""Tests for configuration module."""

from src.config import Settings, get_settings


def test_settings_defaults() -> None:
    """Test that settings have correct default values."""
    settings = Settings()

    assert settings.redis_host == "localhost"
    assert settings.redis_port == 6379
    assert settings.redis_db == 0
    assert settings.queue_name == "instagram-scraper"
    assert settings.concurrency == 2
    assert settings.log_level == "INFO"


def test_redis_url_without_password() -> None:
    """Test Redis URL generation without password."""
    settings = Settings(redis_host="localhost", redis_port=6379, redis_db=0)

    assert settings.redis_url == "redis://localhost:6379/0"


def test_redis_url_with_password() -> None:
    """Test Redis URL generation with password."""
    settings = Settings(
        redis_host="localhost", redis_port=6379, redis_db=0, redis_password="secret"
    )

    assert settings.redis_url == "redis://:secret@localhost:6379/0"


def test_get_settings_singleton() -> None:
    """Test that get_settings returns the same instance."""
    settings1 = get_settings()
    settings2 = get_settings()

    assert settings1 is settings2
