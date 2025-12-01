#!/usr/bin/env python3
"""Script to add Twitter account using browser cookies."""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from twscrape import API


async def main():
    """Main function to add Twitter account with cookies."""
    print("🐦 Twitter Account Setup with Cookies")
    print("=" * 60)
    print()
    print("Since Cloudflare is blocking direct login, you can add your")
    print("account using cookies from your browser.")
    print()
    print("Steps to get cookies:")
    print("1. Open Chrome/Firefox and log into twitter.com/x.com")
    print("2. Install a cookie export extension (e.g., 'EditThisCookie' or 'Cookie-Editor')")
    print("3. Export cookies as a string (Netscape/HTTP format or JSON)")
    print("4. Paste the cookies below")
    print()
    print("Required cookies: auth_token, ct0")
    print()

    username = input("Twitter username: ").strip()
    if not username:
        print("❌ Username is required")
        return

    print()
    print("Enter your cookies (paste and press Enter twice when done):")
    print("Format can be: 'cookie1=value1; cookie2=value2' or JSON array")
    print()
    
    lines = []
    while True:
        line = input()
        if line == "":
            if lines:
                break
        else:
            lines.append(line)
    
    cookies = "\n".join(lines).strip()
    
    if not cookies:
        print("❌ Cookies are required")
        return

    # Initialize API
    db_path = Path(__file__).parent.parent / "accounts.db"
    api = API(str(db_path))

    print()
    print(f"📦 Adding account @{username} with cookies...")

    try:
        # Add account with cookies
        await api.pool.add_account(
            username=username,
            password="",  # Not needed with cookies
            email="",     # Not needed with cookies  
            email_password="",
            cookies=cookies,
        )
        print(f"✓ Account @{username} added with cookies")

        # Check if account is active
        accounts = await api.pool.accounts_info()
        active_accounts = [a for a in accounts if a.get("active", False)]

        if any(a.get("username") == username and a.get("active") for a in accounts):
            print(f"✓ Account @{username} is active and ready to use!")
        else:
            print(f"⚠ Account @{username} added. Testing connection...")
            
            # Try to relogin to validate cookies
            try:
                await api.pool.relogin(username)
                print(f"✓ Account @{username} validated successfully!")
            except Exception as e:
                print(f"⚠ Could not validate account: {e}")

        print()
        accounts = await api.pool.accounts_info()
        active = [a for a in accounts if a.get("active", False)]
        print(f"📊 Total accounts: {len(accounts)}, Active: {len(active)}")

    except Exception as e:
        print(f"❌ Error adding account: {e}")


if __name__ == "__main__":
    asyncio.run(main())

