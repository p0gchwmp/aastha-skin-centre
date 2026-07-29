#!/usr/bin/env python3
# Apply the Aastha professional redesign to the complete static site.
# Rebuilds the homepage, adds the design system to every page,
# removes editorial notes, converts raw lists/CTAs and creates backups.
from __future__ import annotations

import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

try:
    from lxml import etree, html
except ImportError:
    raise SystemExit("ERROR: lxml is required. Run this with the project's .venv Python.")

ROOT = Path(__file__).resolve().parents[1]
BACKUPS = ROOT / "backups"
REPORTS = ROOT / "reports"
EXCLUDE_PARTS = {".git", ".venv", "backups", "reports", "dist", "_legacy-tools", "_project-docs", "content-drop", "schema-drop", "deployment"}
CSS_HREF = "/assets/css/professional.css"
JS_SRC = "/assets/js/professional.js"

EDITORIAL_EXACT = {
    "buttons", "suggested form fields:", "consent text", "appointment notice",
    "mid-page cta", "faq section", "final cta", "medical disclaimer",
    "developer action required", "content integration placeholder",
    "approved doctor photo required", "use an original clinic image without ai face replacement.",
}
EDITORIAL_PREFIXES = (
    "cta:", "recommended homepage categories:", "suggested homepage articles:",
    "feature the latest educational articles on:", "every result image should state:",
    "this section should display only clinic-approved",
    "clinic operational details and branch-wise services are based on the approved",
)

CTA_MAP = {
    "meet dr. cheena langer": ("Meet Dr. Cheena Langer", "/dr-cheena-langer/"),
    "explore acne care": ("Explore Acne Care", "/treatments/acne-treatment/"),
    "explore pigmentation care": ("Explore Pigmentation Care", "/treatments/pigmentation-treatment/"),
    "explore hair & scalp care": ("Explore Hair & Scalp Care", "/treatments/hair-fall-treatment/"),
    "explore hair and scalp care": ("Explore Hair & Scalp Care", "/treatments/hair-fall-treatment/"),
    "explore infection care": ("Explore Infection Care", "/treatments/fungal-infection-treatment/"),
    "explore medical dermatology": ("Explore Medical Dermatology", "/conditions/"),
    "explore aesthetic dermatology": ("Explore Aesthetic Dermatology", "/treatments/"),
    "view all treatments": ("View All Treatments", "/treatments/"),
    "explore acne & scar treatment": ("Explore Acne & Scar Treatment", "/treatments/acne-scar-treatment/"),
    "explore acne and scar treatment": ("Explore Acne & Scar Treatment", "/treatments/acne-scar-treatment/"),
    "explore hair & scalp treatments": ("Explore Hair & Scalp Treatments", "/treatments/hair-fall-treatment/"),
    "explore hair and scalp treatments": ("Explore Hair & Scalp Treatments", "/treatments/hair-fall-treatment/"),
    "view dr. cheena langer’s professional profile": ("View Dr. Cheena Langer’s Profile", "/dr-cheena-langer/"),
    "view dr. cheena langer's professional profile": ("View Dr. Cheena Langer’s Profile", "/dr-cheena-langer/"),
    "visit the skin journal": ("Visit the Skin Journal", "/blog/"),
    "book appointment": ("Book Appointment", "/book-appointment/"),
    "book an appointment": ("Book an Appointment", "/book-appointment/"),
    "request appointment": ("Request Appointment", "/book-appointment/"),
}

LIST_CUES = (
    "include", "includes", "treated", "services", "focus", "expect", "options",
    "procedures offered", "conditions treated", "available service", "areas of"
)

