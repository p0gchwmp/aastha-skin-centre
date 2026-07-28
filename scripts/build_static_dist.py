#!/usr/bin/env python3
"""
Create a clean deployment folder for the Aastha static website.

This version is Windows-safe:
- pathlib converts shutil's string callback path back into a Path object;
- partial dist folders are removed before every build;
- the script exits with a non-zero code when copying fails.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"

PUBLIC_ROOT_FILES = {
    "index.html",
    "404.html",
    "robots.txt",
    "sitemap.xml",
    "favicon.ico",
    "site.webmanifest",
}

PUBLIC_DIRECTORIES = {
    "assets",
    "about",
    "dr-cheena-langer",
    "conditions",
    "treatments",
    "locations",
    "book-appointment",
    "contact",
    "privacy-policy",
    "terms-and-conditions",
    "medical-disclaimer",
    "appointment-request-received",
    "blog",
}

EXCLUDED_DIRECTORY_NAMES = {
    ".venv",
    ".git",
    ".github",
    "_project-docs",
    "_legacy-tools",
    "backups",
    "reports",
    "content-drop",
    "schema-drop",
    "scripts",
    "tools",
    "deployment",
    "post-template",
    "__pycache__",
}

EXCLUDED_SUFFIXES = {
    ".docx",
    ".xlsx",
    ".xls",
    ".csv",
    ".bat",
    ".py",
    ".md",
    ".txt",
    ".zip",
}

def ignore_public(path, names):
    """
    shutil.copytree passes `path` as a string on Windows.
    Convert it to pathlib.Path before using the `/` operator.
    """
    current = Path(path)
    ignored = set()

    for name in names:
        child = current / name

        if name in EXCLUDED_DIRECTORY_NAMES:
            ignored.add(name)
            continue

        if child.is_file() and child.suffix.lower() in EXCLUDED_SUFFIXES:
            ignored.add(name)

    return ignored

def main() -> int:
    try:
        if DIST.exists():
            shutil.rmtree(DIST)
        DIST.mkdir(parents=True)

        copied = []

        for filename in sorted(PUBLIC_ROOT_FILES):
            source = ROOT / filename
            if source.exists() and source.is_file():
                shutil.copy2(source, DIST / filename)
                copied.append(filename)

        for dirname in sorted(PUBLIC_DIRECTORIES):
            source = ROOT / dirname
            if not source.exists() or not source.is_dir():
                continue

            destination = DIST / dirname
            shutil.copytree(
                source,
                destination,
                ignore=ignore_public,
                dirs_exist_ok=False,
            )
            copied.append(dirname + "/")

        # Never publish the reusable unpublished blog template.
        template = DIST / "blog" / "post-template"
        if template.exists():
            shutil.rmtree(template)

        # Basic build verification.
        required = [
            DIST / "index.html",
            DIST / "assets" / "css" / "styles.css",
            DIST / "assets" / "js" / "site.js",
            DIST / "sitemap.xml",
        ]
        missing = [str(path.relative_to(DIST)) for path in required if not path.exists()]
        if missing:
            raise RuntimeError(
                "Deployment build is incomplete. Missing: " + ", ".join(missing)
            )

        html_count = len(list(DIST.rglob("*.html")))
        print(f"Deployment folder created successfully: {DIST}")
        print(f"Public roots copied: {len(copied)}")
        print(f"HTML pages in dist: {html_count}")
        return 0

    except Exception as exc:
        # Remove any misleading partial build.
        if DIST.exists():
            shutil.rmtree(DIST, ignore_errors=True)
        print(f"ERROR: Clean deployment build failed: {exc}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
