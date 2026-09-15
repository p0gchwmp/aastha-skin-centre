#!/usr/bin/env python3
"""Upgrade preview admin pages after dist is built.

This is a UX prototype only. Real access control remains the authenticated Wagtail admin.
"""
from __future__ import annotations

from html import escape
from pathlib import Path
import re


def _title(page: Path) -> str:
    raw = page.read_text(encoding="utf-8")
    m = re.search(r"<title>(.*?)</title>", raw, re.I | re.S)
    title = re.sub(r"<[^>]+>", "", m.group(1)).strip() if m else page.parent.name.replace("-", " ").title()
    return re.sub(r"\s+[—|-]\s+Aastha.*$", "", title).strip()


def _kind(route: str) -> str:
    if route == "/concept/": return "Homepage"
    if route.startswith("/concept/blog/"): return "Journal"
    if route.startswith("/concept/locations/"): return "Clinic"
    if route in {"/concept/conditions/", "/concept/treatments/"}: return "Directory"
    if route in {"/concept/dr-cheena-langer/", "/concept/about/", "/concept/contact/", "/concept/media/"}: return "Core page"
    if any(x in route for x in ("privacy-policy", "medical-disclaimer", "terms-and-conditions")): return "Policy"
    return "Clinical guide"


def upgrade_admin(dist: Path, concept_pages: list[Path]) -> int:
    concept_root = dist / "concept"
    public_pages = [p for p in concept_pages if concept_root / "admin" not in p.parents]
    routes = []
    for page in public_pages:
        rel = page.parent.relative_to(concept_root).as_posix()
        route = "/concept/" if rel in (".", "") else f"/concept/{rel}/"
        routes.append((_title(page), _kind(route), route))
    priority = {"Homepage":0,"Directory":1,"Core page":2,"Clinical guide":3,"Journal":4,"Clinic":5,"Policy":6}
    routes.sort(key=lambda x:(priority.get(x[1],9), x[0].lower()))

    rows = ''.join(
        f'<tr data-v36-admin-row data-kind="{escape(kind.lower())}" data-search="{escape((title+" "+kind+" "+route).lower())}">'
        f'<td><strong>{escape(title)}</strong><small>{escape(route)}</small></td>'
        f'<td>{escape(kind)}</td><td><span class="v36-admin-status">Mapped</span></td>'
        f'<td><a href="{escape(route)}" target="_blank" rel="noopener">Open preview ↗</a></td></tr>'
        for title,kind,route in routes
    )
    manager = f'''<div class="v36-admin-note"><strong>Preview workspace.</strong> This route is deliberately excluded from public navigation and indexing. Production publishing remains protected by Wagtail authentication.</div><div class="v36-admin-toolbar"><input class="v36-admin-search" data-v36-admin-search type="search" placeholder="Search {len(routes)} public routes…" aria-label="Search pages"><select class="v36-admin-filter" data-v36-admin-filter><option value="all">All page types</option><option value="clinical guide">Clinical guides</option><option value="directory">Directories</option><option value="core page">Core pages</option><option value="journal">Journal</option><option value="clinic">Clinics</option><option value="policy">Policies</option></select><span data-v36-admin-count>{len(routes)} routes</span></div><table class="v36-admin-route-table"><thead><tr><th>Page</th><th>Type</th><th>State</th><th>Action</th></tr></thead><tbody>{rows}</tbody></table>'''

    changed = 0
    for page in concept_pages:
        raw = page.read_text(encoding="utf-8")
        updated = raw
        if concept_root / "admin" in page.parents:
            if 'noarchive' not in updated:
                updated = updated.replace('content="noindex,nofollow"', 'content="noindex,nofollow,noarchive,nosnippet"')
            if 'name="referrer"' not in updated:
                updated = updated.replace('</head>', '<meta name="referrer" content="no-referrer"></head>', 1)
            if page.parent.name == "pages":
                updated = re.sub(r'<div class="v18-admin-actions">.*?</table>', manager, updated, count=1, flags=re.S)
            note = '<div class="v36-admin-note"><strong>Admin preview only.</strong> Changes here are local UX demonstrations; the live CMS remains the authenticated Wagtail application.</div>'
            if 'Admin preview only.' not in updated:
                updated = updated.replace('<p class="v18-admin-intro">', note + '<p class="v18-admin-intro">', 1)
        else:
            # Admin must never be discoverable from patient-facing preview pages.
            updated = re.sub(r'<a\b[^>]*href=["\']/concept/admin(?:/[^"\']*)?["\'][^>]*>.*?</a>', '', updated, flags=re.I|re.S)
        if updated != raw:
            page.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Admin preview upgraded: {changed} page(s); {len(routes)} public routes indexed for admin only")
    return changed