HOME_MAIN = r'''<main id="main-content" class="home-main">
<section class="home-hero">
  <div class="container">
    <div class="home-hero-grid">
      <div class="home-hero-copy">
        <span class="eyebrow">Dermatologist-led care in Jammu</span>
        <h1>Clear, personalised care for <em>skin, hair and confidence.</em></h1>
        <p class="lead">Consult Dr. Cheena Langer, MBBS, MD Dermatology, for evidence-based medical dermatology, laser, hair and aesthetic treatment at Aastha Skin &amp; Dermato-Cosmetic Centre.</p>
        <div class="hero-actions">
          <a class="button" href="/book-appointment/">Book an Appointment</a>
          <a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp the Clinic</a>
        </div>
        <p class="hero-note">Appointments and walk-ins are accepted. Confirmed appointments receive priority.</p>
      </div>
      <div class="home-hero-media">
        <img src="/assets/images/professional/hero-care.svg" alt="Elegant illustration representing dermatology, skin and aesthetic care" width="700" height="650">
        <aside class="hero-booking-card" aria-label="Consultation information">
          <strong>Consult Dr. Cheena Langer</strong>
          <p>Choose Karan Nagar or Paloura Chowk.</p>
          <p class="fee"><b>Consultation fee:</b> ₹500</p>
          <a class="button" href="/book-appointment/">Request Appointment</a>
        </aside>
      </div>
    </div>
    <div class="trust-ribbon" aria-label="Clinic highlights">
      <div class="trust-item"><span class="trust-icon">✚</span><div><strong>MBBS &amp; MD</strong><span>Dermatology-led diagnosis</span></div></div>
      <div class="trust-item"><span class="trust-icon">★</span><div><strong>20+ years</strong><span>Experience in medicine</span></div></div>
      <div class="trust-item"><span class="trust-icon">⌂</span><div><strong>Two clinics</strong><span>Karan Nagar &amp; Paloura</span></div></div>
      <div class="trust-item"><span class="trust-icon">◌</span><div><strong>Complete care</strong><span>Medical, laser, hair &amp; aesthetic</span></div></div>
      <div class="trust-item"><span class="trust-icon">✓</span><div><strong>Personalised plans</strong><span>Diagnosis before treatment</span></div></div>
    </div>
  </div>
</section>

<section class="home-section home-section--soft" aria-labelledby="concerns-title">
  <div class="container">
    <div class="section-heading">
      <div><span class="section-kicker">What can we help with?</span><h2 id="concerns-title">Find care by your concern</h2><p>Start with what you are experiencing and explore clear, dermatologist-led information for the concern that matches your needs.</p></div>
      <a class="button button-secondary" href="/conditions/">View All Conditions</a>
    </div>
    <div class="concern-grid">
      <a class="concern-card" href="/treatments/acne-treatment/" style="--card-tint:#ffe8ec;--card-accent:#b9365b"><span class="icon-bubble">◉</span><h3>Acne, pimples &amp; scars</h3><p>Teenage and adult acne, blackheads, active breakouts, marks and acne scars.</p><span class="card-link">Explore Acne Care →</span></a>
      <a class="concern-card" href="/treatments/pigmentation-treatment/" style="--card-tint:#eee9ff;--card-accent:#7156b6"><span class="icon-bubble">✦</span><h3>Pigmentation &amp; uneven tone</h3><p>Melasma, post-acne marks, freckles, sun damage, dark lips and under-eye pigmentation.</p><span class="card-link">Explore Pigmentation Care →</span></a>
      <a class="concern-card" href="/treatments/hair-fall-treatment/" style="--card-tint:#e6f5ef;--card-accent:#387d66"><span class="icon-bubble">♒</span><h3>Hair fall &amp; scalp concerns</h3><p>Hair thinning, alopecia areata, dandruff, itchy scalp and pattern hair loss.</p><span class="card-link">Explore Hair &amp; Scalp Care →</span></a>
      <a class="concern-card" href="/treatments/fungal-infection-treatment/" style="--card-tint:#fff1d8;--card-accent:#b66e16"><span class="icon-bubble">◌</span><h3>Fungal &amp; recurrent infections</h3><p>Ringworm, jock itch, athlete’s foot, nail fungus and steroid-modified infections.</p><span class="card-link">Explore Infection Care →</span></a>
      <a class="concern-card" href="/treatments/skin-allergy-treatment/" style="--card-tint:#e9f2ff;--card-accent:#3f70a6"><span class="icon-bubble">≈</span><h3>Allergy, eczema &amp; itching</h3><p>Skin allergy, eczema, contact dermatitis, urticaria, psoriasis and recurring rashes.</p><span class="card-link">Explore Medical Dermatology →</span></a>
      <a class="concern-card" href="/treatments/" style="--card-tint:#fde9f3;--card-accent:#9d3769"><span class="icon-bubble">◇</span><h3>Skin quality &amp; ageing</h3><p>Texture, dullness, fine lines, facial volume, hydration and firmness concerns.</p><span class="card-link">Explore Aesthetic Care →</span></a>
    </div>
  </div>
</section>

<section class="home-section" aria-labelledby="doctor-title">
  <div class="container doctor-feature">
    <div class="doctor-visual"><img src="/assets/images/professional/doctor-care.svg" alt="Illustration representing dermatologist-led care" width="560" height="560"></div>
    <div class="doctor-copy">
      <span class="section-kicker">Meet your dermatologist</span>
      <h2 id="doctor-title">Dr. Cheena Langer</h2>
      <p class="doctor-role">MBBS, MD Dermatology · Consultant Dermatologist</p>
      <p>Dr. Cheena Langer leads Aastha Skin &amp; Dermato-Cosmetic Centre across two Jammu clinics. Her practice combines medical dermatology with laser, pigmentation, hair, aesthetic and dermato-surgical care.</p>
      <ul class="doctor-points">
        <li>More than 20 years in medicine</li><li>Diagnosis-led treatment planning</li><li>Medical and aesthetic dermatology</li><li>Clear counselling and aftercare</li>
      </ul>
      <div class="hero-actions"><a class="button" href="/dr-cheena-langer/">View Doctor Profile</a><a class="button button-secondary" href="/book-appointment/">Book Consultation</a></div>
    </div>
  </div>
</section>

<section class="home-section home-section--blush" aria-labelledby="treatments-title">
  <div class="container">
    <div class="section-heading"><div><span class="section-kicker">Popular treatments</span><h2 id="treatments-title">Advanced care, selected after assessment</h2><p>Procedure choice depends on diagnosis, skin type, treatment goals, medical history and expected downtime.</p></div><a class="button button-secondary" href="/treatments/">View All Treatments</a></div>
    <div class="treatment-grid">
      <article class="treatment-card" data-card-link><img src="/assets/images/professional/laser-care.svg" alt="Laser treatment illustration" width="560" height="360"><div class="treatment-card-body"><h3>Laser Hair Reduction</h3><p>Planned sessions with parameters selected for your skin type, hair thickness and treatment area.</p><a class="text-link" href="/treatments/laser-hair-reduction/">Learn more →</a></div></article>
      <article class="treatment-card" data-card-link><img src="/assets/images/professional/acne-care.svg" alt="Acne and scar care illustration" width="560" height="360"><div class="treatment-card-body"><h3>Acne Scar Treatment</h3><p>Individual plans may include MNRF, subcision, microneedling, TCA CROSS or fractional CO₂ laser.</p><a class="text-link" href="/treatments/acne-scar-treatment/">Learn more →</a></div></article>
      <article class="treatment-card" data-card-link><img src="/assets/images/professional/laser-care.svg" alt="Pigmentation laser illustration" width="560" height="360"><div class="treatment-card-body"><h3>Q-Switched Laser</h3><p>Dermatologist-guided treatment for selected pigmentation concerns, laser toning and tattoo removal.</p><a class="text-link" href="/treatments/q-switched-laser-toning/">Learn more →</a></div></article>
      <article class="treatment-card" data-card-link><img src="/assets/images/professional/hair-care.svg" alt="Hair and scalp treatment illustration" width="560" height="360"><div class="treatment-card-body"><h3>PRP &amp; GFC Hair Therapy</h3><p>Supportive growth-factor-based procedures used within a broader medical hair-loss plan.</p><a class="text-link" href="/treatments/prp-gfc-hair-treatment/">Learn more →</a></div></article>
    </div>
  </div>
</section>

<section class="home-section" aria-labelledby="why-title">
  <div class="container">
    <div class="section-heading"><div><span class="section-kicker">Why Aastha</span><h2 id="why-title">Clinical credibility with a calm, personal experience</h2><p>Every consultation begins with careful assessment, a clear explanation of options and a treatment plan suited to the individual patient.</p></div></div>
    <div class="why-grid">
      <article class="why-card"><span class="why-number">01</span><h3>Doctor-led care</h3><p>Consultations and treatment planning are led by a qualified dermatologist.</p></article>
      <article class="why-card"><span class="why-number">02</span><h3>Diagnosis first</h3><p>Similar-looking concerns can have different causes, so assessment comes before procedure choice.</p></article>
      <article class="why-card"><span class="why-number">03</span><h3>Transparent guidance</h3><p>Expected benefits, limitations, aftercare, sessions and downtime are discussed clearly.</p></article>
      <article class="why-card"><span class="why-number">04</span><h3>Two Jammu clinics</h3><p>Access consultation and procedures at Karan Nagar and Paloura Chowk.</p></article>
    </div>
  </div>
</section>

<section class="home-section home-section--soft" aria-labelledby="locations-title">
  <div class="container">
    <div class="section-heading"><div><span class="section-kicker">Visit us</span><h2 id="locations-title">Two clinics in Jammu</h2><p>Choose the branch that is more convenient. Detailed timings, directions and branch information remain on the dedicated location pages.</p></div></div>
    <div class="location-pro-grid">
      <article class="location-pro-card"><div class="location-art"><img src="/assets/images/professional/clinic-care.svg" alt="Clinic building illustration" width="560" height="360"></div><div class="location-copy"><h3>Karan Nagar</h3><address>Lane 2, Karan Nagar, near Amphalla Chowk, Jammu – 180005</address><p class="location-hours"><strong>Reception:</strong> Mon–Sat 10 AM–8 PM · Sun 10 AM–3 PM</p><div class="location-actions"><a class="button" href="/locations/karan-nagar/">Clinic Details</a><a class="button button-secondary" href="https://maps.app.goo.gl/pHCQ1r4crKuZBSi98" target="_blank" rel="noopener">Directions</a></div></div></article>
      <article class="location-pro-card"><div class="location-art"><img src="/assets/images/professional/clinic-care.svg" alt="Clinic building illustration" width="560" height="360"></div><div class="location-copy"><h3>Paloura Chowk</h3><address>Top Paloura, opposite Government Senior Secondary School, Jammu – 181121</address><p class="location-hours"><strong>Reception:</strong> Mon–Sat 10 AM–8 PM · Sun 10 AM–2 PM</p><div class="location-actions"><a class="button" href="/locations/paloura/">Clinic Details</a><a class="button button-secondary" href="https://maps.app.goo.gl/kh4AqZoUkscpEgWc8" target="_blank" rel="noopener">Directions</a></div></div></article>
    </div>
  </div>
</section>

<section class="home-section" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-heading"><div><span class="section-kicker">Common questions</span><h2 id="faq-title">Before your visit</h2></div></div>
    <div class="faq-pro-list">
      <details><summary>How much does a consultation cost?</summary><p>The dermatologist consultation fee is ₹500 at both clinic locations. One follow-up for the same concern within 10 days is included.</p></details>
      <details><summary>Are walk-in patients accepted?</summary><p>Yes. Appointments and walk-ins are accepted, although patients with confirmed appointments receive priority.</p></details>
      <details><summary>How do I request an appointment?</summary><p>Use the website appointment form, call 7006613362 or 9796676541, or message the clinic on WhatsApp. The clinic confirms availability after receiving your request.</p></details>
      <details><summary>Which branch should I choose?</summary><p>Choose the branch that is most convenient. Dedicated Karan Nagar and Paloura pages provide doctor timings, procedure timings, directions and contact details.</p></details>
    </div>
  </div>
</section>

<section class="home-cta">
  <div class="container home-cta-grid">
    <div><span class="section-kicker" style="color:#f4d474">Request a consultation</span><h2>Your skin or hair concern deserves a clear diagnosis—not guesswork.</h2><p>Book a dermatologist-led consultation with Dr. Cheena Langer at Karan Nagar or Paloura Chowk.</p></div>
    <div class="hero-actions"><a class="button" href="/book-appointment/">Book Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp Now</a></div>
  </div>
</section>
</main>'''


