#!/usr/bin/env python3
'''Final patient-facing content QC for Aastha's static website (v19).

This script is intentionally idempotent. It:
- rebuilds the Conditions, Treatments, Blog and About hubs;
- removes visible editorial/template instructions from inner pages;
- converts raw list-like paragraph runs into semantic lists;
- turns related-page labels into working internal links;
- converts final FAQ runs into accessible accordions;
- wraps final calls to action in a readable CTA panel;
- fixes duplicate breadcrumb labels;
- adds the final dark-mode and layout stylesheet.
'''
from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path

try:
    from lxml import etree, html
except ImportError:
    raise SystemExit("ERROR: lxml is required. Run with the project's .venv Python.")

ROOT = Path(__file__).resolve().parents[1]
BACKUPS = ROOT / "backups"
REPORTS = ROOT / "reports"
CSS_HREF = "/assets/css/final-qc.css"
EXCLUDE_PARTS = {
    ".git", ".venv", "backups", "reports", "dist", "_legacy-tools",
    "_project-docs", "content-drop", "schema-drop", "deployment",
}
DISCLAIMER = (
    "Results may vary from person to person. This content is for informational purposes only "
    "and does not substitute a consultation with a qualified medical professional. "
    "Dr. Cheena Langer, MD is a registered medical practitioner."
)

PAGE_MAP = {
    # Acne, scars and texture
    "acne": "/treatments/acne-treatment/",
    "acne treatment": "/treatments/acne-treatment/",
    "teenage acne": "/treatments/acne-treatment/",
    "adult acne": "/treatments/acne-treatment/",
    "hormonal acne": "/treatments/acne-treatment/",
    "hormonal-pattern acne": "/treatments/acne-treatment/",
    "blackheads and whiteheads": "/treatments/acne-treatment/",
    "acne marks": "/treatments/pigmentation-treatment/",
    "post-acne marks": "/treatments/pigmentation-treatment/",
    "acne scars": "/treatments/acne-scar-treatment/",
    "acne scar treatment": "/treatments/acne-scar-treatment/",
    "chickenpox scars": "/treatments/chickenpox-scar-treatment/",
    "chickenpox scar treatment": "/treatments/chickenpox-scar-treatment/",
    "keloids": "/treatments/keloid-hypertrophic-scar-treatment/",
    "hypertrophic scars": "/treatments/keloid-hypertrophic-scar-treatment/",
    "mnrf": "/treatments/mnrf-treatment/",
    "mnrf treatment": "/treatments/mnrf-treatment/",
    "fractional co2 laser": "/treatments/fractional-co2-laser/",
    "fractional co₂ laser": "/treatments/fractional-co2-laser/",
    "chemical peels": "/treatments/chemical-peels/",
    # Pigmentation and lasers
    "pigmentation": "/treatments/pigmentation-treatment/",
    "skin pigmentation": "/treatments/pigmentation-treatment/",
    "pigmentation treatment": "/treatments/pigmentation-treatment/",
    "melasma": "/treatments/melasma-treatment/",
    "freckles": "/treatments/freckles-treatment/",
    "dark neck": "/treatments/black-neck-acanthosis-nigricans-treatment/",
    "black neck": "/treatments/black-neck-acanthosis-nigricans-treatment/",
    "dark lips": "/treatments/dark-lips-treatment/",
    "under-eye dark circles": "/treatments/dark-circles-under-eye-treatment/",
    "dark circles": "/treatments/dark-circles-under-eye-treatment/",
    "vitiligo": "/treatments/vitiligo-treatment/",
    "sun damage": "/treatments/sun-damage-treatment/",
    "q-switched laser": "/treatments/q-switched-laser-toning/",
    "q-switched laser & laser toning": "/treatments/q-switched-laser-toning/",
    "laser toning": "/treatments/q-switched-laser-toning/",
    "ipl photofacial": "/treatments/ipl-photofacial/",
    "tattoo removal": "/treatments/laser-tattoo-removal/",
    "laser tattoo removal": "/treatments/laser-tattoo-removal/",
    # Hair
    "hair fall": "/treatments/hair-fall-treatment/",
    "hair fall treatment": "/treatments/hair-fall-treatment/",
    "male pattern hair loss": "/treatments/hair-fall-treatment/",
    "female pattern hair loss": "/treatments/hair-fall-treatment/",
    "alopecia areata": "/treatments/alopecia-areata-treatment/",
    "dandruff": "/treatments/seborrheic-dermatitis-dandruff/",
    "seborrhoeic dermatitis": "/treatments/seborrheic-dermatitis-dandruff/",
    "seborrheic dermatitis": "/treatments/seborrheic-dermatitis-dandruff/",
    "prp hair therapy": "/treatments/prp-gfc-hair-treatment/",
    "gfc hair therapy": "/treatments/prp-gfc-hair-treatment/",
    "prp & gfc hair treatment": "/treatments/prp-gfc-hair-treatment/",
    "hair transplant": "/treatments/hair-transplant/",
    "white hair removal": "/treatments/white-hair-removal/",
    "laser hair reduction": "/treatments/laser-hair-reduction/",
    # Allergy, inflammation and infection
    "eczema": "/treatments/eczema-atopic-dermatitis-treatment/",
    "atopic dermatitis": "/treatments/eczema-atopic-dermatitis-treatment/",
    "contact dermatitis": "/treatments/contact-dermatitis-treatment/",
    "skin allergy": "/treatments/skin-allergy-treatment/",
    "urticaria and hives": "/treatments/urticaria-hives-treatment/",
    "urticaria & hives": "/treatments/urticaria-hives-treatment/",
    "psoriasis": "/treatments/psoriasis-treatment/",
    "rosacea": "/treatments/rosacea-treatment/",
    "lichen planus": "/treatments/lichen-planus-treatment/",
    "fungal infection": "/treatments/fungal-infection-treatment/",
    "ringworm": "/treatments/fungal-infection-treatment/",
    "jock itch": "/treatments/fungal-infection-treatment/",
    "athlete's foot": "/treatments/fungal-infection-treatment/",
    "athlete’s foot": "/treatments/fungal-infection-treatment/",
    "nail fungus": "/treatments/fungal-infection-treatment/",
    "pityriasis versicolor": "/treatments/fungal-infection-treatment/",
    "scalp fungal infection": "/treatments/fungal-infection-treatment/",
    "scabies": "/treatments/scabies-treatment/",
    "molluscum": "/treatments/molluscum-contagiosum-treatment/",
    "molluscum contagiosum": "/treatments/molluscum-contagiosum-treatment/",
    "sti & std treatment": "/treatments/sti-std-treatment/",
    # Aesthetic and procedures
    "botulinum toxin & dermal fillers": "/treatments/botulinum-toxin-dermal-fillers/",
    "botulinum toxin treatment": "/treatments/botulinum-toxin-dermal-fillers/",
    "dermal fillers": "/treatments/botulinum-toxin-dermal-fillers/",
    "hifu & rf skin tightening": "/treatments/hifu-rf-skin-tightening/",
    "hifu": "/treatments/hifu-treatment/",
    "hifu treatment": "/treatments/hifu-treatment/",
    "rf skin tightening": "/treatments/rf-skin-tightening/",
    "hydrafacial & medifacial": "/treatments/hydrafacial-medifacial/",
    "hydrafacial": "/treatments/hydrafacial-medifacial/",
    "cryolipolysis & body contouring": "/treatments/cryolipolysis-body-contouring/",
    "wart removal": "/treatments/wart-mole-skin-tag-removal/",
    "warts": "/treatments/wart-mole-skin-tag-removal/",
    "moles": "/treatments/wart-mole-skin-tag-removal/",
    "skin tags": "/treatments/wart-mole-skin-tag-removal/",
    "dpn": "/treatments/dpn-seborrheic-keratosis-removal/",
    "seborrhoeic keratosis": "/treatments/dpn-seborrheic-keratosis-removal/",
    "seborrheic keratosis": "/treatments/dpn-seborrheic-keratosis-removal/",
    "sebaceous cysts": "/treatments/cyst-lipoma-removal/",
    "lipoma": "/treatments/cyst-lipoma-removal/",
    "cyst & lipoma removal": "/treatments/cyst-lipoma-removal/",
    "skin biopsy": "/treatments/skin-biopsy/",
    "skin abscess & incision and drainage": "/treatments/skin-abscess-incision-drainage/",
    "xanthelasma": "/treatments/xanthelasma-removal/",
    "corns": "/treatments/corn-removal-treatment/",
    "corn removal": "/treatments/corn-removal-treatment/",
    "ingrown toenail": "/treatments/ingrown-toenail-nail-surgery/",
    "ingrown toenail & nail surgery": "/treatments/ingrown-toenail-nail-surgery/",
    "skin cancer screening": "/treatments/skin-cancer-screening/",
    "paediatric dermatology": "/treatments/paediatric-dermatology/",
}

