#!/usr/bin/env python3
"""
Predeployment audit for the Aastha website source folder.

This is stricter than the normal page QA. It checks whether the project is
ready to be copied into a public deployment folder.
"""

from __future__ import annotations

import html
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
PRIMARY = "https://www.aasthaskincentre.in"
PLACEHOLDER_PHRASES = {
    "content integration placeholder",
    "developer action required",
    "approved doctor photo required",
    "doctor photograph placeholder",
    "replace this content with",
    "article title",
}

def first(pattern: str, text: str) -> str:
    match = re.search(pattern, text, flags=re.I | re.S)
    return match.group(1).strip() if match else ""

def public_html_files():
    excluded = {
        "backups", "reports", "content-drop", "schema-drop",
        ".venv", "dist", "tools", "scripts"
    }
    for path in ROOT.rglob("*.html"):
        if any(part in excluded for part in path.parts):
            continue
        if "post-template" in path.parts:
            continue
        yield path

def local_link_exists(href: str) -> bool:
    if href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return True
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc:
        return True
    path = parsed.path
    if not path.startswith("/"):
        return True
    if path == "/":
        return (ROOT / "index.html").exists()
    candidate = ROOT / path.strip("/")
    if candidate.is_dir():
        return (candidate / "index.html").exists()
    if candidate.suffix:
        return candidate.exists()
    return (candidate / "index.html").exists()

def main() -> int:
    issues = []
    canonical_to_files = defaultdict(list)
    indexable_urls = set()

    def add(level: str, file: str, message: str):
        issues.append({"level": level, "file": file, "message": message})

    required = [
        "index.html",
        "404.html",
        "robots.txt",
        "sitemap.xml",
        "assets/css/styles.css",
        "assets/js/site.js",
        "assets/js/theme-init.js",
        "assets/data/site-config.json",
        "blog/index.html",
    ]
    for relative in required:
        if not (ROOT / relative).exists():
            add("ERROR", relative, "Required public file is missing.")

    config_path = ROOT / "assets" / "data" / "site-config.json"
    if config_path.exists():
        try:
            config = json.loads(config_path.read_text(encoding="utf-8"))
            for dotted in [
                ("social.instagram", config.get("social", {}).get("instagram")),
                ("social.youtube", config.get("social", {}).get("youtube")),
                ("locations.karan_nagar.google_maps", config.get("locations", {}).get("karan_nagar", {}).get("google_maps")),
                ("locations.paloura.google_maps", config.get("locations", {}).get("paloura", {}).get("google_maps")),
            ]:
                if not dotted[1]:
                    add("ERROR", "assets/data/site-config.json", f"{dotted[0]} is empty.")
        except Exception as exc:
            add("ERROR", "assets/data/site-config.json", f"Invalid JSON: {exc}")

    for path in sorted(public_html_files()):
        rel = str(path.relative_to(ROOT)).replace("\\", "/")
        text = path.read_text(encoding="utf-8", errors="ignore")
        title = first(r"<title>(.*?)</title>", text)
        description = first(r'<meta\s+name="description"\s+content="(.*?)"', text)
        robots = first(r'<meta\s+name="robots"\s+content="(.*?)"', text)
        canonical = first(r'<link\s+rel="canonical"\s+href="(.*?)"', text)
        h1_count = len(re.findall(r"<h1\b", text, flags=re.I))
        indexable = "noindex" not in robots.lower()

        if not title:
            add("ERROR", rel, "Missing page title.")
        if not description:
            add("ERROR", rel, "Missing meta description.")
        if h1_count != 1:
            add("ERROR", rel, f"Expected exactly one H1; found {h1_count}.")
        if not canonical:
            add("ERROR", rel, "Missing canonical URL.")
        elif not canonical.startswith(PRIMARY):
            add("ERROR", rel, "Canonical is not on the primary .in domain.")
        else:
            canonical_to_files[canonical].append(rel)
            if indexable:
                indexable_urls.add(canonical)

        if "/assets/js/theme-init.js" not in text:
            add("WARNING", rel, "Theme initialisation script is not included.")

        if indexable:
            lowered = text.lower()
            for phrase in PLACEHOLDER_PHRASES:
                if phrase in lowered:
                    add("ERROR", rel, f"Indexable page contains placeholder text: {phrase}")
            if "localhost:" in lowered or "127.0.0.1:" in lowered:
                add("ERROR", rel, "Indexable page contains a local-development URL.")

        for href in re.findall(r'<a\b[^>]*\bhref="([^"]+)"', text, flags=re.I):
            if not local_link_exists(href):
                add("ERROR", rel, f"Broken internal link: {href}")

        for block in re.findall(
            r'<script\s+type="application/ld\+json">(.*?)</script>',
            text,
            flags=re.I | re.S,
        ):
            try:
                json.loads(block)
            except Exception as exc:
                add("ERROR", rel, f"Invalid JSON-LD: {exc}")

    for canonical, files in canonical_to_files.items():
        if len(files) > 1:
            add("ERROR", "multiple pages", f"Duplicate canonical {canonical}: {', '.join(files)}")

    sitemap_path = ROOT / "sitemap.xml"
    if sitemap_path.exists():
        sitemap_text = sitemap_path.read_text(encoding="utf-8", errors="ignore")
        sitemap_urls = set(re.findall(r"<loc>(.*?)</loc>", sitemap_text))
        for url in sorted(indexable_urls - sitemap_urls):
            add("ERROR", "sitemap.xml", f"Indexable URL missing from sitemap: {url}")
        for url in sorted(sitemap_urls - indexable_urls):
            add("WARNING", "sitemap.xml", f"Sitemap URL is not currently indexable: {url}")

    # Local-only folders are allowed in source but must never be copied to dist.
    for local_name in ["content-drop", "schema-drop", "backups", "reports", ".venv"]:
        if (ROOT / local_name).exists():
            add("INFO", local_name, "Local-only folder detected; the deployment builder excludes it.")

    REPORTS.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    report = REPORTS / f"predeploy-check-{stamp}.html"

    counts = defaultdict(int)
    for issue in issues:
        counts[issue["level"]] += 1

    rows = "".join(
        "<tr>" +
        f"<td>{html.escape(issue['level'])}</td>" +
        f"<td>{html.escape(issue['file'])}</td>" +
        f"<td>{html.escape(issue['message'])}</td>" +
        "</tr>"
        for issue in issues
    )
    report.write_text(
        f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Aastha Predeploy Report</title>
<style>
body{{font-family:Arial,sans-serif;margin:32px;color:#242124}}
h1{{color:#7b1e3a}}
.summary{{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}}
.badge{{padding:8px 12px;border-radius:999px;background:#fff4cc;font-weight:bold}}
table{{border-collapse:collapse;width:100%}}
th,td{{border:1px solid #ddd;padding:9px;vertical-align:top;text-align:left}}
th{{background:#7b1e3a;color:#fff}}
</style></head><body>
<h1>Aastha Predeployment Check</h1>
<div class="summary">{''.join(f'<span class="badge">{html.escape(k)}: {v}</span>' for k,v in sorted(counts.items()))}</div>
<table><tr><th>Level</th><th>File</th><th>Message</th></tr>{rows}</table>
</body></html>""",
        encoding="utf-8",
    )

    print(f"Errors: {counts['ERROR']} | Warnings: {counts['WARNING']} | Info: {counts['INFO']}")
    print(f"Report: {report}")
    return 2 if counts["ERROR"] else 0

if __name__ == "__main__":
    raise SystemExit(main())