def text_of(node) -> str:
    return " ".join(node.text_content().split())


def is_editorial(text: str) -> bool:
    low = text.strip().lower()
    return low in EDITORIAL_EXACT or any(low.startswith(prefix) for prefix in EDITORIAL_PREFIXES)


def cta_for(text: str):
    low = re.sub(r"^cta:\s*", "", text.strip(), flags=re.I).strip().lower()
    return CTA_MAP.get(low)


def is_listish(text: str) -> bool:
    t = text.strip()
    if not t or len(t) > 115:
        return False
    if t.endswith((".", "?", "!", ";")):
        return False
    if re.match(r"^(the|this|our|dr\.|aastha|patients|consult|yes|no|with|every|correct|treatment suitability|book |call |whatsapp |email |requests |submitting |individual results)", t, re.I):
        return False
    return True


def ensure_assets(doc):
    head = doc.find("head")
    if head is None:
        return
    for node in list(head.xpath(".//link[@href=$href]", href=CSS_HREF)):
        node.getparent().remove(node)
    css_link = etree.Element("link", rel="stylesheet", href=CSS_HREF)
    head.append(css_link)

    body = doc.find("body")
    if body is not None:
        for node in list(body.xpath(".//script[@src=$src]", src=JS_SRC)):
            node.getparent().remove(node)
        body.append(etree.Element("script", src=JS_SRC, defer="defer"))


