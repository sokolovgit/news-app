"""RSS feed scraper using feedparser."""

import html
import logging
import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

import feedparser
import httpx

from src.config import Settings

logger = logging.getLogger(__name__)


def strip_html_tags(text: str) -> str:
    """
    Remove HTML tags from text and decode HTML entities.

    Args:
        text: Text potentially containing HTML

    Returns:
        Clean text without HTML tags
    """
    if not text:
        return ""

    # Remove HTML tags
    clean = re.sub(r"<[^>]+>", "", text)

    # Decode HTML entities (e.g., &amp; -> &, &lt; -> <)
    clean = html.unescape(clean)

    # Normalize whitespace
    clean = re.sub(r"\s+", " ", clean).strip()

    return clean


@dataclass
class RssFeedEntry:
    """Parsed RSS feed entry."""

    id: str  # GUID or link as fallback
    title: str
    content: str
    link: str
    published: Optional[datetime]
    author: Optional[str]
    author_email: Optional[str]
    enclosures: list[dict[str, str]]  # List of media enclosures
    tags: list[str]


@dataclass
class RssFeedInfo:
    """Feed metadata."""

    title: str
    link: str
    description: str
    author: Optional[str]
    image_url: Optional[str]


@dataclass
class RssFetchResult:
    """Result of RSS feed fetch."""

    feed_info: RssFeedInfo
    entries: list[RssFeedEntry]
    next_cursor: Optional[str]  # Last processed entry ID for pagination


class RssParseError(Exception):
    """Error parsing RSS feed."""

    pass


class RssFetchError(Exception):
    """Error fetching RSS feed."""

    pass


