"""Pydantic models matching NestJS TypeScript types for queue integration."""

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


class SourceMetadata(BaseModel):
    """Source metadata from collector job."""

    lastFetchedAt: Optional[datetime] = Field(None, alias="lastFetchedAt")
    lastCursor: Optional[str] = Field(None, alias="lastCursor")
    fetchConfig: Optional[dict[str, Any]] = Field(None, alias="fetchConfig")

    class Config:
        populate_by_name = True


class CollectorJobMetadata(BaseModel):
    """Metadata from collector job."""

    orchestratorJobId: str = Field(..., alias="orchestratorJobId")
    scheduledAt: datetime = Field(..., alias="scheduledAt")
    sourceMetadata: SourceMetadata = Field(..., alias="sourceMetadata")

    class Config:
        populate_by_name = True


class CollectorJobData(BaseModel):
    """Job data for collector queues (Instagram, Telegram)."""

    sourceId: str = Field(..., alias="sourceId")
    sourceType: Literal["instagram", "telegram"] = Field(..., alias="sourceType")
    externalId: str = Field(..., alias="externalId")
    cursor: Optional[str] = None
    limit: Optional[int] = None
    priority: int
    metadata: CollectorJobMetadata

    class Config:
        populate_by_name = True


class PostAuthor(BaseModel):
    """Author information for a fetched post."""

    username: str
    displayName: str
    avatarUrl: Optional[str] = None


class PostMetrics(BaseModel):
    """Engagement metrics for a post."""

    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None


class FetchedPost(BaseModel):
    """Post data structure from collectors."""

    externalId: str = Field(..., alias="externalId")
    content: str
    mediaUrls: list[str] = Field(..., alias="mediaUrls")
    publishedAt: str = Field(..., alias="publishedAt")  # ISO date string
    author: PostAuthor
    metrics: Optional[PostMetrics] = None

    class Config:
        populate_by_name = True


class ErrorData(BaseModel):
    """Error information for failed jobs."""

    code: str
    message: str
    retryable: bool


class ResultJobMetadata(BaseModel):
    """Metadata for result job."""

    collectorJobId: str = Field(..., alias="collectorJobId")
    orchestratorJobId: str = Field(..., alias="orchestratorJobId")
    fetchedAt: datetime = Field(..., alias="fetchedAt")

    class Config:
        populate_by_name = True


class ResultJobData(BaseModel):
    """Job data for results queue."""

    sourceId: str = Field(..., alias="sourceId")
    sourceType: Literal["instagram", "telegram"] = Field(..., alias="sourceType")
    status: Literal["success", "error"]
    posts: Optional[list[FetchedPost]] = None
    nextCursor: Optional[str] = Field(None, alias="nextCursor")
    error: Optional[ErrorData] = None
    processingTime: int = Field(..., alias="processingTime")  # Milliseconds
    metadata: ResultJobMetadata

    class Config:
        populate_by_name = True