def replace_homepage(doc):
    old = doc.xpath("//main")
    new = html.fragment_fromstring(HOME_MAIN)
    if old:
        old[0].getparent().replace(old[0], new)
    else:
        body = doc.find("body")
        body.append(new)


def visual_for(path: Path) -> str:
    p = "/".join(path.parts).lower()
    if any(k in p for k in ("hair", "alopecia", "dandruff", "scalp")):
        return "/assets/images/professional/hair-care.svg"
    if any(k in p for k in ("laser", "pigment", "melasma", "tattoo", "freckle", "sun-damage", "dark-")):
        return "/assets/images/professional/laser-care.svg"
    if any(k in p for k in ("acne", "scar", "mnrf", "microneed")):
        return "/assets/images/professional/acne-care.svg"
    if any(k in p for k in ("location", "contact", "appointment")):
        return "/assets/images/professional/clinic-care.svg"
    if any(k in p for k in ("cheena", "about")):
        return "/assets/images/professional/doctor-care.svg"
    return "/assets/images/professional/medical-care.svg"


def enhance_hero(doc, path: Path):
    heroes = doc.xpath("//section[contains(concat(' ', normalize-space(@class), ' '), ' page-hero ')]")
    if not heroes:
        return
    hero = heroes[0]
    classes = set((hero.get("class") or "").split())
    classes.add("page-hero--professional")
    hero.set("class", " ".join(sorted(classes)))
    containers = hero.xpath("./div[contains(concat(' ', normalize-space(@class), ' '), ' container ')]")
    if not containers:
        return
    container = containers[0]
    if container.xpath("./div[contains(concat(' ', normalize-space(@class), ' '), ' page-hero-copy ')]"):
        return
    copy = etree.Element("div", {"class": "page-hero-copy"})
    for child in list(container):
        container.remove(child)
        copy.append(child)
    art = html.fragment_fromstring(f'<div class="page-hero-art"><img src="{visual_for(path)}" alt="Decorative illustration for this clinic page" width="560" height="360"></div>')
    container.append(copy)
    container.append(art)