CTA_MAP = {
    "book appointment": ("Book Appointment", "/book-appointment/"),
    "book an appointment": ("Book an Appointment", "/book-appointment/"),
    "request appointment": ("Request Appointment", "/book-appointment/"),
    "view all treatments": ("View All Treatments", "/treatments/"),
    "view all conditions": ("View All Conditions", "/conditions/"),
    "meet dr. cheena langer": ("Meet Dr. Cheena Langer", "/dr-cheena-langer/"),
    "view dr. cheena langer's professional profile": ("View Doctor Profile", "/dr-cheena-langer/"),
    "view dr. cheena langer’s professional profile": ("View Doctor Profile", "/dr-cheena-langer/"),
    "whatsapp the clinic": ("WhatsApp the Clinic", "https://wa.me/917006613362"),
    "whatsapp clinic": ("WhatsApp the Clinic", "https://wa.me/917006613362"),
    "whatsapp now": ("WhatsApp Now", "https://wa.me/917006613362"),
    "call 7006613362": ("Call 7006613362", "tel:+917006613362"),
    "choose a clinic": ("Choose a Clinic", "/contact/"),
    "choose a location": ("Choose a Location", "/contact/"),
    "visit the skin journal": ("Visit the Skin Journal", "/blog/"),
}

EDITORIAL_EXACT = {
    "body sections", "page body", "buttons", "suggested links", "suggested form fields:",
    "suggested form fields", "consent text", "appointment notice", "mid-page cta",
    "faq section", "final cta", "end cta", "medical disclaimer", "schema block",
    "geo entity summary", "meta title", "meta description", "primary keyword",
    "secondary keywords", "semantic/lsi terms", "target word count", "article library",
}
EDITORIAL_PREFIXES = (
    "cta:", "recommended homepage categories:", "suggested homepage articles:",
    "feature the latest educational articles on:", "every result image should state:",
    "this section should display only clinic-approved", "new posts can be added from",
    "a placeholder for", "a future article can be", "use the keyword map",
    "the appointment form should allow", "before-and-after photographs should only be used",
    "public-facing clinic content uses", "replace this block with", "copy the page’s meta",
    "insert the visible body copy", "add the separate json-ld", "remove the noindex",
    "required page components", "development status", "content complete. build",
    "the complete medically reviewed page copy", "clinic operational details and branch-wise",
)
LIST_CUE_WORDS = (
    "concerns", "conditions", "services", "options", "include", "includes", "included",
    "available", "treated", "treatments", "procedures", "symptoms", "causes", "benefits",
    "steps", "expect", "focus", "may include", "can include", "seek urgent", "areas",
    "patients may be asked", "investigations", "principles", "appointment requests",
)


def t(node) -> str:
    """Return visible text for both lxml.html and generic etree elements."""
    if node is None:
        return ""
    return " ".join("".join(node.itertext()).split())


def normalise(value: str) -> str:
    value = re.sub(r"\s+", " ", value.strip().lower())
    value = value.replace("–", "-").replace("—", "-")
    return value


def link_item(label: str, href: str, description: str = "") -> str:
    description_html = f"<span>{description}</span>" if description else ""
    return f'<a class="hub-link" href="{href}"><strong>{label}</strong>{description_html}</a>'


def hero(title: str, eyebrow: str, lead: str, image: str) -> str:
    return f'''<section class="page-hero page-hero--professional hub-hero"><div class="container">
      <div class="page-hero-copy">
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <span aria-current="page">{title}</span></nav>
        <span class="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p class="lead">{lead}</p>
        <div class="hero-actions"><a class="button" href="/book-appointment/">Book an Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp the Clinic</a></div>
      </div>
      <div class="page-hero-art"><img src="{image}" alt="Decorative clinic illustration" width="560" height="360"></div>
    </div></section>'''


def category(icon: str, title: str, intro: str, links: list[tuple[str, str, str]], wide: bool = False) -> str:
    cls = "hub-category hub-category--wide" if wide else "hub-category"
    items = "".join(link_item(*item) for item in links)
    return f'''<section class="{cls}"><div class="hub-category-heading"><span class="hub-icon" aria-hidden="true">{icon}</span><div><h2>{title}</h2><p>{intro}</p></div></div><div class="hub-link-grid">{items}</div></section>'''


