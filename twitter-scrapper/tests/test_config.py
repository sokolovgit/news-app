"""Tests for configuration module."""

import pytest
from pathlib import Path
from unittest.mock import patch


class TestSettings:
    """Tests for Settings class."""

    def test_default_queue_names(self, mock_settings):
        """Test that default queue names are set correctly."""
        assert mock_settings.twitter_fetcher_queue == "sources.twitter-fetcher"
        assert mock_settings.fetch_results_queue == "sources.fetch-results"
        assert mock_settings.media_upload_queue == "media.upload"

    def test_default_twitter_config(self, mock_settings):
        """Test that default Twitter configuration is set."""
        assert mock_settings.twitter_rate_limit_delay == 0.1
        assert mock_settings.twitter_max_tweets == 10

    def test_worker_concurrency(self, mock_settings):
        """Test that worker concurrency is set."""
        assert mock_settings.worker_concurrency == 1


class TestGetSettings:
    """Tests for get_settings function."""

    @patch.dict("os.environ", {"REDIS_URL": "redis://testhost:6379"})
    def test_get_settings_from_env(self):
        """Test that settings are loaded from environment variables."""
        from src.config import Settings

        # Clear the cache to ensure fresh settings
        from src.config import get_settings
        get_settings.cache_clear()

        settings = Settings()
        assert settings.redis_url == "redis://testhost:6379"

