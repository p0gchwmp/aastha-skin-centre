#!/usr/bin/env python3
"""Build the isolated editorial concept preview without changing production rules."""
from pathlib import Path
import shutil

import build_static_dist
import generate_concept_v13_pages
import generate_concept_v18_system_pages

build_static_dist.PUBLIC_DIRECTORIES.add("concept")

FONT_PRECONNECT_1 = '<link rel="preconnect" href="https://fonts.googleapis.com">'
FONT_PRECONNECT_2 = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
FONT_STYLES = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
TRANSITION_GUARD = '<script>addEventListener("pageshow",()=>{document.body&&document.body.classList.remove("is-transitioning");document.documentElement.classList.remove("is-transitioning")});addEventListener("pagehide",()=>{document.body&&document.body.classList.remove("is-transitioning")});</script>'
THEME_BOOT = '<script>(()=>{try{const r=document.documentElement,p=localStorage.getItem("aastha-preview-theme-palette")||localStorage.getItem("aastha-preview-palette")||"current",ok=["current","bordeaux","midnight","forest","plum"];r.dataset.aasthaPalette=ok.includes(p)?p:"current";r.dataset.aasthaMode="light";localStorage.removeItem("aastha-preview-theme-mode")}catch(e){document.documentElement.dataset.aasthaPalette="current";document.documentElement.dataset.aasthaMode="light"}})();</script>'
V3_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v3.css">'
V3_FIX_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v3-fixes.css">'
V4_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v4.css">'
V5_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v5.css">'
V6_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v6.css">'
V6_FIX_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v6-fixes.css">'
V7_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v7.css">'
V8_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v8.css">'
V10_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v10.css">'
V11_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v11.css">'
V12_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v12.css">'
V14_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v14.css">'
V15_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v15.css">'
V16_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v16.css">'
V17_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v17.css">'
V18_CSS = '<link rel="stylesheet" href="/assets/css/editorial-experience-v18.css">'
V3_JS = '<script src="/assets/js/editorial-experience-v3.js" defer></script>'
V3_FIX_JS = '<script src="/assets/js/editorial-experience-v3-fixes.js" defer></script>'
V4_JS = '<script src="/assets/js/editorial-experience-v4.js" defer></script>'
V5_JS = '<script src="/assets/js/editorial-experience-v5.js" defer></script>'
V5_FIX_JS = '<script src="/assets/js/editorial-experience-v5-fixes.js" defer></script>'
V6_JS = '<script src="/assets/js/editorial-experience-v6.js" defer></script>'
V6_POLISH_JS = '<script src="/assets/js/editorial-experience-v6-polish.js" defer></script>'
V7_JS = '<script src="/assets/js/editorial-experience-v7.js" defer></script>'
V7_POLISH_JS = '<script src="/assets/js/editorial-experience-v7-polish.js" defer></script>'
V8_JS = '<script src="/assets/js/editorial-experience-v8.js" defer></script>'
V10_JS = '<script src="/assets/js/editorial-experience-v10.js" defer></script>'
V11_JS = '<script src="/assets/js/editorial-experience-v11.js" defer></script>'
V11_MIGRATIONS_JS = '<script src="/assets/js/editorial-experience-v11-migrations.js" defer></script>'
V12_JS = '<script src="/assets/js/editorial-experience-v12.js" defer></script>'
V13_MIGRATIONS_JS = '<script src="/assets/js/editorial-experience-v13-migrations.js" defer></script>'
V16_JS = '<script src="/assets/js/editorial-experience-v16.js" defer></script>'
V18_JS = '<script src="/assets/js/editorial-experience-v18.js" defer></script>'


def inject_experience_assets(page: Path) -> None:
    source = page.read_text(encoding="utf-8")
    for tag in (FONT_PRECONNECT_1, FONT_PRECONNECT_2, FONT_STYLES, TRANSITION_GUARD, THEME_BOOT, V3_CSS, V3_FIX_CSS, V4_CSS, V5_CSS, V6_CSS, V6_FIX_CSS, V7_CSS, V8_CSS, V10_CSS, V11_CSS, V12_CSS, V14_CSS, V15_CSS, V16_CSS, V17_CSS, V18_CSS):
        if tag not in source:
            source = source.replace("</head>", f"{tag}</head>", 1)
    for tag in (V3_JS, V3_FIX_JS, V4_JS, V5_JS, V5_FIX_JS, V6_JS, V6_POLISH_JS, V7_JS, V7_POLISH_JS, V8_JS, V10_JS, V11_JS, V11_MIGRATIONS_JS, V12_JS, V13_MIGRATIONS_JS, V16_JS, V18_JS):
        if tag not in source:
            source = source.replace("</body>", f"{tag}</body>", 1)
    page.write_text(source, encoding="utf-8")


