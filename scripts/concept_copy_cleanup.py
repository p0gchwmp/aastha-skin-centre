#!/usr/bin/env python3
"""Remove prototype-era wording, resolve dead preview actions and bundle concept assets.

The source pages remain easy to iterate on, while the built preview is kept
patient-facing, cache-safe and materially lighter to load.
"""
from pathlib import Path

from concept_bundle_assets import bundle_concept_assets

REPLACEMENTS = {
    "The original site had more medical depth. This version keeps that depth but turns the consultation pathway into a scroll-linked story instead of a dense block of cards.":
        "Care moves from history and examination to explanation, planning and review.",
    "The site can stay visually bold while still giving search engines and patients the detailed pathways your original website had.":
        "Explore conditions, treatments, clinic details and practical information without losing your place.",
    "Drag through the areas patients most often explore. The interaction is playful; the pathways stay clinically clear.":
        "Browse common care pathways and open the guide that fits your concern.",
    "A clinic, organised like chapters.":
        "Explore care by concern and treatment.",
    "Clinical depth without a wall of cards.":
        "Clinical areas, clearly organised.",
    "The same breadth from the original profile is here, but organised as a direct, editorial directory.":
        "Explore the main clinical areas in one clear directory.",
    "More medicine. Less package-selling.":
        "Clinical judgement before treatment.",
    "The original site’s diagnosis-first philosophy becomes a set of large editorial statements rather than small UI cards.":
        "History, examination and diagnosis guide treatment planning.",
    "Drag through the consultation journey. Critical information stays readable even without the interaction.":
        "Follow the consultation journey from history and examination through planning and review.",
    "Dermatologist care illustration placeholder":
        "Abstract dermatologist profile illustration",
    "Real clinic-approved portrait can replace this placeholder":
        "Professional profile · Dr. Cheena Langer",
    "Tap through common presentations from the original guide. This is educational—it cannot diagnose a patch from a website.":
        "Explore common pigmentation patterns. This is educational and cannot diagnose a patch from a website.",
    "The original page is explicit that one brightening cream, peel or laser is not appropriate for every pigmentation concern.":
        "One brightening cream, peel or laser is not appropriate for every pigmentation concern.",
    "The original guide treats photoprotection as part of the treatment and relapse-prevention plan, not as an optional extra.":
        "Photoprotection is part of treatment and relapse prevention, not an optional extra.",
    "Tap what looks familiar. The interaction explains the terminology from the original page without pretending to identify your condition.":
        "Explore common acne terminology without treating a website interaction as a diagnosis.",
    "Homepage concept":
        "Homepage",
    "Doctor concept":
        "Doctor profile",
    "Aastha Editorial Concept — Homepage":
        "Aastha Skin Centre Jammu | Dermatologist-led Skin & Hair Care",
    " — Editorial Concept":
        " | Aastha Skin Centre Jammu",
}


def _dist_root(page: Path) -> Path:
    for parent in page.parents:
        if parent.name == "dist":
            return parent
    raise RuntimeError(f"Could not locate dist root for {page}")


def clean_patient_copy(pages: list[Path]) -> int:
    changed = 0
    for page in pages:
        source = page.read_text(encoding="utf-8")
        updated = source
        for old, new in REPLACEMENTS.items():
            if old in updated:
                updated = updated.replace(old, new)
                changed += 1

        # Admin is a design preview, but every visible action should still have a
        # valid destination/state rather than a decorative href="#".
        normalized = page.as_posix().replace("\\", "/")
        if normalized.endswith("/admin/pages/index.html"):
            replacements = (
                ('href="#">Add page', 'href="?action=new">Add page'),
                ('href="#">Preview site', 'href="/concept/">Preview site'),
            )
            for old, new in replacements:
                if old in updated:
                    updated = updated.replace(old, new, 1)
                    changed += 1
        elif normalized.endswith("/admin/blog/index.html"):
            old, new = 'href="#">New article', 'href="?action=new">New article'
            if old in updated:
                updated = updated.replace(old, new, 1)
                changed += 1
        elif normalized.endswith("/admin/media/index.html"):
            old, new = 'href="#">Upload media', 'href="?action=upload">Upload media'
            if old in updated:
                updated = updated.replace(old, new, 1)
                changed += 1

        if updated != source:
            page.write_text(updated, encoding="utf-8")

    if pages:
        bundle_concept_assets(_dist_root(pages[0]), pages)

    print(f"Patient-facing/admin preview cleanup replacements: {changed}")
    return changed
