#!/usr/bin/env python3
"""Apply approved Aastha photography to the editorial site."""
from __future__ import annotations

from pathlib import Path
import re

SITE = "https://www.aasthaskincentre.in"
DR_CHEENA = SITE + "/media/images/DSC_5241_1.max-900x900.format-webp.webp"

CUE_META = {
    "acne-care": ("Dermatology care for acne and acne-prone skin", "Acne care"),
    "pigmentation-care": ("Dermatology care for pigmentation and uneven skin tone", "Pigmentation care"),
    "hair-scalp-care": ("Dermatology care for hair and scalp concerns", "Hair & scalp care"),
    "fungal-infection-care": ("Dermatology care for fungal and recurrent skin infections", "Infection care"),
    "allergy-inflammatory-rashes": ("Dermatology care for inflammatory rashes and skin allergy", "Inflammatory skin care"),
    "skin-quality-ageing": ("Dermatologist-led skin quality and ageing assessment", "Skin quality care"),
    "two-clinic-locations": ("Aastha Skin Centre clinic locations in Jammu", "Two Jammu clinics"),
    "appointment-booking": ("Dermatology consultation and appointment planning", "Book a consultation"),
    "clinical-skin-care": ("Dermatologist-led clinical skin care", "Dermatology care"),
}

RESULT_COUNTS = {
    "acne-scar-treatment":4, "acne-treatment":1, "alopecia-areata-treatment":1,
    "botulinum-toxin-dermal-fillers":9, "chemical-peels":1, "contact-dermatitis-treatment":1,
    "dark-circles-under-eye-treatment":1, "fungal-infection-treatment":1, "hair-fall-treatment":6,
    "hair-transplant":2, "laser-hair-reduction":7, "laser-tattoo-removal":1, "mnrf-treatment":3,
    "psoriasis-treatment":1, "q-switched-laser-toning":4, "wart-mole-skin-tag-removal":1,
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
    return f"/assets/images/visual-cues/{cue}.jpg"


def replace_hero(raw: str, slug: str) -> str:
    is_doctor = slug in {"", ".", "dr-cheena-langer"}
    if is_doctor:
        src=DR_CHEENA
        alt="Dr. Cheena Langer, Consultant Dermatologist at Aastha Skin Centre Jammu"
        label="Dr. Cheena Langer · Aastha Skin Centre Jammu"
    else:
        cue=cue_for(slug)
        src=cue_url(cue)
        alt,label=CUE_META.get(cue, CUE_META["clinical-skin-care"])

    pattern=r'(<figure\b[^>]*class=["\'][^"\']*hero-art[^"\']*["\'][^>]*>.*?<img\b[^>]*?)src=["\'](?:/assets/images/professional/[^"\']+|/assets/images/premium-v2/[^"\']+)["\']([^>]*>)'
    def repl(m: re.Match[str]) -> str:
        before=m.group(1)
        after=m.group(2)
        after=re.sub(r'\s+alt=["\'][^"\']*["\']','',after,flags=re.I)
        after=re.sub(r'\s+onerror=["\'][^"\']*["\']','',after,flags=re.I)
        dimensions=""
        if is_doctor:
            after=re.sub(r'\s+(?:width|height)=["\'][^"\']*["\']','',after,flags=re.I)
            dimensions=' width="596" height="900"'
        return f'{before}src="{src}" alt="{alt}" data-existing-aastha-media="true"{dimensions}{after}'

    updated=re.sub(pattern,repl,raw,count=1,flags=re.I|re.S)
    if updated!=raw:
        updated=re.sub(r'(<figure\b[^>]*class=["\'][^"\']*hero-art[^"\']*["\'][^>]*>.*?<figcaption\b[^>]*>).*?(</figcaption>)',rf'\1{label}\2',updated,count=1,flags=re.I|re.S)
    return updated


def results_section(slug: str, count: int) -> str:
    figures=[]
    treatment=slug.replace('-', ' ')
    for i in range(1,count+1):
        src=f"/assets/images/clinical-results/{slug}/{slug}-{i:02d}.webp"
        figures.append(f'''<figure class="legacy-result-card"><img src="{src}" loading="lazy" decoding="async" alt="Clinical photograph related to {treatment} at Aastha Skin Centre"><figcaption>Clinical photograph · Aastha Skin Centre</figcaption></figure>''')
    return f'''<section class="editorial-section v36-legacy-results" data-existing-aastha-results><div class="concept-shell"><div class="section-head"><div><span class="section-no">Clinical examples</span></div><div><h2 class="display-heading">Selected clinical photographs.</h2><p class="section-copy">A small selection of photographs from Aastha Skin Centre records. Appearance, treatment choice and response vary between patients, so suitability is assessed individually.</p></div></div><div class="legacy-result-grid">{''.join(figures)}</div></div></section>'''


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
            updated=updated.replace('</main>',results_section(slug,RESULT_COUNTS[slug])+'</main>',1)
        if updated!=raw:
            page.write_text(updated,encoding="utf-8")
            changed+=1
    print(f"Approved Aastha media applied to {changed} concept page(s)")
    return changed
