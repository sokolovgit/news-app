"""Main entry point for the Instagram scrapper application."""

import logging
import sys

from src.config import get_settings


def setup_logging() -> None:
    """Configure logging for the application."""
    settings = get_settings()

    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


def main() -> None:
    """Main application entry point."""
    setup_logging()
    logger = logging.getLogger(__name__)

    logger.info("Instagram Scrapper starting...")

    # TODO: Initialize scraper and queue workers here

    logger.info("Instagram Scrapper initialized successfully")


if __name__ == "__main__":
    main()
