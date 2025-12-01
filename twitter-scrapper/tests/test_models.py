"""Tests for models module."""

import pytest
from datetime import datetime


class TestCollectorJobData:
    """Tests for CollectorJobData model."""

    def test_valid_job_data(self):
        """Test creating valid collector job data."""
        from src.models import CollectorJobData, CollectorJobMetadata, SourceMetadata

        metadata = CollectorJobMetadata(
            orchestratorJobId="orch-123",
            scheduledAt=datetime.now(),
            sourceMetadata=SourceMetadata(),
        )

        job_data = CollectorJobData(
            sourceId="src-123",
            sourceType="twitter",
            externalId="testuser",
            priority=1,
            metadata=metadata,
        )

        assert job_data.sourceId == "src-123"
        assert job_data.sourceType == "twitter"
        assert job_data.externalId == "testuser"
        assert job_data.priority == 1

    def test_job_data_with_optional_fields(self):
        """Test creating job data with optional fields."""
        from src.models import CollectorJobData, CollectorJobMetadata, SourceMetadata

        metadata = CollectorJobMetadata(
            orchestratorJobId="orch-123",
            scheduledAt=datetime.now(),
            sourceMetadata=SourceMetadata(),
        )

        job_data = CollectorJobData(
            sourceId="src-123",
            sourceType="twitter",
            externalId="testuser",
            cursor="cursor-123",
            limit=50,
            priority=1,
            metadata=metadata,
        )

        assert job_data.cursor == "cursor-123"
        assert job_data.limit == 50


class TestFetchedPost:
    """Tests for FetchedPost model."""

    def test_valid_fetched_post(self):
        """Test creating valid fetched post."""
        from src.models import FetchedPost, PostAuthor, PostMetrics

        author = PostAuthor(
            username="testuser",
            displayName="Test User",
            avatarUrl="https://example.com/avatar.jpg",
        )

        metrics = PostMetrics(
            likes=100,
            comments=50,
            shares=25,
        )

        post = FetchedPost(
            externalId="tweet-123",
            content="Test tweet content",
            mediaUrls=["https://example.com/image.jpg"],
            publishedAt="2024-01-15T12:00:00",
            author=author,
            metrics=metrics,
        )

        assert post.externalId == "tweet-123"
        assert post.content == "Test tweet content"
        assert len(post.mediaUrls) == 1
        assert post.author.username == "testuser"
        assert post.metrics.likes == 100


class TestResultJobData:
    """Tests for ResultJobData model."""

    def test_success_result(self):
        """Test creating success result."""
        from src.models import ResultJobData, ResultJobMetadata, FetchedPost, PostAuthor

        metadata = ResultJobMetadata(
            collectorJobId="coll-123",
            orchestratorJobId="orch-123",
            fetchedAt=datetime.now(),
        )

        author = PostAuthor(
            username="testuser",
            displayName="Test User",
        )

        post = FetchedPost(
            externalId="tweet-123",
            content="Test",
            mediaUrls=[],
            publishedAt="2024-01-15T12:00:00",
            author=author,
        )

        result = ResultJobData(
            sourceId="src-123",
            sourceType="twitter",
            status="success",
            posts=[post],
            processingTime=1000,
            metadata=metadata,
        )

        assert result.status == "success"
        assert len(result.posts) == 1
        assert result.error is None

    def test_error_result(self):
        """Test creating error result."""
        from src.models import ResultJobData, ResultJobMetadata, ErrorData

        metadata = ResultJobMetadata(
            collectorJobId="coll-123",
            orchestratorJobId="orch-123",
            fetchedAt=datetime.now(),
        )

        error = ErrorData(
            code="RATE_LIMIT_ERROR",
            message="Too many requests",
            retryable=True,
        )

        result = ResultJobData(
            sourceId="src-123",
            sourceType="twitter",
            status="error",
            error=error,
            processingTime=500,
            metadata=metadata,
        )

        assert result.status == "error"
        assert result.posts is None
        assert result.error.code == "RATE_LIMIT_ERROR"