def conditions_main() -> str:
    groups = [
        category("◉", "Acne, pimples and scars", "Choose the closest concern. Teenage, adult and hormonal acne all open the medically reviewed acne guide.", [
            ("Teenage acne", "/treatments/acne-treatment/", "Breakouts during adolescence"),
            ("Adult acne", "/treatments/acne-treatment/", "Persistent or newly developing acne"),
            ("Hormonal acne", "/treatments/acne-treatment/", "Patterned or recurring breakouts"),
            ("Blackheads and active acne", "/treatments/acne-treatment/", "Blocked pores, pimples and cysts"),
            ("Acne marks", "/treatments/pigmentation-treatment/", "Post-acne red or dark marks"),
            ("Acne scars", "/treatments/acne-scar-treatment/", "Rolling, boxcar and ice-pick scars"),
        ]),
        category("✦", "Pigmentation and colour changes", "Dark patches and white patches can have different causes, so diagnosis comes before treatment.", [
            ("Melasma", "/treatments/melasma-treatment/", "Patchy facial pigmentation"),
            ("General pigmentation", "/treatments/pigmentation-treatment/", "Uneven tone and post-inflammatory marks"),
            ("Dark lips", "/treatments/dark-lips-treatment/", "Lip pigmentation concerns"),
            ("Under-eye dark circles", "/treatments/dark-circles-under-eye-treatment/", "Pigment, shadow and structural causes"),
            ("Black neck", "/treatments/black-neck-acanthosis-nigricans-treatment/", "Acanthosis nigricans and friction"),
            ("Freckles and sun spots", "/treatments/freckles-treatment/", "Sun-related pigment spots"),
            ("Vitiligo", "/treatments/vitiligo-treatment/", "White patches requiring evaluation"),
            ("Sun damage", "/treatments/sun-damage-treatment/", "Tanning, spots and photo-ageing"),
        ]),
        category("≈", "Itching, allergy and inflammatory rashes", "Similar-looking rashes may represent allergy, eczema, psoriasis, rosacea or another condition.", [
            ("Eczema and atopic dermatitis", "/treatments/eczema-atopic-dermatitis-treatment/", "Dry, itchy and inflamed skin"),
            ("Contact dermatitis", "/treatments/contact-dermatitis-treatment/", "Reactions to products or exposures"),
            ("Skin allergy", "/treatments/skin-allergy-treatment/", "Recurring itching and allergic rashes"),
            ("Urticaria and hives", "/treatments/urticaria-hives-treatment/", "Raised, transient itchy welts"),
            ("Psoriasis", "/treatments/psoriasis-treatment/", "Chronic scaly inflammatory patches"),
            ("Rosacea", "/treatments/rosacea-treatment/", "Facial redness and sensitivity"),
            ("Lichen planus", "/treatments/lichen-planus-treatment/", "Inflammatory skin and pigment changes"),
            ("Dandruff and seborrhoeic dermatitis", "/treatments/seborrheic-dermatitis-dandruff/", "Flaking and scalp inflammation"),
        ]),
        category("◌", "Fungal and other skin infections", "Recurrent infections need the correct diagnosis; steroid-mixed creams can alter their appearance.", [
            ("Fungal infection", "/treatments/fungal-infection-treatment/", "Ringworm, jock itch and athlete’s foot"),
            ("Scabies", "/treatments/scabies-treatment/", "Contagious itching caused by mites"),
            ("Molluscum contagiosum", "/treatments/molluscum-contagiosum-treatment/", "Small viral skin bumps"),
            ("Skin abscess", "/treatments/skin-abscess-incision-drainage/", "Painful pus-filled swelling"),
            ("STI and STD concerns", "/treatments/sti-std-treatment/", "Confidential assessment and care"),
            ("Paediatric infections", "/treatments/paediatric-dermatology/", "Age-appropriate care for children"),
        ]),
        category("♒", "Hair, scalp and unwanted hair", "Hair treatment starts by identifying the cause of shedding, thinning or scalp inflammation.", [
            ("Hair fall and thinning", "/treatments/hair-fall-treatment/", "Male and female pattern hair loss"),
            ("Alopecia areata", "/treatments/alopecia-areata-treatment/", "Sudden patchy hair loss"),
            ("Dandruff and itchy scalp", "/treatments/seborrheic-dermatitis-dandruff/", "Flaking, redness and scalp irritation"),
            ("PRP and GFC hair therapy", "/treatments/prp-gfc-hair-treatment/", "Supportive treatment for selected cases"),
            ("Hair-transplant consultation", "/treatments/hair-transplant/", "Assessment for surgical restoration"),
            ("Laser hair reduction", "/treatments/laser-hair-reduction/", "Reduction of unwanted dark hair"),
            ("White and grey hair removal", "/treatments/white-hair-removal/", "Options when laser is unsuitable"),
        ]),
        category("◇", "Moles, growths, nails and minor procedures", "Changing, bleeding or painful lesions should be examined rather than treated from appearance alone.", [
            ("Warts, moles and skin tags", "/treatments/wart-mole-skin-tag-removal/", "Assessment and removal options"),
            ("DPN and seborrhoeic keratosis", "/treatments/dpn-seborrheic-keratosis-removal/", "Benign raised skin growths"),
            ("Cysts and lipomas", "/treatments/cyst-lipoma-removal/", "Lumps beneath or within the skin"),
            ("Xanthelasma", "/treatments/xanthelasma-removal/", "Yellowish eyelid plaques"),
            ("Ingrown toenail", "/treatments/ingrown-toenail-nail-surgery/", "Pain, swelling and recurrent infection"),
            ("Corns", "/treatments/corn-removal-treatment/", "Painful areas of thickened skin"),
            ("Skin biopsy", "/treatments/skin-biopsy/", "Diagnostic sampling when needed"),
            ("Skin cancer screening", "/treatments/skin-cancer-screening/", "Assessment of suspicious lesions"),
        ]),
        category("✚", "Scars, texture and skin quality", "Scar type and depth determine whether resurfacing, needling, subcision or another approach is appropriate.", [
            ("Acne-scar treatment", "/treatments/acne-scar-treatment/", "Combination plans for different scar types"),
            ("Chickenpox scars", "/treatments/chickenpox-scar-treatment/", "Depressed and textural scars"),
            ("Keloids and raised scars", "/treatments/keloid-hypertrophic-scar-treatment/", "Raised, firm or symptomatic scars"),
            ("MNRF", "/treatments/mnrf-treatment/", "Microneedling radiofrequency"),
            ("Fractional CO₂ laser", "/treatments/fractional-co2-laser/", "Selected scars and texture concerns"),
            ("Chemical peels", "/treatments/chemical-peels/", "Selected acne, pigment and texture concerns"),
        ]),
        category("♡", "Children's dermatology", "Children need age-appropriate diagnosis, medicines and skincare guidance.", [
            ("Paediatric dermatology", "/treatments/paediatric-dermatology/", "Eczema, infections, rashes, hair and nail concerns"),
            ("Childhood eczema", "/treatments/eczema-atopic-dermatitis-treatment/", "Dry, itchy and sensitive skin"),
            ("Molluscum in children", "/treatments/molluscum-contagiosum-treatment/", "Common viral bumps"),
            ("Scabies in families", "/treatments/scabies-treatment/", "Diagnosis and household treatment guidance"),
        ]),
    ]
    return f'''<main id="main-content" class="hub-main">{hero("Find care for your skin, hair or nail concern", "Patient concerns", "You do not need to diagnose the problem before booking. Start with what you are experiencing and open the related dermatologist-reviewed page.", "/assets/images/professional/medical-care.svg")}
    <section class="hub-section hub-section--soft"><div class="container"><p class="hub-intro">Choose the closest concern and open its detailed guide. Conditions that share the same medical pathway—such as teenage, adult and hormonal acne—lead to the appropriate core acne-treatment page.</p><div class="hub-category-grid">{''.join(groups)}</div><div class="hub-notice"><strong>Seek urgent medical care</strong> for difficulty breathing, facial or throat swelling, extensive blistering, rapidly spreading redness, severe pain, fever with a widespread rash or eye involvement.</div></div></section>
    <section class="home-cta"><div class="container home-cta-grid"><div><span class="section-kicker" style="color:#f4d474">Not sure what it is?</span><h2>Describe the symptom—not the diagnosis.</h2><p>Dr. Cheena Langer can assess itching, pimples, hair fall, dark patches, a changing mole or another concern at Karan Nagar or Paloura Chowk.</p></div><div class="hero-actions"><a class="button" href="/book-appointment/">Book Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp Now</a></div></div></section></main>'''


