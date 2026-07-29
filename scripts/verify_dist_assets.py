#!/usr/bin/env python3
"""Verify that every built CSS/JS reference is hashed and resolves locally."""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
ASSET_REFERENCE = re.compile(
    r"""(?:href|src)=["'](/assets/(?:css|js)/[^"'?#]+\.(?:css|js))["']""",
    re.I,
)
HASHED_NAME = re.compile(r"\.[0-9a-f]{12}\.(?:css|js)$", re.I)


def main() -> int:
    if not (DIST / "index.html").exists():
        print("ERROR: dist is missing. Run build_static_dist.py first.")
        return 2

    issues: list[str] = []
    references = 0
    pages = 0
    for page in sorted(DIST.rglob("*.html")):
        pages += 1
        text = page.read_text(encoding="utf-8", errors="ignore")
        for match in ASSET_REFERENCE.finditer(text):
            references += 1
            url = match.group(1)
            path = urlparse(url).path
            if not HASHED_NAME.search(path):
                issues.append(
                    f"{page.relative_to(DIST).as_posix()}: unversioned asset {url}"
                )
                continue
            target = DIST / path.lstrip("/")
            if not target.exists():
                issues.append(
                    f"{page.relative_to(DIST).as_posix()}: missing asset {url}"
                )

    if references == 0:
        issues.append("No built CSS/JS references were found.")

    print(
        f"Built asset integrity: {references} hashed references across {pages} HTML pages"
    )
    print(f"Errors: {len(issues)}")
    for issue in issues:
        print(f"  - {issue}")
    return 2 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
