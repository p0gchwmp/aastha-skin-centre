#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
CONTENT_DROP = ROOT / "content-drop"

def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")

def first(pattern: str, text: str) -> str:
    m = re.search(pattern, text, flags=re.I | re.S)
    return re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else ""

def main() -> int:
    REPORTS.mkdir(exist_ok=True)

    docx_files = sorted(CONTENT_DROP.rglob("*.docx")) if CONTENT_DROP.exists() else []
    json_files = sorted(CONTENT_DROP.rglob("*.json")) if CONTENT_DROP.exists() else []
    html_files = [
        p for p in ROOT.rglob("*.html")
        if not any(part in {"reports", "backups", "content-drop"} for part in p.parts)
    ]

    rows = []
    indexable = 0
    placeholders = 0
    imported_treatments = 0
    recent = []

    for path in html_files:
        text = read_text(path)
        rel = str(path.relative_to(ROOT)).replace("\\", "/")
        title = first(r"<title>(.*?)</title>", text)
        robots = first(r'<meta\s+name="robots"\s+content="(.*?)"', text)
        canonical = first(r'<link\s+rel="canonical"\s+href="(.*?)"', text)
        is_placeholder = "content integration placeholder" in text.lower()
        is_indexable = "noindex" not in robots.lower()

        if is_indexable:
            indexable += 1
        if is_placeholder:
            placeholders += 1
        if rel.startswith("treatments/") and rel != "treatments/index.html" and is_indexable and not is_placeholder:
            imported_treatments += 1

        recent.append((path.stat().st_mtime, rel, title, robots, is_placeholder))
        rows.append({
            "file": rel,
            "title": title,
            "robots": robots,
            "canonical": canonical,
            "placeholder": "YES" if is_placeholder else "NO",
            "modified": datetime.fromtimestamp(path.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
        })

    recent.sort(reverse=True)

    latest_import_reports = sorted(
        REPORTS.glob("import-report-import-*.csv"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    latest_dry_reports = sorted(
        REPORTS.glob("import-report-dry-run-*.csv"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    import_summary = "No import report found."
    latest_import_name = ""
    if latest_import_reports:
        latest = latest_import_reports[0]
        latest_import_name = latest.name
        text = read_text(latest)
        counts = Counter()
        for status in ("IMPORTED", "ERROR", "WARNING", "DRY-RUN OK"):
            counts[status] = len(re.findall(rf"(?m)^{re.escape(status)},", text))
        import_summary = ", ".join(f"{k}: {v}" for k, v in counts.items() if v) or "Report found, but no status rows detected."

    homepage_text = read_text(ROOT / "index.html") if (ROOT / "index.html").exists() else ""
    homepage_title = first(r"<title>(.*?)</title>", homepage_text)
    homepage_modified = (
        datetime.fromtimestamp((ROOT / "index.html").stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")
        if (ROOT / "index.html").exists() else "Missing"
    )

    likely_causes = []
    if imported_treatments > 0:
        likely_causes.append(
            "Treatment pages were imported. Opening only the homepage will not show those page-body changes."
        )
    if placeholders > 0:
        likely_causes.append(
            f"{placeholders} page(s) still contain development placeholders; these pages were not successfully imported."
        )
    if not latest_import_reports:
        likely_causes.append(
            "No completed import report was found in this exact folder. The importer may have been run from another extracted copy."
        )
    if len(docx_files) == 0 or len(json_files) == 0:
        likely_causes.append(
            "The content-drop folder in this exact copy does not contain both DOCX and JSON-LD files."
        )
    likely_causes.append(
        "An older Python preview server on port 8000 can continue serving a different extracted folder until it is stopped."
    )
    likely_causes.append(
        "The browser may be showing a cached page; use the fresh-preview launcher supplied with this patch."
    )

    newest_rows = "\n".join(
        "<tr>" +
        f"<td>{html.escape(rel)}</td><td>{html.escape(title)}</td><td>{html.escape(robots)}</td>"
        f"<td>{'YES' if ph else 'NO'}</td><td>{datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')}</td>"
        + "</tr>"
        for ts, rel, title, robots, ph in recent[:20]
    )

    page_rows = "\n".join(
        "<tr>" +
        "".join(f"<td>{html.escape(str(row[key]))}</td>" for key in ("file", "title", "robots", "placeholder", "modified"))
        + "</tr>"
        for row in rows
    )

    report = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Aastha Local Folder Diagnostic</title>
<style>
body{{font-family:Arial,sans-serif;margin:32px;color:#242124;line-height:1.5}}
h1,h2{{color:#7b1e3a}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}}
.card{{border:1px solid #ddd;border-radius:14px;padding:16px;background:#fffaf0}}
.card strong{{display:block;font-size:1.6rem;color:#7b1e3a}}
.notice{{padding:16px;border-left:4px solid #d4af37;background:#fff7d9}}
table{{width:100%;border-collapse:collapse;font-size:13px;margin-top:12px}}
th,td{{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}}
th{{background:#7b1e3a;color:#fff}}
tr:nth-child(even){{background:#faf7f8}}
code{{background:#f2edef;padding:2px 5px}}
</style>
</head>
<body>
<h1>Aastha Local Website Diagnostic</h1>
<p><strong>Folder being checked:</strong> <code>{html.escape(str(ROOT))}</code></p>

<div class="cards">
  <div class="card"><strong>{len(docx_files)}</strong>DOCX files in content-drop</div>
  <div class="card"><strong>{len(json_files)}</strong>JSON files in content-drop</div>
  <div class="card"><strong>{indexable}</strong>Indexable HTML pages</div>
  <div class="card"><strong>{imported_treatments}</strong>Imported treatment pages</div>
  <div class="card"><strong>{placeholders}</strong>Remaining placeholders</div>
</div>

<h2>Latest import status</h2>
<div class="notice">
  <p><strong>Latest import report:</strong> {html.escape(latest_import_name or 'None')}</p>
  <p>{html.escape(import_summary)}</p>
  <p><strong>Homepage title:</strong> {html.escape(homepage_title)}</p>
  <p><strong>Homepage modified:</strong> {html.escape(homepage_modified)}</p>
</div>

<h2>What is probably happening</h2>
<ul>{''.join(f'<li>{html.escape(item)}</li>' for item in likely_causes)}</ul>

<h2>Newest 20 HTML files</h2>
<table>
<thead><tr><th>File</th><th>Title</th><th>Robots</th><th>Placeholder</th><th>Modified</th></tr></thead>
<tbody>{newest_rows}</tbody>
</table>

<h2>All pages</h2>
<table>
<thead><tr><th>File</th><th>Title</th><th>Robots</th><th>Placeholder</th><th>Modified</th></tr></thead>
<tbody>{page_rows}</tbody>
</table>
</body>
</html>"""

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    out = REPORTS / f"local-folder-diagnostic-{stamp}.html"
    out.write_text(report, encoding="utf-8")

    print(f"Folder checked: {ROOT}")
    print(f"DOCX: {len(docx_files)} | JSON: {len(json_files)}")
    print(f"Imported treatments: {imported_treatments} | Placeholders: {placeholders}")
    print(f"Report: {out}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