def treatments_main() -> str:
    groups = [
        category("✚", "Medical dermatology", "Diagnosis-led care for common, chronic and recurrent skin conditions.", [
            ("Acne treatment", "/treatments/acne-treatment/", "Teenage, adult and hormonal acne"),
            ("Eczema and atopic dermatitis", "/treatments/eczema-atopic-dermatitis-treatment/", "Dry, itchy and inflamed skin"),
            ("Skin allergy", "/treatments/skin-allergy-treatment/", "Allergic and recurring rashes"),
            ("Psoriasis", "/treatments/psoriasis-treatment/", "Chronic inflammatory plaques"),
            ("Rosacea", "/treatments/rosacea-treatment/", "Facial redness and sensitivity"),
            ("Urticaria and hives", "/treatments/urticaria-hives-treatment/", "Raised itchy welts"),
            ("Vitiligo", "/treatments/vitiligo-treatment/", "White-patch assessment and care"),
            ("Fungal infection", "/treatments/fungal-infection-treatment/", "Ringworm and recurrent fungal rashes"),
            ("Scabies", "/treatments/scabies-treatment/", "Contagious night-time itching"),
            ("Paediatric dermatology", "/treatments/paediatric-dermatology/", "Skin care for children"),
        ], wide=True),
        category("◉", "Acne scars and resurfacing", "Treatment is selected according to scar type, depth, colour and skin type.", [
            ("Acne-scar treatment", "/treatments/acne-scar-treatment/", "Combination treatment planning"),
            ("MNRF", "/treatments/mnrf-treatment/", "Microneedling radiofrequency"),
            ("Fractional CO₂ laser", "/treatments/fractional-co2-laser/", "Selected scars and texture concerns"),
            ("Chemical peels", "/treatments/chemical-peels/", "Selected acne and pigment concerns"),
            ("Chickenpox scars", "/treatments/chickenpox-scar-treatment/", "Depressed scar management"),
            ("Keloid and raised-scar treatment", "/treatments/keloid-hypertrophic-scar-treatment/", "Raised or symptomatic scars"),
        ]),
        category("✦", "Pigmentation and laser treatments", "Laser or peel treatment is not suitable for every pigment concern; diagnosis and sun protection remain essential.", [
            ("Pigmentation treatment", "/treatments/pigmentation-treatment/", "Uneven tone and dark marks"),
            ("Melasma treatment", "/treatments/melasma-treatment/", "Recurrent facial pigmentation"),
            ("Q-switched laser and toning", "/treatments/q-switched-laser-toning/", "Selected pigment indications"),
            ("IPL photofacial", "/treatments/ipl-photofacial/", "Selected redness and sun damage"),
            ("Laser tattoo removal", "/treatments/laser-tattoo-removal/", "Assessment-based tattoo fading"),
            ("Sun-damage treatment", "/treatments/sun-damage-treatment/", "Spots, tanning and photo-ageing"),
            ("Dark lips", "/treatments/dark-lips-treatment/", "Lip pigmentation management"),
            ("Dark circles", "/treatments/dark-circles-under-eye-treatment/", "Under-eye assessment and options"),
        ]),
        category("♒", "Hair and scalp treatments", "Hair procedures work best when they are part of a diagnosis-led medical plan.", [
            ("Hair-fall treatment", "/treatments/hair-fall-treatment/", "Assessment of shedding and thinning"),
            ("PRP and GFC hair therapy", "/treatments/prp-gfc-hair-treatment/", "Supportive treatment in selected cases"),
            ("Hair transplant", "/treatments/hair-transplant/", "Surgical-restoration consultation"),
            ("Alopecia areata", "/treatments/alopecia-areata-treatment/", "Patchy autoimmune hair loss"),
            ("Dandruff and scalp care", "/treatments/seborrheic-dermatitis-dandruff/", "Flaking, itching and inflammation"),
            ("Laser hair reduction", "/treatments/laser-hair-reduction/", "Reduction of unwanted dark hair"),
            ("White and grey hair removal", "/treatments/white-hair-removal/", "Non-laser options where appropriate"),
        ]),
        category("◇", "Aesthetic and anti-ageing", "Facial anatomy, movement, skin condition and expectations guide every aesthetic treatment plan.", [
            ("Botulinum toxin and dermal fillers", "/treatments/botulinum-toxin-dermal-fillers/", "Expression lines and selected volume concerns"),
            ("HIFU and RF tightening", "/treatments/hifu-rf-skin-tightening/", "Energy-based firmness treatments"),
            ("HIFU treatment", "/treatments/hifu-treatment/", "Focused ultrasound in selected patients"),
            ("RF skin tightening", "/treatments/rf-skin-tightening/", "Radiofrequency-based treatment"),
            ("Hydrafacial and medifacial", "/treatments/hydrafacial-medifacial/", "Medical-grade facial care"),
            ("Cryolipolysis and body contouring", "/treatments/cryolipolysis-body-contouring/", "Selected localised fat concerns"),
        ]),
        category("◌", "Minor procedures and dermato-surgery", "Every procedure is preceded by assessment, counselling, consent and aftercare guidance.", [
            ("Wart, mole and skin-tag removal", "/treatments/wart-mole-skin-tag-removal/", "Assessment and removal options"),
            ("DPN and seborrhoeic keratosis", "/treatments/dpn-seborrheic-keratosis-removal/", "Benign raised lesions"),
            ("Cyst and lipoma removal", "/treatments/cyst-lipoma-removal/", "Selected skin and soft-tissue lumps"),
            ("Skin abscess drainage", "/treatments/skin-abscess-incision-drainage/", "Selected painful pus-filled swellings"),
            ("Skin biopsy", "/treatments/skin-biopsy/", "Diagnostic tissue sampling"),
            ("Xanthelasma removal", "/treatments/xanthelasma-removal/", "Selected eyelid plaques"),
            ("Ingrown toenail surgery", "/treatments/ingrown-toenail-nail-surgery/", "Recurrent painful nail problems"),
            ("Corn removal", "/treatments/corn-removal-treatment/", "Painful areas of thickened skin"),
        ], wide=True),
    ]
    return f'''<main id="main-content" class="hub-main">{hero("Dermatology treatments in Jammu", "Treatment directory", "Explore medical dermatology, laser, hair, aesthetic and minor-procedure pages. Treatment suitability is confirmed only after assessment.", "/assets/images/professional/laser-care.svg")}
    <section class="hub-section hub-section--soft"><div class="container"><p class="hub-intro">Every treatment name below opens a dedicated page. The directory is organised by purpose so patients can move from a general option—such as acne care—to the appropriate detailed guide.</p><div class="hub-category-grid">{''.join(groups)}</div><div class="hub-notice"><strong>Important:</strong> Listing a treatment does not mean it is appropriate for every patient. Exact cost, sessions, branch availability, recovery and alternatives are discussed after consultation.</div></div></section>
    <section class="home-cta"><div class="container home-cta-grid"><div><span class="section-kicker" style="color:#f4d474">Treatment planning</span><h2>Start with the diagnosis, not the procedure name.</h2><p>Consult Dr. Cheena Langer for a plan based on your concern, skin type, health history and expected downtime.</p></div><div class="hero-actions"><a class="button" href="/book-appointment/">Book Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp Now</a></div></div></section></main>'''


