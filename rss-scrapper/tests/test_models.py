"""Tests for Pydantic models."""

from datetime import datetime, timezone

import pytest

from src.models import (
    CollectorJobData,
    CollectorJobMetadata,
    FetchedPost,
    PostAuthor,
    PostMetrics,
    ResultJobData,
    ResultJobMetadata,
    SourceMetadata,
)


class TestFetchedPost:
    """Tests for FetchedPost model."""

    def test_fetched_post_creation(self):
        """Test creating a FetchedPost with all fields."""
        author = PostAuthor(
            username="test_author",
            displayName="Test Author",
            avatarUrl="https://example.com/avatar.jpg",
        )

        post = FetchedPost(
            externalId="post-123",
            content="Test content",
            mediaUrls=["https://example.com/image.jpg"],
            publishedAt="2025-12-01T10:00:00Z",
            author=author,
            metrics=PostMetrics(likes=10, comments=5),
            link="https://example.com/article",
            title="Test Title",
        )

        assert post.externalId == "post-123"
        assert post.content == "Test content"
        assert len(post.mediaUrls) == 1
        assert post.author.username == "test_author"
        assert post.link == "https://example.com/article"
        assert post.title == "Test Title"

    def test_fetched_post_alias_serialization(self):
        """Test that aliases are used when serializing."""
        author = PostAuthor(username="test", displayName="Test")
        post = FetchedPost(
            externalId="123",
            content="content",
            mediaUrls=[],
            publishedAt="2025-12-01T00:00:00Z",
            author=author,
        )

        data = post.model_dump(by_alias=True)

        assert "externalId" in data
        assert "mediaUrls" in data
        assert "publishedAt" in data


class TestCollectorJobData:
    """Tests for CollectorJobData model."""

    def test_collector_job_data_creation(self):
        """Test creating CollectorJobData."""
        metadata = CollectorJobMetadata(
            orchestratorJobId="orch-123",
            scheduledAt=datetime.now(timezone.utc),
            sourceMetadata=SourceMetadata(),
        )

        job_data = CollectorJobData(
            sourceId="src-123",
            sourceType="rss",
            externalId="https://example.com/feed.xml",
            priority=1,
            metadata=metadata,
        )

        assert job_data.sourceId == "src-123"
        assert job_data.sourceType == "rss"
        assert job_data.externalId == "https://example.com/feed.xml"
        assert job_data.cursor is None
        assert job_data.limit is None

    def test_collector_job_data_with_cursor(self):
        """Test CollectorJobData with cursor and limit."""
        metadata = CollectorJobMetadata(
            orchestratorJobId="orch-123",
            scheduledAt=datetime.now(timezone.utc),
            sourceMetadata=SourceMetadata(),
        )

        job_data = CollectorJobData(
            sourceId="src-123",
            sourceType="rss",
            externalId="https://example.com/feed.xml",
            cursor="last-entry-id",
            limit=50,
            priority=2,
            metadata=metadata,
        )

        assert job_data.cursor == "last-entry-id"
        assert job_data.limit == 50


class TestResultJobData:
    """Tests for ResultJobData model."""

    def test_success_result_job_data(self):
        """Test creating a success ResultJobData."""
        author = PostAuthor(username="test", displayName="Test")
        posts = [
            FetchedPost(
                externalId="1",
                content="Content 1",
                mediaUrls=[],
                publishedAt="2025-12-01T00:00:00Z",
                author=author,
            ),
        ]

        metadata = ResultJobMetadata(
            collectorJobId="col-123",
            orchestratorJobId="orch-123",
            fetchedAt=datetime.now(timezone.utc),
        )

        result = ResultJobData(
            sourceId="src-123",
            sourceType="rss",
            status="success",
            posts=posts,
            nextCursor="next-123",
            processingTime=1500,
            metadata=metadata,
        )

        assert result.status == "success"
        assert len(result.posts) == 1
        assert result.error is None
        assert result.nextCursor == "next-123"

