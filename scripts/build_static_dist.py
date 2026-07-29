#!/usr/bin/env python3
"""
Create a clean deployment folder for the Aastha static website.

This version is Windows-safe:
- pathlib converts shutil's string callback path back into a Path object;
- partial dist folders are removed before every build;
- the script exits with a non-zero code when copying fails.
"""

from __future__ import annotations

import hashlib
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


def add_content_hashed_asset_urls() -> tuple[int, int]:
    """
    Copy public CSS/JS files to content-hashed names and point built HTML at
    those unique URLs.

    Render and browsers may legitimately cache /assets/ responses. A new URL
    for every changed asset prevents an older stylesheet or script from being
    reused after a deployment while preserving efficient caching.
    """
    assets_root = DIST / "assets"
    if not assets_root.exists():
        return 0, 0

    versioned_urls: dict[str, str] = {}
    source_assets = sorted(
        path
        for path in assets_root.rglob("*")
        if path.is_file() and path.suffix.lower() in {".css", ".js"}
    )

    for source in source_assets:
        digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
        versioned_name = f"{source.stem}.{digest}{source.suffix}"
        versioned_path = source.with_name(versioned_name)
        shutil.copy2(source, versioned_path)

        original_url = "/" + source.relative_to(DIST).as_posix()
        versioned_urls[original_url] = "/" + versioned_path.relative_to(DIST).as_posix()

    changed_pages = 0
    changed_references = 0
    for page in sorted(DIST.rglob("*.html")):
        original = page.read_text(encoding="utf-8")
        updated = original

        for original_url, versioned_url in versioned_urls.items():
            for quote in ('"', "'"):
                needle = f"{quote}{original_url}{quote}"
                replacement = f"{quote}{versioned_url}{quote}"
                occurrences = updated.count(needle)
                if occurrences:
                    updated = updated.replace(needle, replacement)
                    changed_references += occurrences

        if updated != original:
            page.write_text(updated, encoding="utf-8")
            changed_pages += 1

    return changed_pages, changed_references


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

        versioned_pages, versioned_references = add_content_hashed_asset_urls()
        if versioned_references == 0:
            raise RuntimeError("No CSS or JavaScript references were versioned.")

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
        print(
            "Content-hashed asset references: "
            f"{versioned_references} across {versioned_pages} HTML pages"
        )
        return 0

    except Exception as exc:
        # Remove any misleading partial build.
        if DIST.exists():
            shutil.rmtree(DIST, ignore_errors=True)
        print(f"ERROR: Clean deployment build failed: {exc}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