class RssScraper:
    """Wrapper around feedparser for fetching RSS/Atom feeds."""

    def __init__(self, settings: Settings):
        """Initialize RSS scraper with settings."""
        self.settings = settings
        self.http_client = self._create_http_client()

    def _create_http_client(self) -> httpx.Client:
        """Create and configure HTTP client."""
        return httpx.Client(
            timeout=self.settings.rss_request_timeout,
            headers={
                "User-Agent": self.settings.rss_user_agent,
                "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
            },
            follow_redirects=True,
        )

    def fetch_feed(
        self,
        feed_url: str,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> tuple[list[RssFeedEntry], RssFeedInfo, Optional[str]]:
        """
        Fetch and parse RSS/Atom feed.

        Args:
            feed_url: URL of the RSS/Atom feed
            limit: Maximum number of entries to return
            cursor: Last processed entry ID (entries after this will be skipped)

        Returns:
            Tuple of (list of entries, feed info, next cursor)

        Raises:
            RssFetchError: Error fetching the feed
            RssParseError: Error parsing the feed
        """
        logger.info(f"Fetching RSS feed: {feed_url} (limit={limit}, cursor={cursor})")

        try:
            # Fetch the feed content
            response = self.http_client.get(feed_url)
            response.raise_for_status()
            feed_content = response.text

            # Parse the feed using feedparser
            parsed = feedparser.parse(feed_content)

            # Check for parsing errors
            if parsed.bozo and parsed.bozo_exception:
                # bozo=1 means there was a problem, but feedparser may still have parsed it
                logger.warning(
                    f"Feed parsing issue for {feed_url}: {parsed.bozo_exception}. "
                    "Attempting to continue with partial data.",
                )

            # Check if we got any entries
            if not parsed.feed:
                raise RssParseError(f"Failed to parse feed from {feed_url}: No feed data found")

            # Extract feed info
            feed_info = self._extract_feed_info(parsed.feed, feed_url)

            # Extract entries
            entries = []
            next_cursor = None
            found_cursor = cursor is None  # If no cursor, start collecting immediately

            for entry in parsed.entries:
                entry_id = self._get_entry_id(entry)

                # If we have a cursor, skip until we find it
                if not found_cursor:
                    if entry_id == cursor:
                        found_cursor = True
                    continue

                parsed_entry = self._parse_entry(entry)
                entries.append(parsed_entry)
                next_cursor = entry_id

                # Check limit
                if limit and len(entries) >= limit:
                    break

            logger.info(
                f"Fetched {len(entries)} entries from {feed_url}, next_cursor={next_cursor}",
            )

            return entries, feed_info, next_cursor

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching {feed_url}: {e}")
            raise RssFetchError(f"HTTP error: {e.response.status_code}") from e
        except httpx.RequestError as e:
            logger.error(f"Request error fetching {feed_url}: {e}")
            raise RssFetchError(f"Request error: {str(e)}") from e
        except RssParseError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching {feed_url}: {e}")
            raise RssFetchError(f"Unexpected error: {str(e)}") from e

    def _extract_feed_info(self, feed: Any, feed_url: str) -> RssFeedInfo:
        """Extract feed metadata."""
        # Get and clean title
        raw_title = getattr(feed, "title", "") or feed_url
        clean_title = strip_html_tags(raw_title)

        # Get and clean description
        raw_description = getattr(feed, "description", "") or getattr(feed, "subtitle", "") or ""
        clean_description = strip_html_tags(raw_description)

        return RssFeedInfo(
            title=clean_title,
            link=getattr(feed, "link", "") or feed_url,
            description=clean_description,
            author=self._get_feed_author(feed),
            image_url=self._get_feed_image(feed),
        )

    def _get_feed_author(self, feed: Any) -> Optional[str]:
        """Get feed author name."""
        # Try different author fields
        if hasattr(feed, "author_detail") and feed.author_detail:
            return feed.author_detail.get("name") or feed.author_detail.get("email")
        if hasattr(feed, "author"):
            return feed.author
        if hasattr(feed, "publisher"):
            return feed.publisher
        return None

    def _get_feed_image(self, feed: Any) -> Optional[str]:
        """Get feed image URL."""
        # Try image
        if hasattr(feed, "image") and feed.image:
            if hasattr(feed.image, "href"):
                return feed.image.href
            if hasattr(feed.image, "url"):
                return feed.image.url
        # Try logo (Atom)
        if hasattr(feed, "logo"):
            return feed.logo
        # Try icon (Atom)
        if hasattr(feed, "icon"):
            return feed.icon
        return None

    def _get_entry_id(self, entry: Any) -> str:
        """Get unique identifier for entry."""
        # Prefer GUID/ID
        if hasattr(entry, "id") and entry.id:
            return entry.id
        # Fallback to link
        if hasattr(entry, "link") and entry.link:
            return entry.link
        # Fallback to title if nothing else
        if hasattr(entry, "title") and entry.title:
            return entry.title
        return str(hash(str(entry)))

    def _parse_entry(self, entry: Any) -> RssFeedEntry:
        """Parse a feed entry into RssFeedEntry."""
        # Get and clean title (strip HTML tags)
        raw_title = getattr(entry, "title", "") or ""
        clean_title = strip_html_tags(raw_title)

        return RssFeedEntry(
            id=self._get_entry_id(entry),
            title=clean_title,
            content=self._get_entry_content(entry),
            link=getattr(entry, "link", "") or "",
            published=self._parse_published_date(entry),
            author=self._get_entry_author(entry),
            author_email=self._get_entry_author_email(entry),
            enclosures=self._get_enclosures(entry),
            tags=self._get_tags(entry),
        )

    def _get_entry_content(self, entry: Any) -> str:
        """Get entry content, trying various fields."""
        # Try content field first (RSS 2.0 content:encoded or Atom content)
        if hasattr(entry, "content") and entry.content:
            # content is a list, get the first one
            if isinstance(entry.content, list) and len(entry.content) > 0:
                content = entry.content[0]
                if hasattr(content, "value"):
                    return content.value
                if isinstance(content, dict):
                    return content.get("value", "")

        # Try summary/description
        if hasattr(entry, "summary") and entry.summary:
            return entry.summary

        if hasattr(entry, "description") and entry.description:
            return entry.description

        return ""

    def _parse_published_date(self, entry: Any) -> Optional[datetime]:
        """Parse published date from entry."""
        # Try published_parsed (struct_time)
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                from time import mktime

                return datetime.fromtimestamp(mktime(entry.published_parsed))
            except (ValueError, TypeError, OverflowError):
                pass

        # Try updated_parsed as fallback
        if hasattr(entry, "updated_parsed") and entry.updated_parsed:
            try:
                from time import mktime

                return datetime.fromtimestamp(mktime(entry.updated_parsed))
            except (ValueError, TypeError, OverflowError):
                pass

        # Try created_parsed
        if hasattr(entry, "created_parsed") and entry.created_parsed:
            try:
                from time import mktime

                return datetime.fromtimestamp(mktime(entry.created_parsed))
            except (ValueError, TypeError, OverflowError):
                pass

        return None

    def _get_entry_author(self, entry: Any) -> Optional[str]:
        """Get entry author name."""
        if hasattr(entry, "author_detail") and entry.author_detail:
            return entry.author_detail.get("name")
        if hasattr(entry, "author") and entry.author:
            return entry.author
        return None

    def _get_entry_author_email(self, entry: Any) -> Optional[str]:
        """Get entry author email."""
        if hasattr(entry, "author_detail") and entry.author_detail:
            return entry.author_detail.get("email")
        return None

    def _get_enclosures(self, entry: Any) -> list[dict[str, str]]:
        """Get media enclosures from entry."""
        enclosures = []

        if hasattr(entry, "enclosures") and entry.enclosures:
            for enc in entry.enclosures:
                enclosure = {
                    "url": enc.get("href") or enc.get("url", ""),
                    "type": enc.get("type", ""),
                    "length": enc.get("length", ""),
                }
                if enclosure["url"]:
                    enclosures.append(enclosure)

        # Also check for media content (Media RSS)
        if hasattr(entry, "media_content") and entry.media_content:
            for media in entry.media_content:
                enclosure = {
                    "url": media.get("url", ""),
                    "type": media.get("type", ""),
                    "length": "",
                }
                if enclosure["url"]:
                    enclosures.append(enclosure)

        # Check for media thumbnails
        if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
            for thumb in entry.media_thumbnail:
                enclosure = {
                    "url": thumb.get("url", ""),
                    "type": "image/jpeg",  # Thumbnails are usually images
                    "length": "",
                }
                if enclosure["url"]:
                    enclosures.append(enclosure)

        return enclosures

    def _get_tags(self, entry: Any) -> list[str]:
        """Get tags/categories from entry."""
        tags = []

        if hasattr(entry, "tags") and entry.tags:
            for tag in entry.tags:
                if hasattr(tag, "term") and tag.term:
                    tags.append(tag.term)
                elif hasattr(tag, "label") and tag.label:
                    tags.append(tag.label)

        return tags

    def close(self) -> None:
        """Close the HTTP client."""
        self.http_client.close()
