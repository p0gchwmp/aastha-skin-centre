#!/usr/bin/env python3
"""Build the isolated editorial concept preview without changing production rules."""
from pathlib import Path
import shutil

import build_static_dist

build_static_dist.PUBLIC_DIRECTORIES.add("concept")

FONT_PRECONNECT_1 = '<link rel="preconnect" href="https://fonts.googleapis.com">'
FONT_PRECONNECT_2 = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
FONT_STYLES = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
V3_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v3.css">'
V3_FIX_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v3-fixes.css">'
V4_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v4.css">'
V5_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v5.css">'
V3_JS = '<script src="/assets/js/editorial-experience-v3.js" defer></script>'
V3_FIX_JS = '<script src="/assets/js/editorial-experience-v3-fixes.js" defer></script>'
V4_JS = '<script src="/assets/js/editorial-experience-v4.js" defer></script>'
V5_JS = '<script src="/assets/js/editorial-experience-v5.js" defer></script>'
V5_FIX_JS = '<script src="/assets/js/editorial-experience-v5-fixes.js" defer></script>'


def inject_experience_assets(page: Path) -> None:
    source = page.read_text(encoding="utf-8")
    for tag in (FONT_PRECONNECT_1, FONT_PRECONNECT_2, FONT_STYLES, V3_CSS, V3_FIX_CSS, V4_CSS, V5_CSS):
        if tag not in source:
            source = source.replace("</head>", f"{tag}</head>", 1)
    for tag in (V3_JS, V3_FIX_JS, V4_JS, V5_JS, V5_FIX_JS):
        if tag not in source:
            source = source.replace("</body>", f"{tag}</body>", 1)
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

    concept_pages = list(concept_root.rglob("*.html"))
    if len(concept_pages) < 22:
        raise RuntimeError(f"Concept migration unexpectedly small: {len(concept_pages)} pages")

    # Apply the premium experience only to concept pages. Production/static
    # baseline pages in dist remain visually untouched for comparison/rollback.
    for page in concept_pages:
        inject_experience_assets(page)

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
