"""Configuration management using Pydantic settings."""

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Redis/BullMQ Configuration
    redis_url: str = Field(
        ...,
        description="Redis connection URL for BullMQ queues",
        alias="REDIS_URL",
    )

    # Queue Names (matching NestJS SourceQueue enum)
    twitter_fetcher_queue: str = Field(
        default="sources.twitter-fetcher",
        description="Queue name for Twitter fetch jobs",
    )
    fetch_results_queue: str = Field(
        default="sources.fetch-results",
        description="Queue name for fetch results",
    )

    # Twitter/twscrape Configuration
    twitter_accounts_db: str = Field(
        default="accounts.db",
        description="Path to twscrape accounts database",
        alias="TWITTER_ACCOUNTS_DB",
    )
    twitter_rate_limit_delay: float = Field(
        default=1.0,
        description="Delay between requests in seconds",
        alias="TWITTER_RATE_LIMIT_DELAY",
    )
    twitter_max_tweets: int = Field(
        default=50,
        description="Maximum number of tweets to fetch per request",
        alias="TWITTER_MAX_TWEETS",
    )

    # Worker Configuration
    worker_concurrency: int = Field(
        default=1,
        description="Number of concurrent jobs to process",
        alias="WORKER_CONCURRENCY",
    )

    # S3/MinIO Configuration
    s3_endpoint: str = Field(
        default="http://localhost:9001",
        description="S3/MinIO endpoint URL",
        alias="S3_ENDPOINT",
    )
    s3_access_key: str = Field(
        default="admin",
        description="S3 access key",
        alias="S3_ACCESS_KEY",
    )
    s3_secret_key: str = Field(
        default="password",
        description="S3 secret key",
        alias="S3_SECRET_KEY",
    )
    s3_bucket: str = Field(
        default="news-app-media",
        description="S3 bucket name for media storage",
        alias="S3_BUCKET",
    )

    # Media upload queue
    media_upload_queue: str = Field(
        default="media.upload",
        description="Queue name for media upload jobs",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    def get_accounts_db_path(self) -> Path:
        """
        Get Path object for accounts database.

        Supports both absolute and relative paths. Relative paths are resolved
        relative to the project root (where .env file is located).
        """
        path = Path(self.twitter_accounts_db)

        # If path is absolute, use it as-is
        if path.is_absolute():
            return path

        # For relative paths, resolve relative to project root
        project_root = self._find_project_root()
        return (project_root / path).resolve()

    @staticmethod
    def _find_project_root() -> Path:
        """
        Find the project root directory by looking for .env or pyproject.toml.

        Returns:
            Path to project root, or current working directory if not found
        """
        current = Path.cwd()

        # Check current directory and parent directories
        for path in [current] + list(current.parents):
            if (path / ".env").exists() or (path / "pyproject.toml").exists():
                return path

        # Fallback to current working directory
        return current


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
