"""Tests for configuration module."""

import os

import pytest


class TestSettings:
    """Tests for Settings class."""

    def test_settings_with_required_env_vars(self, monkeypatch):
        """Test that settings can be loaded with required environment variables."""
        # Clear the lru_cache before test
        from src.config import get_settings, Settings

        get_settings.cache_clear()

        # Set required environment variable
        monkeypatch.setenv("REDIS_URL", "redis://localhost:6379")

        settings = get_settings()

        assert settings.redis_url == "redis://localhost:6379"
        assert settings.rss_fetcher_queue == "sources.rss-fetcher"
        assert settings.fetch_results_queue == "sources.fetch-results"

    def test_settings_defaults(self, monkeypatch):
        """Test default values are applied correctly."""
        from src.config import get_settings

        get_settings.cache_clear()

        monkeypatch.setenv("REDIS_URL", "redis://localhost:6379")

        settings = get_settings()

        assert settings.rss_request_timeout == 30.0
        assert settings.rss_max_entries == 50
        assert settings.worker_concurrency == 5

    def test_settings_custom_values(self, monkeypatch):
        """Test custom environment values are loaded."""
        from src.config import get_settings

        get_settings.cache_clear()

        monkeypatch.setenv("REDIS_URL", "redis://custom:6380")
        monkeypatch.setenv("RSS_REQUEST_TIMEOUT", "60")
        monkeypatch.setenv("WORKER_CONCURRENCY", "10")

        settings = get_settings()

        assert settings.redis_url == "redis://custom:6380"
        assert settings.rss_request_timeout == 60.0
        assert settings.worker_concurrency == 10

