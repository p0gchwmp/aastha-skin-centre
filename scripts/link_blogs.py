#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import html
import re
import shutil
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse

try:
    from lxml import etree
    from lxml import html as lxml_html
except ImportError as exc:
    raise SystemExit("Install lxml inside .venv before running the blog linker.") from exc

ROOT = Path(__file__).resolve().parents[1]
MAP_PATH = ROOT / "content" / "blog-keyword-map.csv"
REPORTS = ROOT / "reports"
BACKUPS = ROOT / "backups"
SKIP_TAGS = {"a", "script", "style", "code", "pre", "button", "textarea", "h1", "h2", "h3", "h4", "nav", "footer"}

def load_rows():
    with MAP_PATH.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    active = []
    for row in rows:
        if row.get("status", "").strip().lower() != "published":
            continue
        target = row.get("target_blog_url", "").strip()
        if not target.startswith("/blog/"):
            continue
        aliases = [row.get("keyword", "").strip()]
        aliases += [item.strip() for item in row.get("aliases", "").split("|") if item.strip()]
        aliases = sorted(set(filter(None, aliases)), key=len, reverse=True)
        if aliases:
            row["_aliases"] = aliases
            active.append(row)
    return active

def target_exists(target):
    path = urlparse(target).path
    if path == "/blog/":
        return (ROOT / "blog" / "index.html").exists()
    return (ROOT / path.strip("/") / "index.html").exists()

def text_nodes(root):
    for element in root.iter():
        if not isinstance(element.tag, str):
            continue
        if element.tag.lower() in SKIP_TAGS:
            continue
        if any(
            isinstance(parent.tag, str) and parent.tag.lower() in SKIP_TAGS
            for parent in element.iterancestors()
        ):
            continue
        if element.text:
            yield element, "text"
        if element.tail and element.getparent() is not None:
            yield element, "tail"

def link_first_occurrence(document, aliases, target):
    main = document.xpath('//main[@id="main-content"]')
    if not main:
        return False
    root = main[0]
    pattern = re.compile(r"(?<![\w-])(" + "|".join(re.escape(a) for a in aliases) + r")(?![\w-])", re.I)

    for element, slot in text_nodes(root):
        value = getattr(element, slot)
        match = pattern.search(value or "")
        if not match:
            continue

        before = value[:match.start()]
        matched = value[match.start():match.end()]
        after = value[match.end():]
        anchor = etree.Element("a", href=target)
        anchor.set("class", "keyword-blog-link")
        anchor.text = matched

        if slot == "text":
            element.text = before
            element.insert(0, anchor)
            anchor.tail = after
        else:
            parent = element.getparent()
            index = parent.index(element)
            element.tail = before
            parent.insert(index + 1, anchor)
            anchor.tail = after
        return True
    return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    rows = load_rows()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_root = BACKUPS / f"blog-links-{stamp}"
    results = []

    for row in rows:
        target = row["target_blog_url"].strip()
        if not target_exists(target):
            results.append(("ERROR", target, "", "Target blog page does not exist."))
            continue

        source_filter = row.get("source_static_page", "").strip()
        candidates = []
        if source_filter:
            source_file = ROOT / source_filter.strip("/") / "index.html"
            if source_filter == "/":
                source_file = ROOT / "index.html"
            if source_file.exists():
                candidates = [source_file]
        else:
            candidates = list(ROOT.rglob("*.html"))

        for path in candidates:
            if any(part in {"blog", "backups", "reports", "content-drop", "schema-drop"} for part in path.parts):
                continue
            raw = path.read_text(encoding="utf-8", errors="ignore")
            try:
                document = lxml_html.document_fromstring(raw)
            except Exception as exc:
                results.append(("ERROR", target, str(path.relative_to(ROOT)), f"HTML parse failed: {exc}"))
                continue
            if link_first_occurrence(document, row["_aliases"], target):
                results.append(("DRY-RUN OK" if args.dry_run else "LINKED", target, str(path.relative_to(ROOT)), row["keyword"]))
                if not args.dry_run:
                    backup = backup_root / path.relative_to(ROOT)
                    backup.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(path, backup)
                    output = etree.tostring(document, method="html", encoding="unicode", doctype="<!doctype html>")
                    path.write_text(output, encoding="utf-8")
            else:
                results.append(("NOT FOUND", target, str(path.relative_to(ROOT)), row["keyword"]))

    REPORTS.mkdir(exist_ok=True)
    report = REPORTS / f"blog-links-{'dry-run' if args.dry_run else 'applied'}-{stamp}.html"
    rows_html = "".join(
        f"<tr><td>{html.escape(status)}</td><td>{html.escape(target)}</td><td>{html.escape(file)}</td><td>{html.escape(message)}</td></tr>"
        for status, target, file, message in results
    )
    report.write_text(
        f"""<!doctype html><html><head><meta charset="utf-8"><title>Blog Link Report</title>
<style>body{{font-family:Arial;margin:32px}}h1{{color:#7b1e3a}}table{{border-collapse:collapse;width:100%}}th,td{{border:1px solid #ddd;padding:8px}}th{{background:#7b1e3a;color:white}}</style>
</head><body><h1>Blog Keyword Link Report</h1><table><tr><th>Status</th><th>Target</th><th>Static page</th><th>Keyword</th></tr>{rows_html}</table></body></html>""",
        encoding="utf-8"
    )
    print(f"Active published mappings: {len(rows)}")
    print(f"Report: {report}")

if __name__ == "__main__":
    main()