def remove_editorial(prose):
    for node in list(prose.xpath(".//p|.//h2|.//h3")):
        text = text_of(node)
        if is_editorial(text):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)


def convert_ctas(prose):
    for node in list(prose.xpath(".//p")):
        match = cta_for(text_of(node))
        if not match:
            continue
        label, href = match
        action = html.fragment_fromstring(f'<div class="section-actions"><a class="button button-secondary" href="{href}">{label}</a></div>')
        node.getparent().replace(node, action)


def convert_list_runs(prose):
    # Convert obvious sequences of short raw paragraphs into semantic lists.
    children = list(prose)
    i = 0
    while i < len(children):
        cue = children[i]
        cue_text = text_of(cue).lower()
        cue_tag = cue.tag.lower() if isinstance(cue.tag, str) else ""
        is_cue = cue_tag in {"h2", "h3"} and any(word in cue_text for word in LIST_CUES)
        if cue_tag == "p" and (cue_text.endswith(":") or any(word in cue_text for word in LIST_CUES)):
            is_cue = True
        if not is_cue:
            i += 1
            continue
        run = []
        j = i + 1
        while j < len(children) and len(run) < 18:
            candidate = children[j]
            if candidate.tag.lower() != "p":
                break
            text = text_of(candidate)
            if not is_listish(text) or cta_for(text) or is_editorial(text):
                break
            run.append(candidate)
            j += 1
        if len(run) >= 3:
            ul = etree.Element("ul", {"class": "feature-list"})
            for p in run:
                li = etree.Element("li")
                li.text = text_of(p)
                ul.append(li)
            cue.addnext(ul)
            for p in run:
                p.getparent().remove(p)
            children = list(prose)
            i = children.index(ul) + 1
        else:
            i += 1


