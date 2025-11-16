"""Test configuration and fixtures."""

import pytest


@pytest.fixture
def sample_username() -> str:
    """Return a sample Instagram username for testing."""
    return "test_user"
