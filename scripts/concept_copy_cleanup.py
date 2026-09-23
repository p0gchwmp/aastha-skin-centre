#!/usr/bin/env python3
"""Remove prototype-era wording and reconcile patient-facing preview facts.

The source pages remain easy to iterate on, while the built preview is kept
patient-facing, cache-safe and aligned with the latest clinic-approved facts.
"""
from pathlib import Path
import re

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
    "The original treatment directory is preserved here, but compressed into a filterable editorial interface instead of a long stack of cards.":
        "Browse treatments by clinical category and open the detailed guide that matches your concern.",
    "Dr. Cheena Langer · independently published record":
        "Dr. Cheena Langer · media, academic & professional work",
    "A source-linked record of selected news coverage, authored patient-education articles, conference activity and professional work. The clinic does not reproduce publisher articles or imagery here; each item opens the original source.":
        "Explore selected news coverage, conference lectures, professional roles, authored patient-education pieces and peer-reviewed academic work. Each item links to its original source.",
    "The clinic does not reproduce publisher articles or imagery here; each item opens the original source.":
        "Each item links directly to the original publisher, journal or professional body.",
    "Selected independently published coverage with direct links to the original publisher.":
        "Selected coverage of lectures, conference leadership and professional milestones.",
    "Professional records are linked to the organisation that publishes them.":
        "Selected professional roles and credentials with direct links to the publishing organisation.",
    "A selected indexed publication with the original journal record.":
        "Selected peer-reviewed work with a direct link to the indexed publication.",
    "Media and professional records add context; clinical suitability still depends on an individual consultation.":
        "Explore the clinical profile or book a consultation for individual assessment and treatment planning.",
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
    "These clinic-supplied images are now stored with this preview instead of being hotlinked. Individual presentation, treatment suitability and results vary.":
        "These photographs help illustrate the range of presentations and treatment contexts seen in dermatology practice. Individual findings, suitability and response vary.",
    "From the existing Aastha media library.":
        "Clinical photographs and treatment context.",
    "Aastha Editorial Concept — Homepage":
        "Aastha Skin Centre Jammu | Dermatologist-led Skin & Hair Care",
    " — Editorial Concept":
        " | Aastha Skin Centre Jammu",
    " — Aastha Concept":
        " | Aastha Skin Centre Jammu",
    " — Concept":
        " | Aastha Skin Centre Jammu",
    "The approved clinic statement is that Dr. Cheena Langer has more than 20 years in medicine.":
        "Dr. Cheena Langer has more than 20 years in medicine.",
    "This guide was prepared from established dermatology patient guidance and requires final clinical approval by Dr. Cheena Langer before launch.":
        "This guide uses established dermatology patient guidance and is intended for general education. Individual diagnosis and treatment require a consultation.",
    "Aastha Skin Centre should only advertise DHI when the exact technique, equipment and operating-team training have been verified.":
        "The exact hair-transplant technique is selected only after assessing the hair-loss pattern, donor area and surgical plan.",
    "The device’s manufacturer, exact wavelengths and regulatory status should not be claimed until supporting records are available.":
        "The exact laser wavelength and treatment settings are selected according to tattoo colour, skin type and clinical assessment.",
    "The device's manufacturer, exact wavelengths and regulatory status should not be claimed until supporting records are available.":
        "The exact laser wavelength and treatment settings are selected according to tattoo colour, skin type and clinical assessment.",
    "Mon–Sat · 11:00 AM–4:00 PM<br>Sun · 11:00 AM–3:00 PM":
        "Clinic open · 10:00 AM–8:00 PM<br>Doctor consultation · 11:00 AM–3:00 PM",
    "Mon–Sat · 6:00 PM–8:00 PM<br>Sun · 10:30 AM–12:00 PM":
        "Clinic open · 10:00 AM–8:00 PM<br>Doctor consultation · 6:00 PM–8:00 PM",
    "Monday–Saturday 11:00 AM–4:00 PM; Sunday 11:00 AM–3:00 PM":
        "11:00 AM–3:00 PM",
    "Monday–Saturday 6:00 PM–8:00 PM; Sunday 10:30 AM–12:00 PM":
        "6:00 PM–8:00 PM",
    "Monday–Saturday 10:00 AM–8:00 PM; Sunday 10:00 AM–3:00 PM":
        "10:00 AM–8:00 PM",
    "Monday–Saturday 10:00 AM–8:00 PM; Sunday 10:00 AM–2:00 PM":
        "10:00 AM–8:00 PM",
}


