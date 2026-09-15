#!/usr/bin/env python3
"""Create restrained concept fallbacks for legacy clinical pages not yet migrated."""
from __future__ import annotations

from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
CONCEPT = ROOT / "concept"

NAV = '''<header class="concept-nav"><div class="concept-shell"><a class="brand-mark" href="/concept/">AASTHA <span>Skin Centre · Jammu</span></a><nav class="concept-links" aria-label="Primary navigation"><a href="/concept/conditions/">Concerns</a><a href="/concept/#finder">Find your route</a><a href="/concept/treatments/">Treatments</a><a href="/concept/dr-cheena-langer/">Doctor</a><a href="/concept/locations/">Clinics</a></nav><a class="nav-cta" href="/concept/book-appointment/">Book consultation</a></div></header>'''
FOOT = '''<footer class="concept-footer"><div class="concept-shell"><div class="v18-secondary-links"><a href="/concept/conditions/">Concerns</a><a href="/concept/treatments/">Treatments</a><a href="/concept/blog/">Skin journal</a><a href="/concept/contact/">Contact</a></div><p class="footer-word">AASTHA.</p></div></footer>'''


def text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def first(pattern: str, raw: str, default: str = "") -> str:
    m = re.search(pattern, raw, re.I | re.S)
    return text(m.group(1)) if m else default


def semantic_cue(slug: str) -> str:
    s = slug.lower()
    if any(k in s for k in ("acne", "scar", "mnrf", "microneed", "fractional-co2")):
        return "acne-care"
    if any(k in s for k in ("pigment", "melasma", "freckle", "dark-lip", "dark-neck", "q-switched", "tattoo")):
        return "pigmentation-care"
    if any(k in s for k in ("hair", "alopecia", "dandruff", "scalp", "prp", "gfc")):
        return "hair-scalp-care"
    if any(k in s for k in ("fungal", "scabies", "infection", "molluscum")):
        return "fungal-infection-care"
    if any(k in s for k in ("eczema", "dermatitis", "urticaria", "psoriasis", "rash", "vitiligo", "lichen")):
        return "allergy-inflammatory-rashes"
    if any(k in s for k in ("botulinum", "filler", "hifu", "rf-", "booster", "age", "hydra", "facial", "ipl", "carbon")):
        return "skin-quality-ageing"
    return "clinical-skin-care"


def clean_fragment(fragment: str) -> str:
    # Strip interactive/legacy chrome but retain patient-facing prose, lists and links.
    fragment = re.sub(r"<(script|style|form|nav|header|footer|figure|picture)[^>]*>.*?</\1>", "", fragment, flags=re.I | re.S)
    fragment = re.sub(r"<!--.*?-->", "", fragment, flags=re.S)
    fragment = re.sub(r"\s(?:class|id|style|data-[\w-]+|aria-[\w-]+)=([\"']).*?\1", "", fragment, flags=re.I | re.S)
    fragment = re.sub(r"<button[^>]*>.*?</button>", "", fragment, flags=re.I | re.S)
    return fragment.strip()


def sections_from(raw: str) -> list[tuple[str, str]]:
    main = re.search(r"<main\b[^>]*>(.*?)</main>", raw, re.I | re.S)
    source = main.group(1) if main else raw
    matches = list(re.finditer(r"<h2\b[^>]*>(.*?)</h2>", source, re.I | re.S))
    sections: list[tuple[str, str]] = []
    for i, match in enumerate(matches):
        heading = text(match.group(1))
        if not heading or heading.lower() in {"related treatments", "related pages"}:
            continue
        end = matches[i + 1].start() if i + 1 < len(matches) else len(source)
        body = clean_fragment(source[match.end():end])
        if not re.search(r"<(p|ul|ol|h3|h4|details)\b", body, re.I):
            continue
        sections.append((heading, body))
    return sections


def page_html(slug: str, title: str, lead: str, sections: list[tuple[str, str]]) -> str:
    cue = semantic_cue(slug)
    image = f"https://www.aasthaskincentre.in/static/images/visual-cues/{cue}-512.webp"
    fallback = "/assets/images/professional/medical-care.svg"
    hero = f'''<section class="editorial-hero treatment-hero"><div class="concept-shell hero-grid"><div><span class="kicker">Dermatology guide · Jammu</span><h1 class="hero-title">{escape(title)}</h1><p class="hero-copy">{escape(lead or 'Dermatologist-led assessment, treatment planning and follow-up at Aastha Skin Centre, Jammu.')}</p><div class="hero-actions"><a class="btn" href="/concept/book-appointment/">Book consultation</a><a class="btn alt" href="/concept/treatments/">All treatments</a></div></div><figure class="hero-art legacy-media-frame"><img src="{image}" data-legacy-cue="{cue}" alt="Aastha dermatology visual for {escape(title)}" onerror="this.onerror=null;this.src='{fallback}'"><figcaption class="legacy-media-label">Existing Aastha website media · {escape(title)}</figcaption></figure></div></section>'''
    content = []
    for heading, body in sections:
        content.append(f'''<section class="concept-imported-section"><h2>{escape(heading)}</h2><div class="concept-imported-body">{body}</div></section>''')
    if not content:
        content.append('''<section class="concept-imported-section"><h2>Assessment first</h2><div class="concept-imported-body"><p>Treatment choice depends on the diagnosis, medical history, skin or hair pattern, previous response and individual priorities.</p></div></section>''')
    body = hero + f'''<section class="editorial-section concept-imported-content"><div class="concept-shell">{''.join(content)}</div></section>'''
    body += '''<section class="editorial-section"><div class="concept-shell"><div class="section-head"><div><span class="section-no">Next step</span></div><div><h2 class="display-heading">Need an individual plan?</h2><p class="section-copy">A page can explain the pathway; suitability and treatment choice are confirmed during consultation.</p><div class="hero-actions"><a class="btn" href="/concept/book-appointment/">Book consultation</a><a class="btn alt" href="/concept/conditions/">Browse concerns</a></div></div></div></div></section>'''
    return f'''<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{escape(title)} — Aastha Editorial Concept</title><link rel="stylesheet" href="/assets/css/editorial-concept-v1.css"></head><body class="concept-page treatment-page concept-imported-page">{NAV}<div class="scroll-progress"></div><main>{body}</main>{FOOT}<script src="/assets/js/editorial-concept-v1.js" defer></script></body></html>'''


def main() -> int:
    generated = 0
    seen: set[str] = set()
    for root_name in ("treatments", "conditions"):
        source_root = ROOT / root_name
        if not source_root.exists():
            continue
        for folder in sorted(source_root.iterdir()):
            source = folder / "index.html"
            if not folder.is_dir() or not source.exists() or folder.name in {"post-template"}:
                continue
            slug = folder.name
            if slug in seen:
                continue
            seen.add(slug)
            target = CONCEPT / slug / "index.html"
            if target.exists():
                continue
            raw = source.read_text(encoding="utf-8")
            title = first(r"<h1\b[^>]*>(.*?)</h1>", raw, slug.replace("-", " ").title())
            lead = first(r'<p\b[^>]*class=["\'][^"\']*(?:lead|hero-copy|intro)[^"\']*["\'][^>]*>(.*?)</p>', raw)
            if not lead:
                lead = first(r"<h1\b[^>]*>.*?</h1>\s*<p\b[^>]*>(.*?)</p>", raw, "Dermatologist-led information and assessment in Jammu.")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(page_html(slug, title, lead, sections_from(raw)), encoding="utf-8")
            generated += 1
    print(f"Generated {generated} additional concept clinical pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
