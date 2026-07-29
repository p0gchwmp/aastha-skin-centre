#!/usr/bin/env python3
import argparse, html, re
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

parser = argparse.ArgumentParser()
parser.add_argument("staging_url")
args = parser.parse_args()

base = args.staging_url.rstrip("/")
parsed = urlparse(base)
if parsed.scheme not in {"http", "https"} or not parsed.netloc:
    raise SystemExit("Enter a full staging URL beginning with https://")
if not SITEMAP.exists():
    raise SystemExit(f"Missing sitemap: {SITEMAP}")

urls = re.findall(r"<loc>(.*?)</loc>", SITEMAP.read_text(encoding="utf-8", errors="ignore"))
if not urls:
    raise SystemExit("No URLs were found in sitemap.xml")

cards = []
for i, canonical in enumerate(urls, 1):
    path = urlparse(canonical).path or "/"
    staging = base + path
    checks = "".join(f'<label><input type="checkbox"> {html.escape(item)}</label>' for item in CHECKS)
    cards.append(f'''<section class="page-card">
    <h2>{i}. {html.escape(path)}</h2>
    <p><a href="{html.escape(staging)}" target="_blank">{html.escape(staging)}</a></p>
    <div class="checks">{checks}</div>
    <label>Notes<textarea rows="4"></textarea></label>
    </section>''')

REPORTS.mkdir(exist_ok=True)
out = REPORTS / "staging-acceptance-checklist.html"
out.write_text(f'''<!doctype html><html><head><meta charset="utf-8">
<title>Aastha Staging Checklist</title>
<style>
body{{font-family:Arial;margin:32px;background:#fffaf0;color:#242124}}
h1{{color:#7b1e3a}} .page-card{{background:white;border:1px solid #ddd;border-radius:16px;padding:18px;margin:16px 0}}
.checks{{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}}
.checks label{{border:1px solid #ddd;padding:8px;border-radius:8px}}
textarea{{width:100%;padding:8px}}
@media(max-width:760px){{.checks{{grid-template-columns:1fr}}}}
</style></head><body>
<h1>Aastha Staging Acceptance Checklist</h1>
<p>Pages to review: {len(cards)}</p>
{''.join(cards)}
</body></html>''', encoding="utf-8")

print(f"Checklist created: {out}")
print(f"Pages included: {len(cards)}")