def blog_main() -> str:
    cards = [
        ("Acne", "Acne treatment: when breakouts need medical care", "Understand active acne, blackheads, painful cysts, marks and scar prevention.", "/treatments/acne-treatment/", "/assets/images/professional/acne-care.svg"),
        ("Infections", "Why fungal infection may keep coming back", "Learn why incomplete treatment, family spread and steroid-mixed creams can contribute.", "/treatments/fungal-infection-treatment/", "/assets/images/professional/medical-care.svg"),
        ("Hair", "Hair fall: why diagnosis comes before a procedure", "Explore common causes of shedding, thinning and pattern hair loss.", "/treatments/hair-fall-treatment/", "/assets/images/professional/hair-care.svg"),
        ("Laser", "What to know before laser hair reduction", "Read about assessment, planned sessions, skin type and hair characteristics.", "/treatments/laser-hair-reduction/", "/assets/images/professional/laser-care.svg"),
        ("Pigmentation", "Why pigmentation does not have one universal treatment", "Melasma, post-acne marks and sun spots require different plans.", "/treatments/pigmentation-treatment/", "/assets/images/professional/laser-care.svg"),
        ("Allergy", "When an itchy rash needs a dermatologist", "Eczema, allergy and infection can look similar but need different treatment.", "/treatments/skin-allergy-treatment/", "/assets/images/professional/medical-care.svg"),
    ]
    card_html = "".join(f'''<a class="patient-guide-card" href="{href}"><img src="{image}" alt="" width="640" height="360"><div class="patient-guide-body"><span class="guide-topic">{topic}</span><h2>{title}</h2><p>{desc}</p><span class="guide-link">Read patient guide →</span></div></a>''' for topic, title, desc, href, image in cards)
    return f'''<main id="main-content" class="hub-main">{hero("Skin Journal and patient guides", "Dermatologist-reviewed education", "Clear, practical information about common skin, hair and treatment questions—written for patients and linked to the relevant care pages.", "/assets/images/professional/clinic-care.svg")}
    <section class="hub-section hub-section--soft"><div class="container"><div class="section-heading"><div><span class="section-kicker">Featured guides</span><h2>Start with a topic that matters to you</h2><p>Explore concise guides that answer common patient questions and open the relevant care page. Additional dermatologist-reviewed articles will be published here over time.</p></div></div><div class="guide-grid">{card_html}</div><div class="hub-notice"><strong>Medical information online cannot confirm a diagnosis.</strong> A persistent, painful, spreading or recurring concern should be assessed in person.</div></div></section>
    <section class="home-cta"><div class="container home-cta-grid"><div><span class="section-kicker" style="color:#f4d474">Need personal guidance?</span><h2>Turn general information into an individual treatment plan.</h2><p>Book a consultation with Dr. Cheena Langer at Karan Nagar or Paloura Chowk.</p></div><div class="hero-actions"><a class="button" href="/book-appointment/">Book Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp Now</a></div></div></section></main>'''


