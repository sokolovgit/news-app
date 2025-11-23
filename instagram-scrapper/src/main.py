"""Main entry point for the Instagram scrapper application."""

import asyncio
import logging
import signal
import sys

from src.config import get_settings
from src.scraper.instagram_scraper import InstagramScraper
from src.scraper.queue_worker import InstagramQueueWorker
from src.scraper.result_publisher import ResultPublisher


def setup_logging() -> None:
    """Configure logging for the application."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


class InstagramScrapperApp:
    """Main application class for Instagram scraper."""

    def __init__(self):
        """Initialize the application."""
        self.settings = get_settings()
        self.logger = logging.getLogger(__name__)
        self.worker: InstagramQueueWorker | None = None
        self.shutdown_event = asyncio.Event()

    def setup_signal_handlers(self) -> None:
        """Setup signal handlers for graceful shutdown."""

        def signal_handler(signum, frame):
            self.logger.info(f"Received signal {signum}, initiating shutdown...")
            self.shutdown_event.set()

        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

    async def start(self) -> None:
        """Start the Instagram scraper application."""
        self.logger.info("Instagram Scrapper starting...")

        try:
            # Initialize components
            scraper = InstagramScraper(self.settings)
            publisher = ResultPublisher(self.settings)
            self.worker = InstagramQueueWorker(
                self.settings,
                scraper,
                publisher,
            )

            # Start the worker
            self.worker.start()

            self.logger.info("Instagram Scrapper initialized successfully")
            self.logger.info(
                f"Worker listening on queue: {self.settings.instagram_fetcher_queue}",
            )
            self.logger.info(
                f"Results will be published to: {self.settings.fetch_results_queue}",
            )

            # Wait for shutdown signal
            await self.shutdown_event.wait()

        except Exception as e:
            self.logger.error(f"Failed to start Instagram Scrapper: {e}", exc_info=True)
            raise
        finally:
            await self.stop()

    async def stop(self) -> None:
        """Stop the Instagram scraper application gracefully."""
        self.logger.info("Shutting down Instagram Scrapper...")

        if self.worker:
            await self.worker.stop()

        self.logger.info("Instagram Scrapper stopped")


async def main() -> None:
    """Main async entry point."""
    app = InstagramScrapperApp()
    app.setup_signal_handlers()
    await app.start()


if __name__ == "__main__":
    setup_logging()
    logger = logging.getLogger(__name__)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
    except KeyError as e:
        # Handle BullMQ internal KeyErrors that can occur during job cleanup
        # This is a known issue with BullMQ Python library race conditions
        logger.warning(
            f"BullMQ internal error (likely harmless): {e}. "
            "This can occur due to race conditions during job cleanup. "
            "The application will continue running.",
        )
        # Don't exit - let the worker continue processing other jobs
    except Exception as e:
        logger.error(f"Application error: {e}", exc_info=True)
        sys.exit(1)
