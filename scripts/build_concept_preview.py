#!/usr/bin/env python3
"""Build the isolated editorial concept preview without changing production rules."""
from pathlib import Path
import shutil

import build_static_dist

build_static_dist.PUBLIC_DIRECTORIES.add("concept")


def main() -> int:
    result = build_static_dist.main()
    if result != 0:
        return result

    dist = Path(__file__).resolve().parents[1] / "dist"
    concept_home = dist / "concept" / "index.html"
    if not concept_home.exists():
        raise RuntimeError("Concept homepage was not included in the preview build")

    # Make the preview URL open the concept immediately.
    shutil.copy2(concept_home, dist / "index.html")

    # This service is a private design-review surface, not a second public site.
    (dist / "robots.txt").write_text(
        "User-agent: *\nDisallow: /\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