def about_main() -> str:
    return f'''<main id="main-content" class="hub-main">{hero("About Aastha Skin & Dermato-Cosmetic Centre", "Doctor-led dermatology in Jammu", "Medical dermatology, laser, hair, aesthetic and minor-procedure care led by Dr. Cheena Langer across Karan Nagar and Paloura Chowk.", "/assets/images/professional/doctor-care.svg")}
    <section class="hub-section hub-section--soft"><div class="container"><div class="about-story-grid"><article class="about-story-card"><span class="section-kicker">The clinic</span><h2>Diagnosis before treatment</h2><p>Skin, hair and nail concerns that look similar may have different causes. The clinic begins with medical history, examination and a clear explanation of the available options rather than a one-procedure-for-everyone approach.</p><p>Medical dermatology, acne and scar care, pigmentation, laser procedures, hair and scalp treatment, aesthetic dermatology and selected dermato-surgery are available within the same clinical setting.</p></article><article class="about-story-card"><span class="section-kicker">The dermatologist</span><h2>Dr. Cheena Langer</h2><p>Dr. Cheena Langer, MBBS, MD Dermatology, Consultant Dermatologist, leads Aastha Skin &amp; Dermato-Cosmetic Centre. Her professional interests include medical dermatology, acne, pigmentation, laser dermatology, trichology, infections, urticaria, cosmetic dermatology and dermato-surgery.</p><div class="hero-actions"><a class="button" href="/dr-cheena-langer/">View Doctor Profile</a></div></article></div></div></section>
    <section class="hub-section"><div class="container"><div class="section-heading"><div><span class="section-kicker">Patient-care principles</span><h2>What patients can expect</h2></div></div><div class="value-grid"><article class="value-card"><span>01</span><h3>Focused assessment</h3><p>Symptoms, medical history, triggers and previous treatments are reviewed.</p></article><article class="value-card"><span>02</span><h3>Clear explanation</h3><p>The likely diagnosis, options, limitations and alternatives are discussed.</p></article><article class="value-card"><span>03</span><h3>Personalised planning</h3><p>Skin type, health history, goals and acceptable downtime shape the plan.</p></article><article class="value-card"><span>04</span><h3>Follow-up and aftercare</h3><p>Patients receive relevant instructions, prevention advice and review planning.</p></article></div></div></section>
    <section class="hub-section hub-section--soft"><div class="container"><div class="section-heading"><div><span class="section-kicker">Care under one roof</span><h2>Explore the clinic’s main areas</h2></div></div><div class="hub-category-grid">{category("✚", "Medical dermatology", "Diagnosis and treatment of skin, hair, scalp and nail conditions.", [("Browse skin and hair concerns", "/conditions/", "Find care by symptom or diagnosis"), ("Acne treatment", "/treatments/acne-treatment/", "Teenage and adult acne"), ("Fungal infection", "/treatments/fungal-infection-treatment/", "Recurrent and steroid-modified infection"), ("Hair-fall treatment", "/treatments/hair-fall-treatment/", "Shedding and pattern hair loss")])}{category("◇", "Procedural and aesthetic care", "Selected treatments are recommended only after medical assessment.", [("Laser hair reduction", "/treatments/laser-hair-reduction/", "Planned reduction of unwanted hair"), ("Acne-scar treatment", "/treatments/acne-scar-treatment/", "Combination scar planning"), ("Pigmentation and laser", "/treatments/pigmentation-treatment/", "Diagnosis-led pigment care"), ("View all treatments", "/treatments/", "Complete treatment directory")])}</div></div></section>
    <section class="hub-section"><div class="container"><div class="section-heading"><div><span class="section-kicker">Two Jammu clinics</span><h2>Choose the branch that is convenient for you</h2></div></div><div class="clinic-location-grid"><article class="clinic-location-card"><h2>Karan Nagar</h2><address>Lane 2, Karan Nagar, near Amphalla Chowk, Jammu – 180005</address><p><strong>Reception:</strong> Monday–Saturday 10:00 AM–8:00 PM; Sunday 10:00 AM–3:00 PM</p><div class="hero-actions"><a class="button" href="/locations/karan-nagar/">Clinic Details</a><a class="button button-secondary" href="https://maps.app.goo.gl/pHCQ1r4crKuZBSi98" target="_blank" rel="noopener">Directions</a></div></article><article class="clinic-location-card"><h2>Paloura Chowk</h2><address>Top Paloura, opposite Government Senior Secondary School, Jammu – 181121</address><p><strong>Reception:</strong> Monday–Saturday 10:00 AM–8:00 PM; Sunday 10:00 AM–2:00 PM</p><div class="hero-actions"><a class="button" href="/locations/paloura/">Clinic Details</a><a class="button button-secondary" href="https://maps.app.goo.gl/kh4AqZoUkscpEgWc8" target="_blank" rel="noopener">Directions</a></div></article></div></div></section>
    <section class="hub-section hub-section--soft"><div class="container"><div class="section-heading"><div><span class="section-kicker">First consultation</span><h2>A simple patient journey</h2></div></div><div class="process-grid"><article class="process-step"><span>1</span><h3>Share the concern</h3><p>Describe symptoms, duration and prior treatment.</p></article><article class="process-step"><span>2</span><h3>Clinical assessment</h3><p>The skin, scalp, hair or nails are examined.</p></article><article class="process-step"><span>3</span><h3>Discuss options</h3><p>Medicines, tests, procedures or skincare changes are explained.</p></article><article class="process-step"><span>4</span><h3>Plan follow-up</h3><p>Aftercare and review timing are provided when needed.</p></article></div><div class="hub-notice"><strong>Consultation fee:</strong> ₹500 at both clinics. One follow-up consultation within 10 days is included; after that period, the regular consultation fee applies.</div></div></section>
    <section class="home-cta"><div class="container home-cta-grid"><div><span class="section-kicker" style="color:#f4d474">Request a consultation</span><h2>Begin with a clear diagnosis.</h2><p>Call or WhatsApp Aastha Skin Centre to request a consultation with Dr. Cheena Langer.</p></div><div class="hero-actions"><a class="button" href="/book-appointment/">Book Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp Now</a></div></div></section></main>'''


def ensure_css(doc):
    head = doc.find("head")
    if head is None:
        return
    for old in list(head.xpath('.//link[@href=$href]', href=CSS_HREF)):
        old.getparent().remove(old)
    link = etree.Element("link", rel="stylesheet", href=CSS_HREF)
    head.append(link)


def replace_main(doc, markup: str):
    new_main = html.fragment_fromstring(markup)
    current = doc.xpath("//main")
    if current:
        current[0].getparent().replace(current[0], new_main)
    else:
        doc.find("body").append(new_main)


def rebuild_breadcrumb(doc, relative: Path):
    crumbs = doc.xpath('//nav[contains(concat(" ", normalize-space(@class), " "), " breadcrumbs ")]')
    if not crumbs:
        return
    h1s = doc.xpath("//main//h1")
    current = t(h1s[0]) if h1s else relative.stem.replace("-", " ").title()
    nav = crumbs[0]
    nav.clear()
    home = etree.Element("a", href="/")
    home.text = "Home"
    nav.append(home)
    if relative.parts and relative.parts[0] == "treatments" and relative.as_posix() != "treatments/index.html":
        home.tail = " / "
        hub = etree.Element("a", href="/treatments/")
        hub.text = "Treatments"
        nav.append(hub)
        hub.tail = " / "
    elif relative.parts and relative.parts[0] == "locations" and len(relative.parts) > 2:
        home.tail = " / "
    else:
        home.tail = " / "
    span = etree.Element("span", {"aria-current": "page"})
    span.text = current
    nav.append(span)


def is_editorial(value: str) -> bool:
    low = normalise(value)
    return low in EDITORIAL_EXACT or any(low.startswith(prefix) for prefix in EDITORIAL_PREFIXES)


def remove_editorial_nodes(prose) -> int:
    removed = 0
    for node in list(prose.xpath('.//p|.//h2|.//h3|.//h4|.//li')):
        if is_editorial(t(node)):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
                removed += 1
    return removed


def convert_cta_nodes(prose) -> int:
    changed = 0
    for node in list(prose.xpath('./p')):
        low = normalise(re.sub(r'^cta:\s*', '', t(node), flags=re.I))
        match = CTA_MAP.get(low)
        if not match:
            continue
        label, href = match
        attrs = ' target="_blank" rel="noopener"' if href.startswith('http') else ''
        block = html.fragment_fromstring(f'<div class="section-actions"><a class="button button-secondary" href="{href}"{attrs}>{label}</a></div>')
        node.getparent().replace(node, block)
        changed += 1
    return changed


def listish(value: str) -> bool:
    value = value.strip()
    if not value or len(value) > 125:
        return False
    if value.endswith((".", "?", "!", ";", ":")):
        return False
    if re.match(r'^(the|this|these|our|dr\.|aastha|patients|treatment|consult|yes|no|with|every|correct|not every|a dermatologist|hair fall may|acne can|skin infections may|results may)', value, re.I):
        return False
    return True


