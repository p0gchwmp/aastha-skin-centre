#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / "sitemap.xml"
REPORTS = ROOT / "reports"

CHECKS = [
    "Page loads without an error",
    "Header and navigation render correctly",
    "H1 and main content are present",
    "No placeholder or developer text is visible",
    "Fee, phone numbers, address and timings are correct",
    "Call, WhatsApp and appointment links work",
    "Dark mode remains readable",
    "Mobile layout is acceptable",
    "No obvious spelling, spacing or formatting problem",
]

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("staging_url")
    args = parser.parse_args()

    base = args.staging_url.rstrip("/")
    parsed = urlparse(base)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise SystemExit("Enter a full staging URL beginning with https://")

    if not SITEMAP.exists():
        raise SystemExit(f"Missing sitemap: {SITEMAP}")

    sitemap_text = SITEMAP.read_text(encoding="utf-8", errors="ignore")
    canonical_urls = re.findall(r"<loc>(.*?)</loc>", sitemap_text)
    if not canonical_urls:
        raise SystemExit("No URLs were found in sitemap.xml")

    sections = []
    for index, canonical in enumerate(canonical_urls, start=1):
        path = urlparse(canonical).path or "/"
        staging = base + (path if path.startswith("/") else "/" + path)
        checklist = "".join(
            f'<label><input type="checkbox"> {html.escape(item)}</label>'
            for item in CHECKS
        )
        sections.append(
            f"""<section class="page-card">
              <div class="page-head">
                <span class="number">{index}</span>
                <div>
                  <h2>{html.escape(path)}</h2>
                  <a href="{html.escape(staging)}" target="_blank" rel="noopener">{html.escape(staging)}</a>
                </div>
              </div>
              <div class="checks">{checklist}</div>
              <label class="notes">Notes<textarea rows="4" placeholder="Record the problem, device and expected result"></textarea></label>
            </section>"""
        )

    REPORTS.mkdir(exist_ok=True)
    output = REPORTS / "staging-acceptance-checklist.html"
    output.write_text(
        f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aastha Staging Acceptance Checklist</title>
<style>
:root{{--burgundy:#7b1e3a;--gold:#d4af37;--cream:#fffaf0;--ink:#242124;--line:#e5d7dc}}
*{{box-sizing:border-box}}
body{{margin:0;background:linear-gradient(135deg,var(--cream),#f7e9ee);font-family:Arial,sans-serif;color:var(--ink)}}
main{{width:min(1100px,calc(100% - 28px));margin:32px auto}}
.hero{{background:white;border:1px solid var(--line);border-radius:24px;padding:28px;box-shadow:0 18px 50px rgba(80,30,45,.12)}}
h1{{margin-top:0;color:var(--burgundy)}} .summary{{font-weight:bold}}
.page-card{{margin-top:18px;background:white;border:1px solid var(--line);border-radius:18px;padding:20px}}
.page-head{{display:flex;gap:14px;align-items:flex-start}}
.number{{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--burgundy);color:white;font-weight:bold}}
h2{{margin:0 0 6px;font-size:1.1rem}}
a{{color:var(--burgundy);word-break:break-all}}
.checks{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:18px 0}}
.checks label{{padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:#fffdf8}}
.notes{{display:flex;flex-direction:column;gap:6px;font-weight:bold}}
textarea{{padding:10px;border:1px solid var(--line);border-radius:10px;font:inherit}}
@media(max-width:760px){{.checks{{grid-template-columns:1fr}}}}
@media print{{body{{background:white}} .page-card{{break-inside:avoid}}}}
</style>
</head>
<body><main>
<section class="hero">
<h1>Aastha Staging Acceptance Checklist</h1>
<p class="summary">Pages to review: {len(sections)}</p>
<p>Open each page, complete the checks and record anything that needs correction. Save or print the report after completing a review session.</p>
</section>
{''.join(sections)}
</main></body></html>""",
        encoding="utf-8"
    )

    print(f"Checklist created: {output}")
    print(f"Pages included: {len(sections)}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
