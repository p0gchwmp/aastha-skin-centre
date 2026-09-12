#!/usr/bin/env python3
"""Build the isolated editorial concept preview without changing production rules."""
from pathlib import Path
import shutil

import build_static_dist

build_static_dist.PUBLIC_DIRECTORIES.add("concept")

V3_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v3.css">'
V3_JS = '<script src="/assets/js/editorial-experience-v3.js" defer></script>'


def inject_v3_assets(page: Path) -> None:
    source = page.read_text(encoding="utf-8")
    if V3_CSS not in source:
        source = source.replace("</head>", f"{V3_CSS}</head>", 1)
    if V3_JS not in source:
        source = source.replace("</body>", f"{V3_JS}</body>", 1)
    page.write_text(source, encoding="utf-8")


def main() -> int:
    result = build_static_dist.main()
    if result != 0:
        return result

    dist = Path(__file__).resolve().parents[1] / "dist"
    concept_root = dist / "concept"
    concept_home = concept_root / "index.html"
    if not concept_home.exists():
        raise RuntimeError("Concept homepage was not included in the preview build")

    # Apply the v3 experience layer to every concept page while leaving the
    # original production pages in dist byte-for-byte on their existing system.
    for page in concept_root.rglob("*.html"):
        inject_v3_assets(page)

    # Make the preview URL open the concept immediately.
    shutil.copy2(concept_home, dist / "index.html")

    # This service is a design-review surface, not a second indexable clinic site.
    (dist / "robots.txt").write_text(
        "User-agent: *\nDisallow: /\n",
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
