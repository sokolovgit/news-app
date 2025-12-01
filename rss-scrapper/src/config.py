"""Configuration management using Pydantic settings."""

from functools import lru_cache
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
    rss_fetcher_queue: str = Field(
        default="sources.rss-fetcher",
        description="Queue name for RSS fetch jobs",
    )
    fetch_results_queue: str = Field(
        default="sources.fetch-results",
        description="Queue name for fetch results",
    )

    # RSS Configuration
    rss_request_timeout: float = Field(
        default=30.0,
        description="Timeout for RSS feed requests in seconds",
        alias="RSS_REQUEST_TIMEOUT",
    )
    rss_user_agent: str = Field(
        default="RSSScrapperBot/1.0 (+https://github.com/yourusername/rss-scrapper)",
        description="User agent for RSS feed requests",
        alias="RSS_USER_AGENT",
    )
    rss_max_entries: int = Field(
        default=50,
        description="Maximum number of entries to fetch per feed",
        alias="RSS_MAX_ENTRIES",
    )

    # Worker Configuration
    worker_concurrency: int = Field(
        default=5,
        description="Number of concurrent jobs to process",
        alias="WORKER_CONCURRENCY",
    )

    # Media upload queue (for enclosures/media in RSS feeds)
    media_upload_queue: str = Field(
        default="media.upload",
        description="Queue name for media upload jobs",
    )

    # S3/MinIO Configuration (optional, for media handling)
    s3_endpoint: Optional[str] = Field(
        default=None,
        description="S3/MinIO endpoint URL",
        alias="S3_ENDPOINT",
    )
    s3_access_key: Optional[str] = Field(
        default=None,
        description="S3 access key",
        alias="S3_ACCESS_KEY",
    )
    s3_secret_key: Optional[str] = Field(
        default=None,
        description="S3 secret key",
        alias="S3_SECRET_KEY",
    )
    s3_bucket: str = Field(
        default="news-app-media",
        description="S3 bucket name for media storage",
        alias="S3_BUCKET",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
