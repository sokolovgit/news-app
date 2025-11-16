"""Configuration management using Pydantic settings."""

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Redis Configuration
    redis_host: str = Field(default="localhost", description="Redis server host")
    redis_port: int = Field(default=6379, description="Redis server port")
    redis_db: int = Field(default=0, description="Redis database number")
    redis_password: Optional[str] = Field(default=None, description="Redis password")

    # BullMQ Configuration
    queue_name: str = Field(default="instagram-scraper", description="BullMQ queue name")
    concurrency: int = Field(default=2, description="Number of concurrent workers")

    # Instagram Configuration
    instagram_username: Optional[str] = Field(
        default=None, description="Instagram username for authentication"
    )
    instagram_password: Optional[str] = Field(
        default=None, description="Instagram password for authentication"
    )
    session_file_path: str = Field(
        default="./session",
        description="Path to store Instagram session files",
    )

    # Logging
    log_level: str = Field(default="INFO", description="Logging level")

    @property
    def redis_url(self) -> str:
        """Generate Redis connection URL."""
        if self.redis_password:
            return (
                f"redis://:{self.redis_password}@{self.redis_host}:"
                f"{self.redis_port}/{self.redis_db}"
            )
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
