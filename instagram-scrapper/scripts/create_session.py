#!/usr/bin/env python3
"""Helper script to create Instagram session file for authentication."""

import sys
from pathlib import Path

try:
    import instaloader
except ImportError:
    print("Error: instaloader is not installed.")
    print("Install it with: pip install instaloader")
    sys.exit(1)


def create_session(session_dir: Path = Path(".")) -> None:
    """
    Create Instagram session file by logging in.

    Args:
        session_dir: Directory where session file will be saved
    """
    print("Instagram Session Creator")
    print("=" * 50)
    print()
    print("This script will help you create an Instagram session file.")
    print("You'll need to provide your Instagram username and password.")
    print("The session file allows the scraper to make authenticated requests.")
    print()
    print("⚠️  Note: Your credentials are only used to create the session.")
    print("   They are NOT stored - only the session token is saved.")
    print()

    username = input("Enter your Instagram username: ").strip()
    if not username:
        print("Error: Username cannot be empty.")
        sys.exit(1)

    # Use getpass to hide password input
    import getpass

    password = getpass.getpass("Enter your Instagram password: ").strip()
    if not password:
        print("Error: Password cannot be empty.")
        sys.exit(1)

    print()
    print("Creating session...")

    loader = instaloader.Instaloader()

    try:
        # Login and save session
        loader.login(username, password)
        # Instaloader saves session files without extension
        loader.save_session_to_file(str(session_dir / username))

        # Instaloader creates the file without extension, but we reference it with the full path
        session_file = session_dir / username
        print()
        print("✅ Session created successfully!")
        print(f"📁 Session file: {session_file.absolute()}")
        print()
        print("To use this session file, set in your .env:")
        print(f'INSTAGRAM_SESSION_PATH="{session_file.absolute()}"')
        print()
        print("⚠️  Important:")
        print("   - Keep your session file secure and private")
        print("   - Session files are in sessions/ folder (already in .gitignore)")
        print("   - Session files expire after some time - recreate if needed")

    except instaloader.exceptions.BadCredentialsException:
        print()
        print("❌ Error: Invalid username or password.")
        sys.exit(1)
    except instaloader.exceptions.TwoFactorAuthRequiredException:
        print()
        print("❌ Error: Two-factor authentication is enabled.")
        print("   Please disable 2FA temporarily or use a different account.")
        sys.exit(1)
    except Exception as e:
        print()
        print(f"❌ Error creating session: {e}")
        sys.exit(1)


if __name__ == "__main__":
    import argparse

    # Default to sessions/ folder in project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    default_session_dir = project_root / "sessions"

    parser = argparse.ArgumentParser(
        description="Create Instagram session file for authentication",
    )
    parser.add_argument(
        "--session-dir",
        type=Path,
        default=default_session_dir,
        help=f"Directory to save session file (default: {default_session_dir})",
    )

    args = parser.parse_args()

    # Ensure session directory exists
    args.session_dir.mkdir(parents=True, exist_ok=True)

    create_session(args.session_dir)