def _dist_root(page: Path) -> Path:
    for parent in page.parents:
        if parent.name == "dist":
            return parent
    raise RuntimeError(f"Could not locate dist root for {page}")


def _reconcile_location_page(updated: str, normalized: str) -> str:
    """Apply the current branch hours without inventing an unconfirmed Sunday slot."""

    is_karan = normalized.endswith("/locations/karan-nagar/index.html")
    is_paloura = normalized.endswith("/locations/paloura/index.html")
    is_hub = normalized.endswith("/locations/index.html")

    if is_karan:
        updated = re.sub(
            r'<div class="v4-fact"><small>Doctor</small><strong>.*?</strong><p>.*?</p></div>',
            '<div class="v4-fact"><small>Doctor consultation</small><strong>11 AM–3 PM</strong><p>Please confirm same-day availability before travelling.</p></div>',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = re.sub(
            r'<div class="v4-fact"><small>Sunday doctor</small>.*?</div>',
            '',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = re.sub(
            r'<div class="v4-fact"><small>Reception</small><strong>.*?</strong><p>.*?</p></div>',
            '<div class="v4-fact"><small>Clinic hours</small><strong>10 AM–8 PM</strong><p>Reception and scheduled services.</p></div>',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = re.sub(
            r'(<h3>Doctor consultation</h3>\s*<p>).*?(</p>)',
            r'\g<1>11:00 AM–3:00 PM\2',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = re.sub(
            r'(<h3>Reception</h3>\s*<p>).*?(</p>)',
            r'\g<1>10:00 AM–8:00 PM\2',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = updated.replace(
            'What are the doctor consultation timings at Karan Nagar?</summary><div class="faq-answer"><p>11:00 AM–4:00 PM</p>',
            'What are the doctor consultation timings at Karan Nagar?</summary><div class="faq-answer"><p>11:00 AM–3:00 PM. Please confirm same-day availability before travelling.</p>',
        )
        updated = re.sub(
            r'<details><summary>Is the Karan Nagar clinic open on Sunday\?</summary>.*?</details>',
            '<details><summary>Should I confirm timings before visiting?</summary><div class="faq-answer"><p>Yes. Please confirm same-day doctor availability and procedure scheduling before travelling.</p></div></details>',
            updated,
            count=1,
            flags=re.I | re.S,
        )

    if is_paloura:
        updated = re.sub(
            r'<div class="v4-fact"><small>Doctor</small><strong>.*?</strong><p>.*?</p></div>',
            '<div class="v4-fact"><small>Doctor consultation</small><strong>6 PM–8 PM</strong><p>Please confirm same-day availability before travelling.</p></div>',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = re.sub(
            r'<div class="v4-fact"><small>Sunday doctor</small>.*?</div>',
            '',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = re.sub(
            r'<div class="v4-fact"><small>Reception</small><strong>.*?</strong><p>.*?</p></div>',
            '<div class="v4-fact"><small>Clinic hours</small><strong>10 AM–8 PM</strong><p>Reception and scheduled services.</p></div>',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = updated.replace(
            "with evening consultation hours on most weekdays.",
            "with doctor consultation from 6:00 PM to 8:00 PM. Please confirm same-day availability before travelling.",
        )
        updated = re.sub(
            r'(<h3>Doctor consultation</h3>\s*<p>).*?(</p>)',
            r'\g<1>6:00 PM–8:00 PM\2',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = re.sub(
            r'(<h3>Reception</h3>\s*<p>).*?(</p>)',
            r'\g<1>10:00 AM–8:00 PM\2',
            updated,
            count=1,
            flags=re.I | re.S,
        )
        updated = updated.replace(
            'What are the doctor consultation timings at Paloura Chowk?</summary><div class="faq-answer"><p>6:00 PM–8:00 PM</p>',
            'What are the doctor consultation timings at Paloura Chowk?</summary><div class="faq-answer"><p>6:00 PM–8:00 PM. Please confirm same-day availability before travelling.</p>',
        )
        updated = re.sub(
            r'<details><summary>Is the Paloura Chowk clinic open on Sunday\?</summary>.*?</details>',
            '<details><summary>Should I confirm timings before visiting?</summary><div class="faq-answer"><p>Yes. Please confirm same-day doctor availability and procedure scheduling before travelling.</p></div></details>',
            updated,
            count=1,
            flags=re.I | re.S,
        )

    if is_hub:
        updated = updated.replace("Dr. Cheena: Mon–Sat 11:00 AM–4:00 PM", "Dr. Cheena: 11:00 AM–3:00 PM")
        updated = updated.replace("Dr. Cheena: Mon–Sat 6:00 PM–8:00 PM", "Dr. Cheena: 6:00 PM–8:00 PM")
        updated = re.sub(r'<li>Sunday doctor hours:.*?</li>', '', updated, flags=re.I | re.S)
        updated = updated.replace("Reception: Mon–Sat 10:00 AM–8:00 PM", "Clinic hours: 10:00 AM–8:00 PM")

    return updated


def clean_patient_copy(pages: list[Path]) -> int:
    changed = 0
    for page in pages:
        source = page.read_text(encoding="utf-8")
        updated = source
        for old, new in REPLACEMENTS.items():
            if old in updated:
                updated = updated.replace(old, new)
                changed += 1

        generic_replacements = (
            (r"\bAastha Editorial Concept\b", "Aastha Skin Centre Jammu"),
            (r"\bEditorial Concept\b", "Aastha Skin Centre Jammu"),
            (r"\bthe original page\b", "this guide"),
            (r"\bthe original guide\b", "this guide"),
            (r"\boriginal page\b", "guide"),
            (r"\boriginal guide\b", "guide"),
            (r"\bhomepage concept\b", "homepage"),
            (r"\bdoctor concept\b", "doctor profile"),
            (r"\bclinic-supplied\b", "clinical"),
            (r"\bexisting Aastha website media\b", "Aastha Skin Centre"),
            (r"\bexisting Aastha media library\b", "clinical media"),
            (r"\bfrom the existing Aastha media library\b", "Selected clinical photographs"),
            (r"\bclinic-supplied media\b", "clinical example"),
        )
        for pattern, replacement in generic_replacements:
            updated, count = re.subn(pattern, replacement, updated, flags=re.I)
            changed += count

        # Keep imported concept photography local rather than depending on the
        # current production host for visual-cue assets.
        updated, cue_count = re.subn(
            r'https://www\.aasthaskincentre\.in/static/images/visual-cues/([a-z0-9-]+)-512\.webp',
            r'/assets/images/visual-cues/\1.jpg',
            updated,
            flags=re.I,
        )
        changed += cue_count

        normalized = page.as_posix().replace("\\", "/")
        updated = _reconcile_location_page(updated, normalized)

        # Surface the public registration record on the doctor profile without
        # inventing additional credential claims.
        if normalized.endswith("/dr-cheena-langer/index.html") and "Registration No. 9538" not in updated:
            anchor = '<div class="fact-row"><dt>Qualifications</dt><dd>MBBS, MD Dermatology.</dd></div>'
            registration = '<div class="fact-row"><dt>Medical registration</dt><dd>J&amp;K Medical Council · Registration No. 9538 · 16 Jan 2007.</dd></div>'
            if anchor in updated:
                updated = updated.replace(anchor, anchor + registration, 1)
                changed += 1

        # Admin is a design preview, but every visible action should still have a
        # valid destination/state rather than a decorative href="#".
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

    print(f"Patient-facing fact/copy reconciliation replacements: {changed}")
    return changed
