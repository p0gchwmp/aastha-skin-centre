#!/usr/bin/env python3
"""Static QA for the isolated Aastha concept preview.

Fail only on structural defects that should never ship. Softer content smells are
reported as warnings so the preview can keep moving while copy is refined.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import re
from urllib.parse import urlsplit

ATTR_RE = re.compile(r'''\b(href|src)\s*=\s*["']([^"']+)["']''', re.I)
ID_RE = re.compile(r'''\bid\s*=\s*["']([^"']+)["']''', re.I)
H1_RE = re.compile(r"<h1\b", re.I)
ROBOTS_RE = re.compile(
    r'''<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>''',
    re.I,
)
HERO_IMG_RE = re.compile(
    r'''<section\b[^>]*class=["'][^"']*\beditorial-hero\b[^"']*["'][^>]*>.*?<img\b([^>]*)>''',
    re.I | re.S,
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
    fatals: list[str] = []
    warnings: list[str] = []
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

    return {"pages": len(concept_pages), "warnings": len(warnings), "fatals": len(fatals)}


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    dist = root / "dist"
    pages = list((dist / "concept").rglob("*.html"))
    audit_concept(dist, pages)