def convert_list_runs(prose) -> int:
    changed = 0
    while True:
        children = list(prose)
        converted = False
        for i, cue in enumerate(children):
            if not isinstance(cue.tag, str):
                continue
            tag = cue.tag.lower()
            value = normalise(t(cue))
            cue_like = (
                (tag in {"h2", "h3", "h4", "p"} and any(word in value for word in LIST_CUE_WORDS))
                or (tag == "p" and value.endswith(":"))
            )
            if not cue_like:
                continue
            run = []
            for candidate in children[i + 1:i + 22]:
                if not isinstance(candidate.tag, str) or candidate.tag.lower() != "p":
                    break
                value2 = t(candidate)
                if not listish(value2) or is_editorial(value2) or normalise(value2) in CTA_MAP:
                    break
                run.append(candidate)
            if len(run) < 3:
                continue
            ul = etree.Element("ul", {"class": "feature-list"})
            for p in run:
                li = etree.Element("li")
                li.text = t(p)
                ul.append(li)
            cue.addnext(ul)
            for p in run:
                p.getparent().remove(p)
            changed += 1
            converted = True
            break
        if not converted:
            break
    for ul in prose.xpath('./ul'):
        classes = set((ul.get('class') or '').split())
        classes.add('feature-list')
        ul.set('class', ' '.join(sorted(classes)))
    return changed


def replace_related_links(prose) -> int:
    changed = 0
    children = list(prose)
    i = 0
    while i < len(children):
        node = children[i]
        if normalise(t(node)) not in {"suggested links", "related links", "related treatments", "related pages"}:
            i += 1
            continue
        links = []
        consumed = []
        for candidate in children[i + 1:i + 24]:
            if not isinstance(candidate.tag, str) or candidate.tag.lower() not in {"p", "li"}:
                break
            label = t(candidate)
            href = PAGE_MAP.get(normalise(label))
            if not href and len(label) > 80:
                break
            consumed.append(candidate)
            if href:
                links.append((label, href))
        if links:
            section = etree.Element("div", {"class": "related-care"})
            heading = etree.SubElement(section, "h3")
            heading.text = "Related care"
            grid = etree.SubElement(section, "div", {"class": "related-link-grid"})
            seen = set()
            for label, href in links:
                if href in seen:
                    continue
                seen.add(href)
                a = etree.SubElement(grid, "a", {"class": "related-link-chip", "href": href})
                a.text = label
            node.getparent().replace(node, section)
            for candidate in consumed:
                parent = candidate.getparent()
                if parent is not None:
                    parent.remove(candidate)
            changed += 1
        else:
            node.getparent().remove(node)
            for candidate in consumed:
                parent = candidate.getparent()
                if parent is not None:
                    parent.remove(candidate)
        children = list(prose)
        i += 1
    return changed


def wrap_final_cta(prose) -> int:
    children = list(prose)
    label_index = None
    for i, node in enumerate(children):
        if normalise(t(node)) in {"end cta", "final cta"}:
            label_index = i
    if label_index is None:
        return 0
    label = children[label_index]
    section = html.fragment_fromstring('<section class="inner-cta"></section>')
    parent = label.getparent()
    parent.insert(label_index, section)
    parent.remove(label)
    moved = 0
    while label_index + 1 < len(parent):
        candidate = parent[label_index + 1]
        cls = candidate.get("class") or ""
        if "medical-disclaimer" in cls or "notice" in cls:
            break
        section.append(candidate)
        moved += 1
    return 1 if moved else 0


def convert_faq_tail(prose) -> int:
    children = list(prose)
    if len(children) < 8:
        return 0
    start_search = max(0, int(len(children) * .48))
    questions = []
    for i, node in enumerate(children[start_search:], start_search):
        if not isinstance(node.tag, str) or node.tag.lower() not in {"h2", "h3"}:
            continue
        value = t(node)
        if value.endswith("?"):
            questions.append(i)
    if len(questions) < 4:
        return 0
    # Use the final consecutive question-answer sequence.
    first = questions[0]
    faq = etree.Element("section", {"class": "faq-pro-section"})
    kicker = etree.SubElement(faq, "span", {"class": "section-kicker"})
    kicker.text = "Common questions"
    h2 = etree.SubElement(faq, "h2")
    h2.text = "Frequently asked questions"
    listing = etree.SubElement(faq, "div", {"class": "faq-pro-list"})

    current_children = list(prose)
    cursor = first
    made = 0
    while cursor < len(current_children):
        qnode = current_children[cursor]
        if not isinstance(qnode.tag, str) or qnode.tag.lower() not in {"h2", "h3"} or not t(qnode).endswith("?"):
            break
        details = etree.SubElement(listing, "details")
        summary = etree.SubElement(details, "summary")
        summary.text = t(qnode)
        answer = etree.SubElement(details, "div", {"class": "faq-answer"})
        cursor += 1
        while cursor < len(current_children):
            candidate = current_children[cursor]
            if isinstance(candidate.tag, str) and candidate.tag.lower() in {"h2", "h3"}:
                break
            cls = candidate.get("class") or ""
            if "medical-disclaimer" in cls or "inner-cta" in cls:
                break
            answer.append(candidate)
            cursor += 1
        if len(answer) == 0:
            details.getparent().remove(details)
            break
        made += 1
        if cursor < len(current_children):
            candidate = current_children[cursor]
            if not (isinstance(candidate.tag, str) and candidate.tag.lower() in {"h2", "h3"} and t(candidate).endswith("?")):
                break
    if made < 4:
        return 0
    first_node = children[first]
    prose.insert(first, faq)
    # Remove question nodes still attached; answers were moved into faq.
    for node in children[first:]:
        if node.getparent() is prose and isinstance(node.tag, str) and node.tag.lower() in {"h2", "h3"} and t(node).endswith("?"):
            prose.remove(node)
    return made


def link_contacts(prose):
    for node in prose.xpath('.//p'):
        value = t(node)
        compact = re.sub(r'\D', '', value)
        if re.fullmatch(r'(?:91)?[6-9]\d{9}', compact):
            number = compact[-10:]
            node.clear()
            a = etree.SubElement(node, 'a', href=f'tel:+91{number}')
            a.text = value
        elif re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', value):
            node.clear()
            a = etree.SubElement(node, 'a', href=f'mailto:{value}')
            a.text = value



def remove_residual_editorial_markers(doc) -> int:
    """Remove public-facing template labels even when they sit outside article.prose."""
    removed = 0
    markers = {
        "body sections", "page body", "end cta", "final cta", "mid-page cta",
        "faq section", "suggested links", "suggested form fields", "buttons",
    }
    for main in doc.xpath('//main'):
        for node in list(main.xpath('.//p|.//h2|.//h3|.//h4|.//span|.//strong')):
            if normalise(t(node)) not in markers:
                continue
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
                removed += 1
    return removed


