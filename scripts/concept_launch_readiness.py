#!/usr/bin/env python3
"""Fail-closed launch-readiness audit for the editorial preview build."""
from __future__ import annotations

from pathlib import Path
import hashlib
import html
import json
import os
import re

from concept_launch_hardening import PUBLIC_ORIGIN, public_path_for

META_RE = re.compile(r"<meta\b[^>]*>", re.I)
LINK_RE = re.compile(r"<link\b[^>]*>", re.I)
TITLE_RE = re.compile(r"<title\b[^>]*>(.*?)</title>", re.I | re.S)
H1_RE = re.compile(r"<h1\b", re.I)
JSONLD_RE = re.compile(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.I | re.S)


def _attr(tag: str, name: str) -> str:
    match = re.search(rf'\b{re.escape(name)}\s*=\s*["\']([^"\']*)["\']', tag, re.I)
    return html.unescape(match.group(1)).strip() if match else ""


def _meta(source: str, key: str, *, prop: bool = False) -> str:
    attr_name = "property" if prop else "name"
    for tag in META_RE.findall(source):
        if _attr(tag, attr_name).lower() == key.lower():
            return _attr(tag, "content")
    return ""


def _canonical(source: str) -> str:
    for tag in LINK_RE.findall(source):
        if _attr(tag, "rel").lower() == "canonical":
            return _attr(tag, "href")
    return ""


def _title(source: str) -> str:
    match = TITLE_RE.search(source)
    if not match:
        return ""
    return re.sub(r"<[^>]+>", " ", match.group(1)).strip()


