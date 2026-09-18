#!/usr/bin/env python3
"""Build the isolated editorial concept preview without changing production rules."""
from pathlib import Path
import re
import shutil

import build_static_dist
import concept_bundle_assets
import concept_admin_upgrade
import concept_media_upgrade
import generate_concept_v13_pages
import generate_concept_v18_system_pages
import generate_concept_remaining_pages
from concept_copy_cleanup import clean_patient_copy
from concept_quality_audit import audit_concept

build_static_dist.PUBLIC_DIRECTORIES.add("concept")

FONT_PRECONNECT_1 = '<link rel="preconnect" href="https://fonts.googleapis.com">'
FONT_PRECONNECT_2 = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
FONT_STYLES = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">'
MOTION_PRECONNECT = '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>'
MOTION_SCRIPT = '<script src="https://cdn.jsdelivr.net/npm/motion@13.4.0/dist/motion.js" defer></script>'
TRANSITION_GUARD = '<script>addEventListener("pageshow",()=>{document.body&&document.body.classList.remove("is-transitioning");document.documentElement.classList.remove("is-transitioning")});addEventListener("pagehide",()=>{document.body&&document.body.classList.remove("is-transitioning")});</script>'
THEME_BOOT = '<script>(()=>{try{const r=document.documentElement,p=localStorage.getItem("aastha-preview-theme-palette")||localStorage.getItem("aastha-preview-palette")||"current",ok=["current","bordeaux","midnight","forest","plum"];r.dataset.aasthaPalette=ok.includes(p)?p:"current";r.dataset.aasthaMode="light";localStorage.removeItem("aastha-preview-theme-mode")}catch(e){document.documentElement.dataset.aasthaPalette="current";document.documentElement.dataset.aasthaMode="light"}})();</script>'

QUOTED_PATH_RE = re.compile(r'''(?P<q>["'])(?P<value>/[^"']+)(?P=q)''')
HERO_IMG_RE = re.compile(
    r'''(<section\b[^>]*class=["'][^"']*\beditorial-hero\b[^"']*["'][^>]*>.*?<img\b)([^>]*>)''',
    re.I | re.S,
)


def prioritize_hero_image(source: str) -> str:
    """Prioritize only the first above-the-fold editorial hero image."""

    def patch(match: re.Match[str]) -> str:
        attrs = match.group(2)
        attrs = re.sub(r'''\sloading=["'][^"']*["']''', "", attrs, flags=re.I)
        if not re.search(r'''\sdecoding=["'][^"']*["']''', attrs, re.I):
            attrs = ' decoding="async"' + attrs
        if not re.search(r'''\sfetchpriority=["'][^"']*["']''', attrs, re.I):
            attrs = ' fetchpriority="high"' + attrs
        attrs = ' loading="eager"' + attrs
        return match.group(1) + attrs

    return HERO_IMG_RE.sub(patch, source, count=1)


def inject_experience_assets(page: Path) -> None:
    source = page.read_text(encoding="utf-8")
    source = prioritize_hero_image(source)
    head_tags = [FONT_PRECONNECT_1, FONT_PRECONNECT_2, FONT_STYLES, MOTION_PRECONNECT, MOTION_SCRIPT, TRANSITION_GUARD, THEME_BOOT]
    head_tags += [f'<link rel="stylesheet" href="/assets/css/{name}">' for name in concept_bundle_assets.CSS_FILES]
    js_tags = [f'<script src="/assets/js/{name}" defer></script>' for name in concept_bundle_assets.JS_FILES]
    for tag in head_tags:
        if tag not in source:
            source = source.replace("</head>", f"{tag}</head>", 1)
    for tag in js_tags:
        if tag not in source:
            source = source.replace("</body>", f"{tag}</body>", 1)
    source = source.replace('<script src="/assets/js/editorial-experience-v24.js" defer></script>', "")
    page.write_text(source, encoding="utf-8")


def concept_route_map(concept_root: Path) -> dict[str, str]:
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
        if rel.startswith("locations/") or rel.startswith("blog/"):
            routes[f"/{rel}/"] = concept_url
        elif "/" not in rel and rel not in reserved:
            routes[f"/treatments/{rel}/"] = concept_url
            routes[f"/conditions/{rel}/"] = concept_url
    routes.update({
        "/treatments/hifu-rf-skin-tightening/": "/concept/hifu-treatment/",
        "/treatments/nail-surgery/": "/concept/ingrown-toenail-nail-surgery/",
    })
    return routes


def normalize_concept_links(concept_pages: list[Path], routes: dict[str, str]) -> int:
    replacements = 0

    def rewrite_match(match: re.Match[str]) -> str:
        nonlocal replacements
        value = match.group("value")
        cut = len(value)
        for sep in ("?", "#"):
            pos = value.find(sep)
            if pos != -1:
                cut = min(cut, pos)
        base, suffix = value[:cut], value[cut:]
        target = routes.get(base)
        if not target:
            return match.group(0)
        replacements += 1
        quote = match.group("q")
        return f"{quote}{target}{suffix}{quote}"

    for page in concept_pages:
        source = page.read_text(encoding="utf-8")
        updated = QUOTED_PATH_RE.sub(rewrite_match, source)
        if updated != source:
            page.write_text(updated, encoding="utf-8")
    return replacements


def main() -> int:
    if generate_concept_v13_pages.main() != 0:
        return 1
    if generate_concept_v18_system_pages.main() != 0:
        return 1
    if generate_concept_remaining_pages.main() != 0:
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
    clean_patient_copy(concept_pages)
    concept_media_upgrade.upgrade_media(dist, concept_pages)
    concept_admin_upgrade.upgrade_admin(dist, concept_pages)

    unresolved = sum(page.read_text(encoding="utf-8").count('href="/treatments/') for page in concept_pages)
    unresolved_blog = sum(page.read_text(encoding="utf-8").count('href="/blog/') for page in concept_pages)
    print(f"Premium route rewrites applied: {rewrites}")
    print(f"Remaining legacy treatment hrefs (no concept equivalent yet): {unresolved}")
    print(f"Remaining legacy blog hrefs (no concept equivalent yet): {unresolved_blog}")

    concept_bundle_assets.bundle_concept_assets(dist, concept_pages)
    audit_concept(dist, concept_pages)

    shutil.copy2(concept_home, dist / "index.html")
    (dist / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
