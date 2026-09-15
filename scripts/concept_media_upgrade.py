#!/usr/bin/env python3
"""Reuse existing Aastha website media in the concept preview.

The preview intentionally points at public assets already served by the current Aastha
website instead of inventing new patient/doctor photography. Production migration can
later copy the approved media into the final Wagtail media library.
"""
from __future__ import annotations

from pathlib import Path
import re

SITE = "https://www.aasthaskincentre.in"
DR_CHEENA = SITE + "/media/images/DSC_5241_1.max-900x900.format-webp.webp"

RESULT_COUNTS = {
    "acne-scar-treatment":4,
    "acne-treatment":1,
    "alopecia-areata-treatment":1,
    "botulinum-toxin-dermal-fillers":9,
    "chemical-peels":1,
    "contact-dermatitis-treatment":1,
    "dark-circles-under-eye-treatment":1,
    "fungal-infection-treatment":1,
    "hair-fall-treatment":6,
    "hair-transplant":2,
    "laser-hair-reduction":7,
    "laser-tattoo-removal":1,
    "mnrf-treatment":3,
    "psoriasis-treatment":1,
    "q-switched-laser-toning":4,
    "wart-mole-skin-tag-removal":1,
}


def cue_for(slug: str) -> str:
    s=slug.lower()
    if any(k in s for k in ("acne","scar","mnrf","microneed","fractional-co2")): return "acne-care"
    if any(k in s for k in ("pigment","melasma","freckle","dark-lip","dark-neck","q-switched","tattoo","sun-damage")): return "pigmentation-care"
    if any(k in s for k in ("hair","alopecia","dandruff","scalp","prp","gfc")): return "hair-scalp-care"
    if any(k in s for k in ("fungal","infection","scabies","molluscum")): return "fungal-infection-care"
    if any(k in s for k in ("eczema","dermatitis","urticaria","psoriasis","rash","vitiligo","lichen")): return "allergy-inflammatory-rashes"
    if any(k in s for k in ("botulinum","filler","hifu","skin-booster","hydra","ipl","carbon","ageing","anti-aging")): return "skin-quality-ageing"
    if any(k in s for k in ("clinic","location","karan","paloura")): return "two-clinic-locations"
    if "book" in s or "appointment" in s: return "appointment-booking"
    return "clinical-skin-care"


def cue_url(cue: str) -> str:
    return f"{SITE}/static/images/visual-cues/{cue}-512.webp"


def replace_hero(raw: str, slug: str) -> str:
    if slug in {"", ".", "dr-cheena-langer"}:
        src=DR_CHEENA
        alt="Dr. Cheena Langer, Consultant Dermatologist at Aastha Skin Centre Jammu"
        label="Dr. Cheena Langer · Aastha Skin Centre Jammu"
    else:
        cue=cue_for(slug)
        src=cue_url(cue)
        alt=f"Existing Aastha website visual for {slug.replace('-', ' ')}"
        label="Existing Aastha website media"

    # Replace only generic/placeholder hero artwork. Purpose-built page photography is left alone.
    pattern=r'(<figure\b[^>]*class=["\'][^"\']*hero-art[^"\']*["\'][^>]*>.*?<img\b[^>]*?)src=["\'](?:/assets/images/professional/[^"\']+|/assets/images/premium-v2/[^"\']+)["\']([^>]*>)'
    def repl(m: re.Match[str]) -> str:
        before=m.group(1)
        after=m.group(2)
        after=re.sub(r'\s+alt=["\'][^"\']*["\']','',after,flags=re.I)
        return f'{before}src="{src}" alt="{alt}" data-existing-aastha-media="true"{after}'
    updated=re.sub(pattern,repl,raw,count=1,flags=re.I|re.S)
    if updated!=raw:
        updated=re.sub(r'(<figure\b[^>]*class=["\'][^"\']*hero-art[^"\']*["\'][^>]*>.*?<figcaption\b[^>]*>).*?(</figcaption>)',rf'\1{label}\2',updated,count=1,flags=re.I|re.S)
    return updated


def results_section(slug: str, count: int) -> str:
    figures=[]
    for i in range(1,count+1):
        src=f"{SITE}/static/images/clinical-results/{slug}/{slug}-{i:02d}.webp"
        figures.append(f'''<figure class="legacy-result-card"><img src="{src}" loading="lazy" decoding="async" alt="Existing Aastha clinical media for {slug.replace('-', ' ')}" onerror="this.closest('figure').remove()"><figcaption>Existing clinic media · image {i:02d}</figcaption></figure>''')
    return f'''<section class="editorial-section v36-legacy-results" data-existing-aastha-results><div class="concept-shell"><div class="section-head"><div><span class="section-no">Clinical media</span></div><div><h2 class="display-heading">From the existing Aastha media library.</h2><p class="section-copy">These images are reused from the clinic's earlier website media. Individual presentation, treatment suitability and results vary.</p></div></div><div class="legacy-result-grid">{''.join(figures)}</div></div></section>'''


def upgrade_media(dist: Path, concept_pages: list[Path]) -> int:
    concept_root=dist/"concept"
    changed=0
    for page in concept_pages:
        if concept_root/"admin" in page.parents:
            continue
        rel=page.parent.relative_to(concept_root).as_posix()
        slug="" if rel in (".","") else rel.split("/")[-1]
        raw=page.read_text(encoding="utf-8")
        updated=replace_hero(raw,slug)
        if slug in RESULT_COUNTS and 'data-existing-aastha-results' not in updated:
            block=results_section(slug,RESULT_COUNTS[slug])
            updated=updated.replace('</main>',block+'</main>',1)
        if updated!=raw:
            page.write_text(updated,encoding="utf-8")
            changed+=1
    print(f"Existing Aastha media applied to {changed} concept page(s)")
    return changed
