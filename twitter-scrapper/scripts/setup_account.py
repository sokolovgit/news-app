#!/usr/bin/env python3
"""Script to setup Twitter account for twscrape."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from twscrape import API


async def main():
    """Main function to setup Twitter account."""
    print("🐦 Twitter Account Setup for twscrape")
    print("=" * 50)
    print()
    print("This script will add your Twitter account to the twscrape database.")
    print("Your credentials will be stored locally in accounts.db")
    print()

    # Get account details
    username = input("Twitter username: ").strip()
    if not username:
        print("❌ Username is required")
        return

    password = input("Twitter password: ").strip()
    if not password:
        print("❌ Password is required")
        return

    email = input("Twitter email: ").strip()
    if not email:
        print("❌ Email is required")
        return

    email_password = input("Email password (for verification, press Enter to skip): ").strip()

    # Initialize API
    db_path = Path(__file__).parent.parent / "accounts.db"
    api = API(str(db_path))

    print()
    print(f"📦 Adding account @{username}...")

    try:
        # Add account to pool
        await api.pool.add_account(
            username=username,
            password=password,
            email=email,
            email_password=email_password if email_password else None,
        )
        print(f"✓ Account @{username} added to database")

        # Login to get cookies
        print(f"🔐 Logging in @{username}...")
        await api.pool.login_all()

        # Verify account is active
        accounts = await api.pool.accounts_info()
        active_accounts = [a for a in accounts if a.get("active", False)]

        if any(a.get("username") == username and a.get("active") for a in accounts):
            print(f"✓ Account @{username} is now active and ready to use!")
        else:
            print(f"⚠ Account @{username} added but may not be fully logged in.")
            print("  You may need to verify your account or check for 2FA.")

        print()
        print(f"📊 Total accounts: {len(accounts)}, Active: {len(active_accounts)}")

    except Exception as e:
        print(f"❌ Error adding account: {e}")
        print()
        print("Common issues:")
        print("  - Wrong username/password")
        print("  - 2FA is enabled (not supported)")
        print("  - Account is locked or suspended")
        print("  - Rate limited - try again later")


if __name__ == "__main__":
    asyncio.run(main())
