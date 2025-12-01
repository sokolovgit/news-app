"""Pytest configuration and fixtures."""

import pytest


@pytest.fixture
def sample_rss_feed():
    """Sample RSS feed XML for testing."""
    return """<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <link>https://example.com</link>
    <description>A test feed for unit testing</description>
    <pubDate>Mon, 01 Dec 2025 00:00:00 GMT</pubDate>
    <item>
      <title>First Test Article</title>
      <link>https://example.com/article/1</link>
      <description>This is the first test article content.</description>
      <pubDate>Mon, 01 Dec 2025 10:00:00 GMT</pubDate>
      <guid>https://example.com/article/1</guid>
    </item>
    <item>
      <title>Second Test Article</title>
      <link>https://example.com/article/2</link>
      <description>This is the second test article content.</description>
      <pubDate>Mon, 01 Dec 2025 09:00:00 GMT</pubDate>
      <guid>https://example.com/article/2</guid>
    </item>
  </channel>
</rss>"""


@pytest.fixture
def sample_atom_feed():
    """Sample Atom feed XML for testing."""
    return """<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Atom Feed</title>
  <link href="https://example.com"/>
  <updated>2025-12-01T00:00:00Z</updated>
  <id>https://example.com/feed</id>
  <entry>
    <title>First Atom Entry</title>
    <link href="https://example.com/entry/1"/>
    <id>https://example.com/entry/1</id>
    <updated>2025-12-01T10:00:00Z</updated>
    <summary>This is the first Atom entry.</summary>
  </entry>
</feed>"""


@pytest.fixture
def sample_rss_with_enclosures():
    """Sample RSS feed with media enclosures."""
    return """<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Media Feed</title>
    <link>https://example.com</link>
    <description>A feed with media</description>
    <item>
      <title>Article with Image</title>
      <link>https://example.com/article/1</link>
      <description>Article with an image.</description>
      <pubDate>Mon, 01 Dec 2025 10:00:00 GMT</pubDate>
      <guid>https://example.com/article/1</guid>
      <enclosure url="https://example.com/image.jpg" type="image/jpeg" length="12345"/>
    </item>
    <item>
      <title>Article with Video</title>
      <link>https://example.com/article/2</link>
      <description>Article with a video.</description>
      <pubDate>Mon, 01 Dec 2025 09:00:00 GMT</pubDate>
      <guid>https://example.com/article/2</guid>
      <enclosure url="https://example.com/video.mp4" type="video/mp4" length="123456"/>
    </item>
  </channel>
</rss>"""
