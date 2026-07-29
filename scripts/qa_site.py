#!/usr/bin/env python3
"""
Audit the static Aastha website after content import.

Checks:
- title, meta description, canonical, robots and H1
- primary-domain consistency
- valid JSON-LD
- medical disclaimer on indexable treatment pages
- placeholder/noindex status
- broken root-relative links
- sitemap consistency

Run:
    py scripts/qa_site.py
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

SITE_ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = SITE_ROOT / "reports"
PRIMARY_ORIGIN = "https://www.aasthaskincentre.in"
DISCLAIMER_FRAGMENT = "Results may vary from person to person."

def find_first(pattern: str, text: str) -> str:
    match = re.search(pattern, text, flags=re.I | re.S)
    return match.group(1).strip() if match else ""

def html_to_url(path: Path) -> str:
    rel = path.relative_to(SITE_ROOT)
    if rel.name == "index.html":
        url_path = "/" + str(rel.parent).replace("\\", "/").strip("/")
        if url_path != "/":
            url_path += "/"
    elif rel.name == "404.html":
        url_path = "/404/"
    else:
        url_path = "/" + str(rel).replace("\\", "/")
    return PRIMARY_ORIGIN + url_path

def local_target_exists(href: str) -> bool:
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc or href.startswith("#") or href.startswith(("mailto:", "tel:", "javascript:")):
        return True
    path = parsed.path
    if not path.startswith("/"):
        return True
    if path == "/":
        return (SITE_ROOT / "index.html").exists()
    candidate = SITE_ROOT / path.strip("/")
    if candidate.is_dir():
        return (candidate / "index.html").exists()
    if candidate.suffix:
        return candidate.exists()
    return (candidate / "index.html").exists()

def main() -> int:
    issues = []
    canonicals = defaultdict(list)
    indexable_urls = set()

    excluded_parts = {
        ".venv",
        "backups",
        "content-drop",
        "dist",
        "reports",
        "schema-drop",
        "scripts",
        "tools",
    }

    for path in sorted(SITE_ROOT.rglob("*.html")):
        if any(part in excluded_parts for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = str(path.relative_to(SITE_ROOT)).replace("\\", "/")
        title = find_first(r"<title>(.*?)</title>", text)
        description = find_first(r'<meta\s+name="description"\s+content="(.*?)"', text)
        robots = find_first(r'<meta\s+name="robots"\s+content="(.*?)"', text)
        canonical = find_first(r'<link\s+rel="canonical"\s+href="(.*?)"', text)
        h1s = re.findall(r"<h1\b[^>]*>(.*?)</h1>", text, flags=re.I | re.S)
        h1s = [re.sub(r"<[^>]+>", "", h).strip() for h in h1s]
        indexable = "noindex" not in robots.lower()

        def add(level: str, message: str):
            issues.append({"level": level, "file": rel, "url": canonical or html_to_url(path), "message": message})

        if not title:
            add("ERROR", "Missing title.")
        elif len(re.sub(r"<[^>]+>", "", title)) > 60:
            add("WARNING", f"Title is longer than 60 characters ({len(title)}).")

        if not description:
            add("ERROR", "Missing meta description.")
        elif len(description) > 155:
            add("WARNING", f"Meta description is longer than 155 characters ({len(description)}).")

        if len(h1s) != 1:
            add("ERROR", f"Expected one H1; found {len(h1s)}.")

        if not canonical:
            add("ERROR", "Missing canonical URL.")
        else:
            canonicals[canonical].append(rel)
            if not canonical.startswith(PRIMARY_ORIGIN):
                add("ERROR", "Canonical is not on the primary .in domain.")

        if not robots:
            add("WARNING", "Missing robots meta tag.")

        if indexable:
            if canonical:
                indexable_urls.add(canonical)
            if "content integration placeholder" in text.lower():
                add("ERROR", "Indexable page still contains the development placeholder.")
            canonical_path = urlparse(canonical).path if canonical else ""
            is_individual_treatment_page = (
                canonical_path.startswith("/treatments/")
                and canonical_path.rstrip("/") != "/treatments"
            )
            if is_individual_treatment_page and DISCLAIMER_FRAGMENT not in text:
                add("ERROR", "Indexable treatment page is missing the medical disclaimer.")

        for schema_text in re.findall(
            r'<script\s+type="application/ld\+json">(.*?)</script>',
            text,
            flags=re.I | re.S,
        ):
            try:
                json.loads(schema_text)
            except Exception as exc:
                add("ERROR", f"Invalid JSON-LD: {exc}")

        for href in re.findall(r'<a\b[^>]*\bhref="([^"]+)"', text, flags=re.I):
            if not local_target_exists(href):
                add("ERROR", f"Broken internal link: {href}")

    for canonical, files in canonicals.items():
        if len(files) > 1:
            for rel in files:
                issues.append({
                    "level": "ERROR",
                    "file": rel,
                    "url": canonical,
                    "message": "Duplicate canonical shared by: " + ", ".join(files),
                })

    sitemap_path = SITE_ROOT / "sitemap.xml"
    sitemap_urls = set()
    if sitemap_path.exists():
        sitemap_text = sitemap_path.read_text(encoding="utf-8", errors="ignore")
        sitemap_urls = set(re.findall(r"<loc>(.*?)</loc>", sitemap_text))
        for url in sorted(indexable_urls - sitemap_urls):
            issues.append({"level": "ERROR", "file": "sitemap.xml", "url": url, "message": "Indexable page missing from sitemap."})
        for url in sorted(sitemap_urls - indexable_urls):
            issues.append({"level": "WARNING", "file": "sitemap.xml", "url": url, "message": "Sitemap URL is not currently indexable or has no matching canonical."})
    else:
        issues.append({"level": "ERROR", "file": "sitemap.xml", "url": "", "message": "Missing sitemap.xml."})

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    report_path = REPORT_DIR / f"site-qa-{stamp}.html"
    json_path = REPORT_DIR / f"site-qa-{stamp}.json"

    counts = defaultdict(int)
    for issue in issues:
        counts[issue["level"]] += 1

    rows = "\n".join(
        "<tr>" + "".join(f"<td>{html.escape(str(issue[key]))}</td>" for key in ("level", "file", "url", "message")) + "</tr>"
        for issue in issues
    )
    report_path.write_text(
        f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Aastha Site QA</title>
<style>
body{{font-family:Arial,sans-serif;margin:32px;color:#242124}}
h1{{color:#7b1e3a}}
.summary{{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}}
.badge{{padding:8px 12px;border-radius:999px;background:#fff4cc;font-weight:bold}}
table{{width:100%;border-collapse:collapse;font-size:14px}}
th,td{{border:1px solid #ddd;padding:9px;vertical-align:top;text-align:left}}
th{{background:#7b1e3a;color:white}}
tr:nth-child(even){{background:#faf7f8}}
</style></head><body>
<h1>Aastha Website QA Report</h1>
<div class="summary">{''.join(f'<span class="badge">{html.escape(k)}: {v}</span>' for k,v in sorted(counts.items()))}</div>
<table><thead><tr><th>Level</th><th>File</th><th>URL</th><th>Message</th></tr></thead><tbody>{rows}</tbody></table>
</body></html>""",
        encoding="utf-8",
    )
    json_path.write_text(json.dumps(issues, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Errors: {counts['ERROR']} | Warnings: {counts['WARNING']}")
    print(f"HTML report: {report_path}")
    print(f"JSON report: {json_path}")
    return 2 if counts["ERROR"] else 0

if __name__ == "__main__":
    raise SystemExit(main())