def concept_route_map(concept_root: Path) -> dict[str, str]:
    """Map legacy public routes to concept routes whenever a concept page exists."""
    routes = {
        "/book-appointment/": "/concept/book-appointment/",
        "/contact/": "/concept/contact/",
        "/conditions/": "/concept/conditions/",
        "/treatments/": "/concept/treatments/",
        "/dr-cheena-langer/": "/concept/dr-cheena-langer/",
        "/locations/": "/concept/locations/",
        "/blog/": "/concept/blog/",
        "/about/": "/concept/about/",
        "/privacy-policy/": "/concept/privacy-policy/",
        "/medical-disclaimer/": "/concept/medical-disclaimer/",
        "/terms-and-conditions/": "/concept/terms-and-conditions/",
        "/appointment-request-received/": "/concept/appointment-request-received/",
    }
    reserved = {
        "conditions", "treatments", "dr-cheena-langer", "book-appointment", "contact", "locations",
        "blog", "media", "about", "privacy-policy", "medical-disclaimer", "terms-and-conditions",
        "appointment-request-received", "admin",
    }
    for page in concept_root.rglob("index.html"):
        rel = page.parent.relative_to(concept_root).as_posix()
        if rel in (".", ""):
            continue
        concept_url = f"/concept/{rel}/"
        if rel.startswith("locations/"):
            routes[f"/{rel}/"] = concept_url
        elif rel.startswith("blog/"):
            routes[f"/{rel}/"] = concept_url
        elif "/" not in rel and rel not in reserved:
            routes[f"/treatments/{rel}/"] = concept_url
    routes.update({
        "/treatments/hifu-rf-skin-tightening/": "/concept/hifu-treatment/",
        "/treatments/nail-surgery/": "/concept/ingrown-toenail-nail-surgery/",
    })
    return routes


def normalize_concept_links(concept_pages: list[Path], routes: dict[str, str]) -> int:
    """Rewrite legacy links in HTML, including data attributes and JSON strings."""
    replacements = 0
    for page in concept_pages:
        source = page.read_text(encoding="utf-8")
        updated = source
        for old, new in sorted(routes.items(), key=lambda item: len(item[0]), reverse=True):
            count = updated.count(old)
            if count:
                updated = updated.replace(old, new)
                replacements += count
        if updated != source:
            page.write_text(updated, encoding="utf-8")
    return replacements


def main() -> int:
    if generate_concept_v13_pages.main() != 0:
        return 1
    if generate_concept_v18_system_pages.main() != 0:
        return 1

    result = build_static_dist.main()
    if result != 0:
        return result

    dist = Path(__file__).resolve().parents[1] / "dist"
    concept_root = dist / "concept"
    concept_home = concept_root / "index.html"
    if not concept_home.exists():
        raise RuntimeError("Concept homepage was not included in the preview build")

    concept_pages = list(concept_root.rglob("*.html"))
    if len(concept_pages) < 80:
        raise RuntimeError(f"Concept migration unexpectedly small: {len(concept_pages)} pages")

    for page in concept_pages:
        inject_experience_assets(page)

    rewrites = normalize_concept_links(concept_pages, concept_route_map(concept_root))
    unresolved = sum(page.read_text(encoding="utf-8").count('href="/treatments/') for page in concept_pages)
    unresolved_blog = sum(page.read_text(encoding="utf-8").count('href="/blog/') for page in concept_pages)
    print(f"Premium route rewrites applied: {rewrites}")
    print(f"Remaining legacy treatment hrefs (no concept equivalent yet): {unresolved}")
    print(f"Remaining legacy blog hrefs (no concept equivalent yet): {unresolved_blog}")

    shutil.copy2(concept_home, dist / "index.html")
    (dist / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
