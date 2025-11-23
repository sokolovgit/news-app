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
    instagram_fetcher_queue: str = Field(
        default="sources.instagram-fetcher",
        description="Queue name for Instagram fetch jobs",
    )
    fetch_results_queue: str = Field(
        default="sources.fetch-results",
        description="Queue name for fetch results",
    )

    # Instaloader Configuration
    instagram_session_path: Optional[str] = Field(
        default=None,
        description="Path to Instagram session file or directory containing session files. "
        "Supports both absolute and relative paths. Relative paths are resolved relative to "
        "the project root. If a directory is provided, all session files will be tried until one works.",
        alias="INSTAGRAM_SESSION_PATH",
    )
    instagram_rate_limit_delay: float = Field(
        default=1.0,
        description="Delay between requests in seconds",
        alias="INSTAGRAM_RATE_LIMIT_DELAY",
    )
    instagram_download_videos: bool = Field(
        default=False,
        description="Whether to download videos (default: False, only URLs)",
        alias="INSTAGRAM_DOWNLOAD_VIDEOS",
    )
    instagram_download_pictures: bool = Field(
        default=False,
        description="Whether to download pictures (default: False, only URLs)",
        alias="INSTAGRAM_DOWNLOAD_PICTURES",
    )

    # Worker Configuration
    worker_concurrency: int = Field(
        default=1,
        description="Number of concurrent jobs to process",
        alias="WORKER_CONCURRENCY",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    def get_session_file_path(self) -> Optional[Path]:
        """
        Get Path object for session file if configured.
        
        Supports both absolute and relative paths. Relative paths are resolved
        relative to the project root (where .env file is located).
        """
        if not self.instagram_session_path:
            return None
        
        path = Path(self.instagram_session_path)
        
        # If path is absolute, use it as-is
        if path.is_absolute():
            return path
        
        # For relative paths, resolve relative to project root
        # Find project root by looking for .env file or pyproject.toml
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
