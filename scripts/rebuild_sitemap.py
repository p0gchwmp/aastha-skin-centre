#!/usr/bin/env python3
"""
Rebuild sitemap.xml from the current website files.

The script:
- scans all public HTML pages;
- excludes local folders, templates and noindex pages;
- reads each page's canonical URL;
- writes one deduplicated sitemap;
- automatically includes /blog/ when the blog page is indexable.
"""

from __future__ import annotations

import html
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
PRIMARY = "https://www.aasthaskincentre.in"

EXCLUDED_PARTS = {
    ".venv",
    ".git",
    ".github",
    "_project-docs",
    "_legacy-tools",
    "backups",
    "reports",
    "content-drop",
    "schema-drop",
    "dist",
    "tools",
    "scripts",
    "__pycache__",
    "post-template",
}

def main() -> int:
    urls = set()
    skipped = []

    for path in sorted(ROOT.rglob("*.html")):
        if any(part in EXCLUDED_PARTS for part in path.parts):
            continue

        text = path.read_text(encoding="utf-8", errors="ignore")

        robots_match = re.search(
            r'<meta\s+name="robots"\s+content="([^"]+)"',
            text,
            flags=re.I,
        )
        robots = robots_match.group(1).lower() if robots_match else ""
        if "noindex" in robots:
            skipped.append(str(path.relative_to(ROOT)))
            continue

        canonical_match = re.search(
            r'<link\s+rel="canonical"\s+href="([^"]+)"',
            text,
            flags=re.I,
        )
        if not canonical_match:
            skipped.append(str(path.relative_to(ROOT)))
            continue

        canonical = canonical_match.group(1).strip()
        if canonical.startswith(PRIMARY):
            urls.add(canonical)

    today = date.today().isoformat()
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in sorted(urls):
        lines.append(
            f"  <url><loc>{html.escape(url)}</loc><lastmod>{today}</lastmod></url>"
        )
    lines.append("</urlset>")

    SITEMAP.write_text("\n".join(lines), encoding="utf-8")

    print(f"Sitemap rebuilt: {SITEMAP}")
    print(f"Indexable URLs included: {len(urls)}")
    print(f"Skipped/noindex pages: {len(skipped)}")

    if PRIMARY + "/blog/" in urls:
        print("Blog URL included: YES")
    else:
        print("Blog URL included: NO")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