def link_contact_text(prose):
    for p in prose.xpath(".//p"):
        text = text_of(p)
        if re.fullmatch(r"(?:\+?91[- ]?)?[6-9]\d{9}", text.replace(" ", "")):
            digits = re.sub(r"\D", "", text)[-10:]
            p.clear()
            a = etree.Element("a", href=f"tel:+91{digits}")
            a.text = text
            p.append(a)
        elif re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", text):
            p.clear()
            a = etree.Element("a", href=f"mailto:{text}")
            a.text = text
            p.append(a)


def enhance_prose(doc):
    for prose in doc.xpath("//article[contains(concat(' ', normalize-space(@class), ' '), ' prose ')]"):
        for toc in list(prose.xpath(".//*[contains(concat(' ', normalize-space(@class), ' '), ' article-toc ')]")):
            toc.getparent().remove(toc)
        convert_ctas(prose)
        convert_list_runs(prose)
        remove_editorial(prose)
        link_contact_text(prose)
        first_p = prose.xpath("./p")
        if first_p:
            classes = set((first_p[0].get("class") or "").split())
            classes.add("page-intro")
            first_p[0].set("class", " ".join(sorted(classes)))


def public_html_files():
    for p in ROOT.rglob("*.html"):
        if any(part in EXCLUDE_PARTS for part in p.parts):
            continue
        yield p


def main() -> int:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_root = BACKUPS / f"professional-redesign-{stamp}"
    changed = []
    errors = []
    parser = html.HTMLParser(encoding="utf-8", recover=True)

    for path in sorted(public_html_files()):
        try:
            before = path.read_text(encoding="utf-8", errors="ignore")
            doc = html.document_fromstring(before, parser=parser)
            ensure_assets(doc)
            relative = path.relative_to(ROOT)
            if relative.as_posix() == "index.html":
                replace_homepage(doc)
            else:
                enhance_hero(doc, relative)
                enhance_prose(doc)
            after = "<!DOCTYPE html>\n" + html.tostring(doc, encoding="unicode", method="html", pretty_print=False)
            if after == before:
                continue
            backup = backup_root / relative
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, backup)
            path.write_text(after, encoding="utf-8")
            changed.append(relative.as_posix())
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: {exc}")

    REPORTS.mkdir(exist_ok=True)
    report = REPORTS / f"professional-redesign-{stamp}.txt"
    report.write_text("\n".join([
        "Aastha Professional Redesign v15",
        f"Changed HTML files: {len(changed)}",
        f"Errors: {len(errors)}",
        "",
        "CHANGED:", *changed,
        "", "ERRORS:", *(errors or ["None"]),
    ]), encoding="utf-8")

    print(f"Changed HTML files: {len(changed)}")
    print(f"Errors: {len(errors)}")
    print(f"Report: {report}")
    if errors:
        for error in errors[:10]:
            print(" -", error)
        return 1
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
