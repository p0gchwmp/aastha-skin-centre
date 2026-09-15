#!/usr/bin/env python3
"""Upgrade preview admin pages after dist is built.

This is a UX prototype only. Real access control remains the authenticated Wagtail admin.
"""
from __future__ import annotations

from html import escape
from pathlib import Path
import re

SITE = "https://www.aasthaskincentre.in"


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


def _manager(routes: list[tuple[str,str,str]]) -> str:
    rows = ''.join(
        f'<tr data-v36-admin-row data-kind="{escape(kind.lower())}" data-search="{escape((title+" "+kind+" "+route).lower())}">'
        f'<td><strong>{escape(title)}</strong><small>{escape(route)}</small></td>'
        f'<td>{escape(kind)}</td><td><span class="v36-admin-status">Mapped</span></td>'
        f'<td><a href="{escape(route)}" target="_blank" rel="noopener">Open preview ↗</a></td></tr>'
        for title,kind,route in routes
    )
    return f'''<div class="v36-admin-note"><strong>Preview workspace.</strong> This route is deliberately excluded from public navigation and indexing. Production publishing remains protected by Wagtail authentication.</div><div class="v36-admin-toolbar"><input class="v36-admin-search" data-v36-admin-search type="search" placeholder="Search {len(routes)} public routes…" aria-label="Search pages"><select class="v36-admin-filter" data-v36-admin-filter><option value="all">All page types</option><option value="clinical guide">Clinical guides</option><option value="directory">Directories</option><option value="core page">Core pages</option><option value="journal">Journal</option><option value="clinic">Clinics</option><option value="policy">Policies</option></select><span data-v36-admin-count>{len(routes)} routes</span></div><table class="v36-admin-route-table"><thead><tr><th>Page</th><th>Type</th><th>State</th><th>Action</th></tr></thead><tbody>{rows}</tbody></table>'''


def _blog_manager(routes: list[tuple[str,str,str]]) -> str:
    articles=[r for r in routes if r[1]=="Journal" and r[2]!="/concept/blog/"]
    rows=''.join(f'<tr data-v36-admin-row data-kind="journal" data-search="{escape((t+" "+u).lower())}"><td><strong>{escape(t)}</strong><small>{escape(u)}</small></td><td>Patient guide</td><td><span class="v36-admin-status">Reviewable</span></td><td><a href="{escape(u)}" target="_blank" rel="noopener">Open ↗</a></td></tr>' for t,_k,u in articles)
    return f'''<div class="v36-admin-note"><strong>Structured journal manager.</strong> In production, draft/review/publish state is handled by Wagtail workflow. The preview lists the real migrated articles and their public routes.</div><div class="v36-admin-toolbar"><input class="v36-admin-search" data-v36-admin-search type="search" placeholder="Search {len(articles)} journal guides…"><span data-v36-admin-count>{len(articles)} routes</span></div><table class="v36-admin-route-table"><thead><tr><th>Guide</th><th>Type</th><th>State</th><th>Preview</th></tr></thead><tbody>{rows}</tbody></table>'''


def _media_manager() -> str:
    cues=[
        ("Acne & scars","acne-care"),("Pigmentation","pigmentation-care"),("Hair & scalp","hair-scalp-care"),
        ("Fungal infection","fungal-infection-care"),("Rashes & inflammation","allergy-inflammatory-rashes"),("Skin quality & ageing","skin-quality-ageing"),
        ("Diagnosis","dermatologist-diagnosis"),("Two clinic locations","two-clinic-locations"),("Booking","appointment-booking")
    ]
    cards=''.join(f'''<article class="v18-admin-card"><img src="{SITE}/static/images/visual-cues/{slug}-256.webp" alt="" loading="lazy" style="width:100%;aspect-ratio:16/10;object-fit:contain;background:#eee6dc"><small>Existing Aastha asset</small><h3>{escape(label)}</h3><p>{escape(slug)} · reused from the earlier website library.</p></article>''' for label,slug in cues)
    return f'''<div class="v36-admin-note"><strong>Approved-media inventory.</strong> These are existing Aastha website assets, not newly generated patient imagery. Production media changes will remain permission-controlled in Wagtail.</div><div class="v18-admin-grid">{cards}<article class="v18-admin-card wide"><h3>Clinical result library</h3><p>Existing route-matched media is currently available for acne, acne scars, alopecia areata, injectables, chemical peels, contact dermatitis, dark circles, fungal infection, hair fall, hair transplant, laser hair reduction, tattoo removal, MNRF, psoriasis, Q-switched laser and wart/mole/skin-tag pages.</p><p>Before/after publishing should continue to require appropriate consent and context.</p></article></div>'''


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

    page_manager=_manager(routes)
    blog_manager=_blog_manager(routes)
    media_manager=_media_manager()
    journal_count=sum(1 for _t,k,u in routes if k=="Journal" and u!="/concept/blog/")
    clinical_count=sum(1 for _t,k,_u in routes if k=="Clinical guide")
    dashboard_stats=f'''<div class="v18-admin-stats"><div class="v18-admin-stat"><strong>{len(routes)}</strong><span>Public routes</span></div><div class="v18-admin-stat"><strong>{clinical_count}</strong><span>Clinical guides</span></div><div class="v18-admin-stat"><strong>{journal_count}</strong><span>Journal guides</span></div><div class="v18-admin-stat"><strong>2</strong><span>Jammu clinics</span></div></div>'''

    changed = 0
    for page in concept_pages:
        raw = page.read_text(encoding="utf-8")
        updated = raw
        if concept_root / "admin" in page.parents:
            if 'noarchive' not in updated:
                updated = updated.replace('content="noindex,nofollow"', 'content="noindex,nofollow,noarchive,nosnippet"')
            if 'name="referrer"' not in updated:
                updated = updated.replace('</head>', '<meta name="referrer" content="no-referrer"></head>', 1)
            current=page.parent.name if page.parent!=concept_root/"admin" else "dashboard"
            if current == "pages":
                updated = re.sub(r'<div class="v18-admin-actions">.*?</table>', page_manager, updated, count=1, flags=re.S)
            elif current == "blog":
                updated = re.sub(r'<div class="v18-admin-actions">.*?</table>', blog_manager, updated, count=1, flags=re.S)
            elif current == "media":
                updated = re.sub(r'<div class="v18-admin-actions">.*?(?=<div class="v18-admin-grid">)', '', updated, count=1, flags=re.S)
                updated = re.sub(r'<div class="v18-admin-grid">.*?</div>\s*$', media_manager, updated, count=1, flags=re.S)
            elif current == "dashboard":
                updated = re.sub(r'<div class="v18-admin-stats">.*?</div></div>', dashboard_stats, updated, count=1, flags=re.S)
            note = '<div class="v36-admin-note"><strong>Admin preview only.</strong> Changes here are local UX demonstrations; the live CMS remains the authenticated Wagtail application.</div>'
            if 'Admin preview only.' not in updated:
                updated = updated.replace('<p class="v18-admin-intro">', note + '<p class="v18-admin-intro">', 1)
        else:
            updated = re.sub(r'<a\b[^>]*href=["\']/concept/admin(?:/[^"\']*)?["\'][^>]*>.*?</a>', '', updated, flags=re.I|re.S)
        if updated != raw:
            page.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Admin preview upgraded: {changed} page(s); {len(routes)} public routes indexed for admin only")
    return changed
