#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
DROP = ROOT / "schema-drop"
REPORTS = ROOT / "reports"
BACKUPS = ROOT / "backups"
PRIMARY = "https://www.aasthaskincentre.in"

LEGACY = {
    "/patient-concerns/": "/conditions/",
    "/treatments/botox-dermal-fillers/": "/treatments/botulinum-toxin-dermal-fillers/",
    "/treatments/eczema-treatment/": "/treatments/eczema-atopic-dermatitis-treatment/",
    "/treatments/black-neck-acanthosis-nigricans/": "/treatments/black-neck-acanthosis-nigricans-treatment/"
}

def page_path(data):
    graph = data.get("@graph", [data]) if isinstance(data, dict) else []
    if not isinstance(graph, list):
        graph = [graph]
    candidates = []
    for item in graph:
        if isinstance(item, dict) and item.get("@type") in {
            "MedicalWebPage", "WebPage", "AboutPage", "ProfilePage",
            "CollectionPage", "ContactPage", "BlogPosting", "Blog"
        } and item.get("url"):
            candidates.append(item["url"])
    if not candidates:
        for item in graph:
            if isinstance(item, dict) and item.get("url"):
                candidates.append(item["url"])
    if not candidates:
        raise ValueError("No page URL found in JSON-LD.")
    parsed = urlparse(unquote(str(candidates[0])))
    path = parsed.path or "/"
    if not path.endswith("/"):
        path += "/"
    return LEGACY.get(path, path)

def destination(path):
    return ROOT / "index.html" if path == "/" else ROOT / path.strip("/") / "index.html"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_root = BACKUPS / f"schema-upgrade-{stamp}"
    results = []

    for schema_file in sorted(DROP.rglob("*.json")):
        try:
            data = json.loads(schema_file.read_text(encoding="utf-8"))
            path = page_path(data)
            target = destination(path)
            if not target.exists():
                raise FileNotFoundError(f"No website page exists for {path}")
            encoded = json.dumps(data, ensure_ascii=False, indent=2)
            encoded = re.sub(
                r"https://(?:www\.)?aasthaskincentre\.(?:in|com)",
                PRIMARY,
                encoded,
                flags=re.I
            )
            status = "DRY-RUN OK" if args.dry_run else "APPLIED"
            results.append((status, path, str(schema_file.relative_to(DROP)), ""))
            if args.dry_run:
                continue

            backup = backup_root / target.relative_to(ROOT)
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup)

            page = target.read_text(encoding="utf-8", errors="ignore")
            page = re.sub(
                r'\s*<script\s+type="application/ld\+json">.*?</script>',
                "",
                page,
                flags=re.I | re.S
            )
            page = page.replace(
                "</head>",
                f'  <script type="application/ld+json">\n{encoded}\n</script>\n</head>',
                1
            )
            target.write_text(page, encoding="utf-8")
        except Exception as exc:
            results.append(("ERROR", "", str(schema_file.relative_to(DROP)), str(exc)))

    REPORTS.mkdir(exist_ok=True)
    report = REPORTS / f"schema-upgrade-{'dry-run' if args.dry_run else 'applied'}-{stamp}.html"
    body = "".join(
        f"<tr><td>{html.escape(status)}</td><td>{html.escape(path)}</td><td>{html.escape(file)}</td><td>{html.escape(message)}</td></tr>"
        for status, path, file, message in results
    )
    report.write_text(
        f"""<!doctype html><html><head><meta charset="utf-8"><title>Schema Upgrade Report</title>
<style>body{{font-family:Arial;margin:32px}}h1{{color:#7b1e3a}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #ddd;padding:8px}}th{{background:#7b1e3a;color:white}}</style>
</head><body><h1>Schema Upgrade Report</h1><table><tr><th>Status</th><th>Page</th><th>JSON file</th><th>Message</th></tr>{body}</table></body></html>""",
        encoding="utf-8"
    )
    print(f"Schema files checked: {len(results)}")
    print(f"Report: {report}")

if __name__ == "__main__":
    main()