def clean_global_placeholders(doc, relative: Path) -> int:
    """Remove development-only placeholders outside article.prose as well."""
    changed = 0
    main_nodes = doc.xpath('//main')
    if not main_nodes:
        return changed
    main = main_nodes[0]

    # Replace an internal doctor-photo placeholder with the approved neutral illustration.
    for node in list(main.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), " photo-placeholder ")]')):
        replacement = html.fragment_fromstring(
            '<div class="doctor-visual"><img src="/assets/images/professional/doctor-care.svg" '
            'alt="Illustration representing dermatologist-led care" width="560" height="560"></div>'
        )
        node.getparent().replace(node, replacement)
        changed += 1

    phrases = (
        'approved doctor photo required',
        'use an original clinic image without ai face replacement',
        'content integration placeholder',
        'developer action required',
    )
    for node in list(main.xpath('.//span|.//strong|.//p|.//h2|.//h3|.//h4')):
        value = normalise(t(node))
        if not any(phrase in value for phrase in phrases):
            continue
        # A hero eyebrow should retain a useful patient-facing label.
        classes = set((node.get('class') or '').split())
        if 'eyebrow' in classes:
            node.text = 'Dermatologist-led care in Jammu'
        else:
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
        changed += 1
    return changed

def clean_inner_page(doc) -> dict[str, int]:
    stats = {"editorial": 0, "lists": 0, "related": 0, "faqs": 0, "ctas": 0}
    for prose in doc.xpath('//article[contains(concat(" ", normalize-space(@class), " "), " prose ")]'):
        # Remove stale generated TOCs; polish.js can create a clean one from the revised headings.
        for toc in list(prose.xpath('.//*[contains(concat(" ", normalize-space(@class), " "), " article-toc ")]')):
            toc.getparent().remove(toc)
        stats["ctas"] += wrap_final_cta(prose)
        stats["related"] += replace_related_links(prose)
        stats["ctas"] += convert_cta_nodes(prose)
        stats["editorial"] += remove_editorial_nodes(prose)
        stats["lists"] += convert_list_runs(prose)
        stats["faqs"] += convert_faq_tail(prose)
        link_contacts(prose)
        first_paragraph = prose.xpath('./p')
        if first_paragraph:
            classes = set((first_paragraph[0].get('class') or '').split())
            classes.add('page-intro')
            first_paragraph[0].set('class', ' '.join(sorted(classes)))
    return stats


def public_html_files():
    for path in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_PARTS for part in path.parts):
            continue
        yield path


def verify_public_links(doc, relative: Path) -> list[str]:
    errors = []
    for anchor in doc.xpath('//main//a[@href]'):
        href = anchor.get('href', '')
        if not href.startswith('/') or href.startswith('//'):
            continue
        path_part = href.split('#', 1)[0].split('?', 1)[0]
        if not path_part:
            continue
        target = ROOT / path_part.lstrip('/')
        if path_part.endswith('/'):
            target = target / 'index.html'
        if target.is_dir():
            target = target / 'index.html'
        if not target.exists():
            errors.append(f'{relative.as_posix()}: missing target {href}')
    return errors


def main() -> int:
    stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup_root = BACKUPS / f'final-content-qc-{stamp}'
    parser = html.HTMLParser(encoding='utf-8', recover=True)
    changed = []
    errors = []
    totals = {"editorial": 0, "lists": 0, "related": 0, "faqs": 0, "ctas": 0, "placeholders": 0, "residual": 0}

    replacements = {
        'conditions/index.html': conditions_main(),
        'treatments/index.html': treatments_main(),
        'blog/index.html': blog_main(),
        'about/index.html': about_main(),
    }

    for path in sorted(public_html_files()):
        relative = path.relative_to(ROOT)
        try:
            before = path.read_text(encoding='utf-8', errors='ignore')
            doc = html.document_fromstring(before, parser=parser)
            ensure_css(doc)
            key = relative.as_posix()
            if key in replacements:
                replace_main(doc, replacements[key])
            elif key == 'index.html':
                # Homepage already has a curated main; stylesheet handles its remaining contrast QC.
                pass
            elif 'post-template' not in relative.parts:
                stats = clean_inner_page(doc)
                for name, count in stats.items():
                    totals[name] += count
            totals['placeholders'] += clean_global_placeholders(doc, relative)
            totals['residual'] += remove_residual_editorial_markers(doc)
            rebuild_breadcrumb(doc, relative)
            errors.extend(verify_public_links(doc, relative))
            after = '<!DOCTYPE html>\n' + html.tostring(doc, encoding='unicode', method='html', pretty_print=False)
            if after == before:
                continue
            backup = backup_root / relative
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, backup)
            path.write_text(after, encoding='utf-8')
            changed.append(key)
        except Exception as exc:
            errors.append(f'{relative.as_posix()}: {exc}')

    REPORTS.mkdir(exist_ok=True)
    report = REPORTS / f'final-content-qc-{stamp}.txt'
    banned_hits = []
    banned_pattern = re.compile(r'\b(BODY SECTIONS|Page body|END CTA|FINAL CTA|MID-PAGE CTA|FAQ SECTION|Suggested links|Suggested form fields|New posts can be added from|A placeholder for the first|Use the keyword map|raw SEO copy|template instructions|development notes)\b', re.I)
    for path in sorted(public_html_files()):
        if 'post-template' in path.parts:
            continue
        text = path.read_text(encoding='utf-8', errors='ignore')
        doc = html.document_fromstring(text, parser=parser)
        main_nodes = doc.xpath('//main')
        visible = t(main_nodes[0]) if main_nodes else ''
        match = banned_pattern.search(visible)
        if match:
            banned_hits.append(f'{path.relative_to(ROOT).as_posix()}: {match.group(0)}')
    errors.extend(banned_hits)

    report.write_text('\n'.join([
        'Aastha Final Content QC and Link Fix v19',
        f'Changed HTML files: {len(changed)}',
        f'Editorial elements removed: {totals["editorial"]}',
        f'Raw list runs converted: {totals["lists"]}',
        f'Related-link groups created: {totals["related"]}',
        f'FAQ items converted: {totals["faqs"]}',
        f'CTA groups converted: {totals["ctas"]}',
        f'Development placeholders removed: {totals["placeholders"]}',
        f'Residual template labels removed: {totals["residual"]}',
        f'Errors: {len(errors)}',
        '', 'CHANGED:', *changed,
        '', 'ERRORS:', *(errors or ['None']),
    ]), encoding='utf-8')

    print(f'Changed HTML files: {len(changed)}')
    print(f'Editorial elements removed: {totals["editorial"]}')
    print(f'Raw list runs converted: {totals["lists"]}')
    print(f'Related-link groups created: {totals["related"]}')
    print(f'FAQ items converted: {totals["faqs"]}')
    print(f'CTA groups converted: {totals["ctas"]}')
    print(f'Development placeholders removed: {totals["placeholders"]}')
    print(f'Residual template labels removed: {totals["residual"]}')
    print(f'Errors: {len(errors)}')
    print(f'Report: {report}')
    if errors:
        for error in errors[:20]:
            print(' -', error)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