def audit_launch_readiness(dist: Path, concept_pages: list[Path]) -> dict:
    blockers = []
    warnings = []
    concept_root = dist / "concept"
    public_records = []
    seen_canonicals = {}

    for page in concept_pages:
        public_path = public_path_for(page, concept_root)
        if public_path is None:
            continue
        rel = page.relative_to(concept_root).as_posix()
        source = page.read_text(encoding="utf-8")

        robots = _meta(source, "robots").lower()
        if "noindex" not in robots:
            blockers.append(f"{rel}: preview page lost noindex")

        title = _title(source)
        if not title:
            blockers.append(f"{rel}: missing title")
        if re.search(r"\b(concept|preview)\b", title, re.I):
            blockers.append(f"{rel}: prototype wording leaked into title")

        description = _meta(source, "description")
        if len(description) < 55:
            blockers.append(f"{rel}: meta description too short or missing")

        canonical = _canonical(source)
        expected = PUBLIC_ORIGIN + public_path
        if canonical != expected:
            blockers.append(f"{rel}: canonical mismatch ({canonical!r} != {expected!r})")
        if "/concept/" in canonical:
            blockers.append(f"{rel}: canonical points at preview route")
        if canonical in seen_canonicals:
            blockers.append(f"{rel}: duplicate canonical also used by {seen_canonicals[canonical]}")
        elif canonical:
            seen_canonicals[canonical] = rel

        for prop in ("og:title", "og:description", "og:url", "og:site_name", "og:image"):
            if not _meta(source, prop, prop=True):
                blockers.append(f"{rel}: missing {prop}")
        if _meta(source, "og:url", prop=True) != canonical:
            blockers.append(f"{rel}: og:url does not match canonical")
        for name in ("twitter:card", "twitter:title", "twitter:description", "twitter:image"):
            if not _meta(source, name):
                blockers.append(f"{rel}: missing {name}")

        schema_blocks = JSONLD_RE.findall(source)
        if len(schema_blocks) != 1:
            blockers.append(f"{rel}: expected exactly one controlled JSON-LD block")
            schema_types = []
        else:
            try:
                schema = json.loads(schema_blocks[0])
                graph = schema.get("@graph", [])
                schema_types = [str(item.get("@type", "")) for item in graph]
                if schema.get("@context") != "https://schema.org":
                    blockers.append(f"{rel}: schema context is not schema.org")
            except Exception as exc:
                blockers.append(f"{rel}: invalid JSON-LD ({exc})")
                schema_types = []

        h1_count = len(H1_RE.findall(source))
        if h1_count != 1:
            blockers.append(f"{rel}: expected exactly one H1, found {h1_count}")

        public_records.append({"path": public_path, "canonical": canonical, "title": title, "description_length": len(description), "schema_types": schema_types})

    required = [
        "index.html",
        "dr-cheena-langer/index.html",
        "book-appointment/index.html",
        "contact/index.html",
        "conditions/index.html",
        "treatments/index.html",
        "media/index.html",
        "locations/karan-nagar/index.html",
        "locations/paloura/index.html",
    ]
    for rel in required:
        if not (concept_root / rel).exists():
            blockers.append(f"required route missing: /concept/{rel.removesuffix('index.html')}")

    combined = "\n".join(page.read_text(encoding="utf-8") for page in concept_pages if public_path_for(page, concept_root) is not None)
    action_checks = {
        "booking route": 'href="/concept/book-appointment/"',
        "WhatsApp": "https://wa.me/917006613362",
        "primary phone": "tel:+917006613362",
        "Karan Nagar directions": "https://maps.app.goo.gl/pHCQ1r4crKuZBSi98",
        "Paloura directions": "https://maps.app.goo.gl/kh4AqZoUkscpEgWc8",
        "booking form": "data-v8-booking-form",
    }
    for label, needle in action_checks.items():
        if needle not in combined:
            blockers.append(f"patient action missing: {label}")

    prelaunch = dist / "prelaunch"
    candidate_robots = prelaunch / "robots.txt"
    candidate_sitemap = prelaunch / "sitemap.xml"
    candidate_routes = prelaunch / "routes.json"
    for file in (candidate_robots, candidate_sitemap, candidate_routes):
        if not file.exists():
            blockers.append(f"missing prelaunch artifact: {file.name}")

    if candidate_robots.exists():
        text = candidate_robots.read_text(encoding="utf-8")
        if "Disallow: /admin/" not in text or "Sitemap: https://www.aasthaskincentre.in/sitemap.xml" not in text:
            blockers.append("prelaunch robots candidate is incomplete")

    if candidate_sitemap.exists():
        sitemap = candidate_sitemap.read_text(encoding="utf-8")
        loc_count = sitemap.count("<loc>")
        if loc_count != len(public_records):
            blockers.append(f"prelaunch sitemap route count mismatch ({loc_count} != {len(public_records)})")
        if "/concept/" in sitemap:
            blockers.append("prelaunch sitemap contains preview routes")

    release = os.environ.get("RENDER_GIT_COMMIT") or os.environ.get("GIT_COMMIT") or "local"
    fingerprint_source = {"release": release, "routes": public_records, "blockers": blockers, "warnings": warnings}
    fingerprint = hashlib.sha256(json.dumps(fingerprint_source, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")).hexdigest()

    manifest = {
        "release": release,
        "manifest_fingerprint": fingerprint,
        "public_route_count": len(public_records),
        "technical_ready": not blockers,
        "explicit_go_live_required": True,
        "production_activation_performed": False,
        "preview_indexing_locked": True,
        "blockers": blockers,
        "warnings": warnings,
        "routes": public_records,
    }
    prelaunch.mkdir(parents=True, exist_ok=True)
    (prelaunch / "launch-readiness.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Launch readiness: routes={len(public_records)} blockers={len(blockers)} fingerprint={fingerprint[:12]}")
    for blocker in blockers[:40]:
        print(f"  FAIL {blocker}")
    if len(blockers) > 40:
        print(f"  ... {len(blockers) - 40} more blocker(s)")
    if blockers:
        raise RuntimeError(f"Launch readiness failed with {len(blockers)} blocker(s)")
    return manifest
