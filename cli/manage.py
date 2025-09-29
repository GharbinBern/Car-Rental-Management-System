#!/usr/bin/env python3

"""
Management CLI for operational tasks.

Usage examples:
  python cli/manage.py create-admin --username admin --password admin123 --email admin@example.com --full-name "System Admin"
  # Or env-driven (flags override env):
  ADMIN_USERNAME=admin ADMIN_PASSWORD=admin123 python cli/manage.py create-admin
"""

import argparse
import hashlib
import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from db_layer.connection import connect_db


def _hash(password: str) -> str:
    # Simple dev hash to match api/routes/auth.py behavior; swap to bcrypt later
    return hashlib.sha256(password.encode()).hexdigest()


def cmd_create_admin(args: argparse.Namespace) -> int:
    username = args.username or os.getenv("ADMIN_USERNAME") or "admin"
    password = args.password or os.getenv("ADMIN_PASSWORD") or "admin123"
    email = args.email or os.getenv("ADMIN_EMAIL") or "admin@example.com"
    full_name = args.full_name or os.getenv("ADMIN_FULL_NAME") or "System Administrator"

    db = connect_db()
    cursor = db.cursor()

    # Ensure users table exists and schema aligns with auth.sql
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            disabled BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL
        )
        """
    )

    cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    row = cursor.fetchone()

    hashed = _hash(password)
    if row:
        cursor.execute(
            "UPDATE users SET password=%s, email=%s, full_name=%s, disabled=FALSE WHERE username=%s",
            (hashed, email, full_name, username),
        )
        action = "updated"
    else:
        cursor.execute(
            "INSERT INTO users (username, password, email, full_name, disabled) VALUES (%s, %s, %s, %s, FALSE)",
            (username, hashed, email, full_name),
        )
        action = "created"

    db.commit()
    cursor.close()
    db.close()
    print(f"Admin user {action} successfully: {username}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="manage", description="Car Rental management commands")
    sub = parser.add_subparsers(dest="command", required=True)

    p_admin = sub.add_parser("create-admin", help="Create or update the admin user idempotently")
    p_admin.add_argument("--username", help="Username for the admin user")
    p_admin.add_argument("--password", help="Password for the admin user")
    p_admin.add_argument("--email", help="Email for the admin user")
    p_admin.add_argument("--full-name", dest="full_name", help="Full name")
    p_admin.set_defaults(func=cmd_create_admin)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
