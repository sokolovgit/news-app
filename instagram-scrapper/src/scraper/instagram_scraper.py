"""Instagram scraper using instaloader."""

import logging
from pathlib import Path
from typing import Optional

import instaloader

from src.config import Settings

logger = logging.getLogger(__name__)


class InstagramScraper:
    """Wrapper around instaloader for fetching Instagram posts."""

    def __init__(self, settings: Settings):
        """Initialize Instagram scraper with settings."""
        self.settings = settings
        self.loader = self._create_loader()

    def _create_loader(self) -> instaloader.Instaloader:
        """Create and configure Instaloader instance."""
        loader = instaloader.Instaloader(
            download_videos=self.settings.instagram_download_videos,
            download_pictures=self.settings.instagram_download_pictures,
            download_geotags=False,
            download_comments=False,
            save_metadata=False,
            compress_json=False,
            post_metadata_txt_pattern="",
            max_connection_attempts=3,
        )

        # Load session if available
        session_path = self.settings.get_session_file_path()
        if session_path:

            self._load_sessions_from_directory(loader, session_path)

        return loader

    def _load_sessions_from_directory(
        self, loader: instaloader.Instaloader, session_dir: Path
    ) -> None:
        """
        Load sessions from a directory, trying each one until one works.

        Args:
            loader: Instaloader instance to load sessions into
            session_dir: Directory containing session files
        """
        # Find all session files (files without extensions, as instaloader saves them)
        session_files = [
            f for f in session_dir.iterdir() if f.is_file() and not f.name.startswith(".")
        ]

        if not session_files:
            logger.warning(
                f"No session files found in directory: {session_dir}. "
                "Continuing without authentication.",
            )
            return

        logger.info(
            f"Found {len(session_files)} session file(s) in {session_dir}. "
            "Attempting to load sessions...",
        )

        # Try each session until one works
        failed_sessions = []
        for session_file in session_files:
            try:
                # load_session_from_file expects: username (for internal use) and filename (full path)
                loader.load_session_from_file(
                    session_file.stem,  # username (without extension)
                    str(session_file),  # full path to session file
                )
                logger.info(
                    f"✓ Successfully loaded Instagram session: {session_file.name}",
                )

                # Verify session is still valid by checking if we're logged in
                if self._verify_session(loader):
                    logger.info(
                        f"✓ Session {session_file.name} is valid and authenticated",
                    )
                    return  # Successfully loaded and verified, stop trying
                else:
                    logger.warning(
                        f"⚠ Session {session_file.name} loaded but appears invalid or expired. "
                        "Trying next session...",
                    )
                    failed_sessions.append(
                        (session_file.name, "Session expired or invalid"),
                    )
                    continue

            except Exception as e:
                failed_sessions.append((session_file.name, str(e)))
                logger.debug(
                    f"Failed to load session {session_file.name}: {e}. Trying next session...",
                )
                continue

        # If we get here, all sessions failed
        error_details = "; ".join([f"{name}: {err}" for name, err in failed_sessions])
        logger.warning(
            f"Failed to load any valid sessions from {session_dir}. "
            f"Errors: {error_details}. Continuing without authentication.",
        )
        logger.warning(
            "⚠️  Note: Instagram may return 401 errors if sessions are expired. "
            "Consider recreating your session file using the create_session.py script.",
        )

    def _verify_session(self, loader: instaloader.Instaloader) -> bool:
        """
        Verify that the loaded session is still valid by checking authentication.

        Args:
            loader: Instaloader instance with loaded session

        Returns:
            True if session is valid, False otherwise
        """
        try:
            # Check if we're logged in by trying to get the current user's profile
            # This is a lightweight check that doesn't make heavy API calls
            context = loader.context
            if not context.is_logged_in:
                logger.debug("Session verification: Not logged in")
                return False

            # Try to get the username from the session
            # If session is invalid, this will fail
            username = context.username
            if username:
                logger.debug(f"Session verification: Logged in as @{username}")
                return True
            else:
                logger.debug("Session verification: No username found in session")
                return False

        except Exception as e:
            logger.debug(f"Session verification failed: {e}")
            return False

    def fetch_profile_posts(
        self,
        username: str,
        limit: Optional[int] = None,
        cursor: Optional[str] = None,
    ) -> tuple[list[instaloader.Post], Optional[str]]:
        """
        Fetch posts from an Instagram profile.

        Args:
            username: Instagram username (without @)
            limit: Maximum number of posts to fetch
            cursor: Cursor for pagination (post shortcode)

        Returns:
            Tuple of (list of Post objects, next cursor/shortcode)

        Raises:
            instaloader.exceptions.ProfileNotExistsException: Profile not found
            instaloader.exceptions.ConnectionException: Network/connection error
            instaloader.exceptions.LoginRequiredException: Authentication required
        """
        try:
            # Log authentication status
            is_authenticated = self.loader.context.is_logged_in
            auth_status = "authenticated" if is_authenticated else "not authenticated"
            if is_authenticated:
                logger.info(
                    f"Using authenticated session (user: @{self.loader.context.username})",
                )
            else:
                logger.warning(
                    "⚠️  No valid session found - making unauthenticated requests. "
                    "This may result in rate limiting or 401 errors.",
                )

            # Get profile
            profile = instaloader.Profile.from_username(
                self.loader.context,
                username,
            )

            logger.info(
                f"Fetching posts for profile @{username} (limit={limit}, cursor={cursor}, {auth_status})",
            )

            posts = []
            next_cursor = None
            found_cursor = cursor is None  # If no cursor, start collecting immediately

            # Iterate through posts
            for post in profile.get_posts():
                # If we have a cursor, skip until we find it
                if not found_cursor:
                    if post.shortcode == cursor:
                        found_cursor = True
                    continue

                posts.append(post)

                # Store the shortcode of the last post as next cursor
                next_cursor = post.shortcode

                # Check limit
                if limit and len(posts) >= limit:
                    break

            logger.info(
                f"Fetched {len(posts)} posts for @{username}, next_cursor={next_cursor}",
            )

            return posts, next_cursor

        except instaloader.exceptions.ProfileNotExistsException as e:
            logger.error(f"Profile @{username} does not exist: {e}")
            raise
        except instaloader.exceptions.ConnectionException as e:
            error_msg = str(e).lower()
            # Check if it's a 401 error which might indicate expired session
            if "401" in error_msg or "unauthorized" in error_msg:
                logger.error(
                    f"Authentication error while fetching @{username}: {e}",
                )
                logger.error(
                    "⚠️  This might indicate an expired or invalid session. "
                    "Consider recreating your session file using create_session.py",
                )
            else:
                logger.error(f"Connection error while fetching @{username}: {e}")
            raise
        except instaloader.exceptions.LoginRequiredException as e:
            logger.error(f"Login required for @{username}: {e}")
            logger.error(
                "⚠️  Session appears to be expired or invalid. "
                "Please recreate your session file using create_session.py",
            )
            raise
        except Exception as e:
            logger.error(f"Unexpected error fetching @{username}: {e}")
            raise
