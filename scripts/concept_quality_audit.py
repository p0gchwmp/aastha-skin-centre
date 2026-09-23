#!/usr/bin/env python3
"""Static QA for the isolated Aastha concept preview.

Structural defects, internal/prototype copy, known stale public facts and launch
SEO regressions fail the build. Softer content smells remain warnings while the
preview is refined.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import re
from urllib.parse import urlsplit

from concept_launch_hardening import harden_launch_metadata
from concept_launch_readiness import audit_launch_readiness

ATTR_RE = re.compile(r'''\b(href|src)\s*=\s*["']([^"']+)["']''', re.I)
ID_RE = re.compile(r'''\bid\s*=\s*["']([^"']+)["']''', re.I)
H1_RE = re.compile(r"<h1\b", re.I)
ROBOTS_RE = re.compile(r'''<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>''', re.I)
HERO_IMG_RE = re.compile(r'''<section\b[^>]*class=["'][^"']*\beditorial-hero\b[^"']*["'][^>]*>.*?<img\b([^>]*)>''', re.I | re.S)
IMG_TAG_RE = re.compile(r'''<img\b([^>]*)>''', re.I)

PUBLIC_INTERNAL_PHRASES = (
    "stored with this preview",
    "clinic-supplied",
    "existing aastha website media",
    "from the existing aastha media library",
    "real clinic-approved portrait can replace this placeholder",
    "illustration placeholder",
    "design prototype",
    "preview only",
    "maps to wagtail",
)

STALE_PUBLIC_FACTS = (
    "11:00 am–4:00 pm",
    "11 am–4 pm",
    "sunday doctor",
    "sunday consultation window",
    "10:30 am–12:00 pm",
    "10:30–12",
    "requires final clinical approval",
    "should only advertise dhi",
    "supporting records are available",
    "approved clinic statement",
    "https://www.aasthaskincentre.in/static/images/visual-cues/",
)

PROTOTYPE_PHRASES = (
    "lorem ipsum",
    "placeholder text",
    "dummy content",
    "the original site",
    "search engines",
    "wall of cards",
    "visually bold",
    "playful interactions",
    "design prototype",
    "original page",
    "original guide",
    "original profile",
    "homepage concept",
    "doctor concept",
    "editorial concept",
)


def _target_file(dist: Path, path: str) -> Path:
    clean = path.lstrip("/")
    candidate = dist / clean
    if path.endswith("/"):
        return candidate / "index.html"
    if candidate.suffix:
        return candidate
    if candidate.is_dir():
        return candidate / "index.html"
    return candidate


def audit_concept(dist: Path, concept_pages: list[Path]) -> dict[str, int]:
    # Apply production-target metadata/schema before auditing it. This does not
    # change preview indexing: every public concept page remains noindex.
    harden_launch_metadata(dist, concept_pages)

    fatals = []
    warnings = []
    concept_root = dist / "concept"

    for page in concept_pages:
        source = page.read_text(encoding="utf-8")
        rel = page.relative_to(concept_root).as_posix()

        ids = ID_RE.findall(source)
        duplicates = sorted(k for k, v in Counter(ids).items() if v > 1)
        if duplicates:
            fatals.append(f"{rel}: duplicate ids {', '.join(duplicates[:8])}")

        h1_count = len(H1_RE.findall(source))
        if h1_count != 1:
            warnings.append(f"{rel}: expected 1 h1, found {h1_count}")

        robots = ROBOTS_RE.search(source)
        robots_value = robots.group(1).lower() if robots else ""
        if "noindex" not in robots_value:
            fatals.append(f"{rel}: concept preview must include robots noindex")

        hero_img = HERO_IMG_RE.search(source)
        if hero_img:
            hero_attrs = hero_img.group(1)
            if not re.search(r'''\bfetchpriority=["']high["']''', hero_attrs, re.I):
                fatals.append(f"{rel}: above-the-fold hero image missing fetchpriority=high")
            if not re.search(r'''\bloading=["']eager["']''', hero_attrs, re.I):
                fatals.append(f"{rel}: above-the-fold hero image missing loading=eager")
            if not re.search(r'''\bdecoding=["']async["']''', hero_attrs, re.I):
                fatals.append(f"{rel}: above-the-fold hero image missing decoding=async")

        for image_attrs in IMG_TAG_RE.findall(source):
            if not re.search(r'''\bloading=["'](?:lazy|eager)["']''', image_attrs, re.I):
                fatals.append(f"{rel}: image missing explicit loading strategy")
            if not re.search(r'''\bdecoding=["']async["']''', image_attrs, re.I):
                fatals.append(f"{rel}: image missing decoding=async")

        for attr, raw in ATTR_RE.findall(source):
            if not raw or raw.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "data:")):
                continue
            if attr.lower() == "href" and raw == "#":
                warnings.append(f"{rel}: dead href=#")
                continue
            parsed = urlsplit(raw)
            path = parsed.path
            if not path.startswith("/"):
                continue
            if path.startswith("/concept/") or path.startswith("/assets/"):
                target = _target_file(dist, path)
                if not target.exists():
                    fatals.append(f"{rel}: missing {attr} target {path}")

        lower = source.lower()
        is_admin = rel.startswith("admin/")
        if not is_admin:
            for phrase in PUBLIC_INTERNAL_PHRASES:
                if phrase in lower:
                    fatals.append(f"{rel}: public page contains internal wording '{phrase}'")
            for phrase in STALE_PUBLIC_FACTS:
                if phrase in lower:
                    fatals.append(f"{rel}: public page contains stale fact/copy '{phrase}'")
        for phrase in PROTOTYPE_PHRASES:
            if phrase in lower:
                warnings.append(f"{rel}: prototype wording contains '{phrase}'")

    print(f"Concept QA: {len(concept_pages)} pages checked")
    print(f"Concept QA warnings: {len(warnings)}")
    for warning in warnings[:24]:
        print(f"  WARN {warning}")
    if len(warnings) > 24:
        print(f"  ... {len(warnings) - 24} more warnings")

    print(f"Concept QA fatal issues: {len(fatals)}")
    for issue in fatals[:40]:
        print(f"  FAIL {issue}")
    if len(fatals) > 40:
        print(f"  ... {len(fatals) - 40} more fatal issues")
    if fatals:
        raise RuntimeError(f"Concept quality audit failed with {len(fatals)} structural issue(s)")

    # Final fail-closed launch rehearsal while preserving preview noindex.
    audit_launch_readiness(dist, concept_pages)
    return {"pages": len(concept_pages), "warnings": len(warnings), "fatals": len(fatals)}


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    dist = root / "dist"
    pages = list((dist / "concept").rglob("*.html"))
    audit_concept(dist, pages)
