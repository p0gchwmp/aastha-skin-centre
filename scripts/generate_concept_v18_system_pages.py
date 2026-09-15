#!/usr/bin/env python3
"""Generate preview-only Journal, Media, Admin and utility pages for the editorial concept."""
from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
CONCEPT = ROOT / "concept"

NAV = '''<header class="concept-nav"><div class="concept-shell"><a class="brand-mark" href="/concept/">AASTHA <span>Skin Centre · Jammu</span></a><nav class="concept-links" aria-label="Primary navigation"><a href="/concept/conditions/">Concerns</a><a href="/concept/treatments/">Treatments</a><a href="/concept/dr-cheena-langer/">Doctor</a><a href="/concept/locations/">Clinics</a><a href="/concept/blog/">Journal</a><a href="/concept/media/">Media</a></nav><a class="nav-cta" href="/concept/book-appointment/">Book consultation</a></div></header>'''

FOOT = '''<footer class="concept-footer"><div class="concept-shell"><div class="v18-secondary-links"><a href="/concept/blog/">Skin journal</a><a href="/concept/media/">Media & updates</a><a href="/concept/contact/">Contact</a><a href="/concept/privacy-policy/">Privacy</a></div><p class="footer-word">AASTHA.</p></div></footer>'''


def write(slug: str, html: str):
    target = CONCEPT / slug / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8")


def shell(title: str, body: str, body_class: str = "concept-page") -> str:
    return f'''<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{escape(title)} — Aastha Editorial Concept</title><link rel="stylesheet" href="/assets/css/editorial-concept-v1.css"></head><body class="{body_class}">{NAV}<div class="scroll-progress"></div><main>{body}</main>{FOOT}<script src="/assets/js/editorial-concept-v1.js" defer></script></body></html>'''


def hero(kicker: str, title: str, copy: str, art: str = "hero-care.svg", actions: str = "") -> str:
    return f'''<section class="editorial-hero"><div class="concept-shell hero-grid"><div><span class="kicker">{kicker}</span><h1 class="hero-title">{title}</h1><p class="hero-copy">{copy}</p>{actions}</div><figure class="hero-art"><img src="/assets/images/professional/{art}" alt="" aria-hidden="true"><figcaption class="art-label">Aastha Skin Centre · Jammu</figcaption></figure></div></section>'''


def section(no: str, heading: str, copy: str, content: str = "") -> str:
    return f'''<section class="editorial-section"><div class="concept-shell"><div class="section-head"><div><span class="section-no">{no}</span></div><div><h2 class="display-heading">{heading}</h2><p class="section-copy">{copy}</p></div></div>{content}</div></section>'''


def rx(pattern: str, text: str, default: str = "") -> str:
    m = re.search(pattern, text, re.I | re.S)
    return m.group(1).strip() if m else default


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def generate_blog():
    source_root = ROOT / "blog"
    articles = []
    for folder in sorted(source_root.iterdir() if source_root.exists() else []):
        source = folder / "index.html"
        if not folder.is_dir() or folder.name == "post-template" or not source.exists():
            continue
        raw = source.read_text(encoding="utf-8")
        h1 = clean_text(rx(r"<h1>(.*?)</h1>", raw, folder.name.replace('-', ' ').title()))
        lead = clean_text(rx(r'<p class="lead">(.*?)</p>', raw, "Dermatology patient guide."))
        eyebrow = clean_text(rx(r'<span class="eyebrow">(.*?)</span>', raw, "Patient guide"))
        meta = clean_text(rx(r'<p class="blog-meta">(.*?)</p>', raw, ""))
        article = rx(r'<article class="prose article-stack">(.*?)</article>', raw, "")
        if not article:
            continue
        articles.append((folder.name, h1, lead, eyebrow, meta, article))

    cards = []
    for i, (slug, h1, lead, eyebrow, _meta, _article) in enumerate(articles):
        category = eyebrow.split('·')[0].strip()
        cards.append(f'''<a class="v18-journal-card" href="/concept/blog/{slug}/"><div><small>{escape(category)}</small><h2>{escape(h1)}</h2><p>{escape(lead)}</p></div><strong>Read guide →</strong></a>''')
    hub = hero("Skin journal · Patient education", "Clear information, <em>before</em> the appointment.", "Focused dermatologist-reviewed guides that explain common skin signs, what they can mean and when individual assessment matters.", "acne-care.svg", '<div class="hero-actions"><a class="btn" href="#articles">Browse articles ↓</a><a class="btn alt" href="/concept/book-appointment/">Book consultation</a></div>')
    hub += section("01 / Journal", "Read by the exact concern.", "Search the current patient-guide library. These articles provide general information and do not replace an individual diagnosis.", f'''<div class="v18-journal-toolbar"><input data-v18-journal-search class="v18-journal-search" type="search" placeholder="Search the journal…" aria-label="Search the journal"><span>{len(articles)} guides</span></div><div class="v18-journal-grid" id="articles">{''.join(cards)}</div>''')
    hub += section("02 / Connected care", "Articles should lead somewhere useful.", "Each guide links into the relevant concern or treatment pathway so reading never becomes a dead end.", '<div class="v3-reading-grid"><article class="v3-reading-card"><h3>Acne & scars</h3><p>Move from a symptom guide into the full acne and scar pathways.</p><a href="/concept/acne-treatment/">Explore acne →</a></article><article class="v3-reading-card"><h3>Concern directory</h3><p>Not sure of the label? Start from what you notice.</p><a href="/concept/conditions/">Browse concerns →</a></article><article class="v3-reading-card"><h3>Need an assessment?</h3><p>Request a dermatologist consultation at either Jammu clinic.</p><a href="/concept/book-appointment/">Book consultation →</a></article></div>')
    write("blog", shell("Skin Journal", hub))

    for slug, h1, lead, eyebrow, meta, article in articles:
        body = hero(escape(eyebrow), escape(h1), escape(lead), "acne-care.svg", '<div class="hero-actions"><a class="btn" href="/concept/acne-treatment/">Related acne care</a><a class="btn alt" href="/concept/blog/">Back to journal</a></div>')
        body += f'''<section class="editorial-section"><div class="concept-shell v18-blog-layout"><article class="v18-blog-article">{article}</article><aside class="v18-blog-side"><small>Patient guide</small><h3>{escape(meta or 'Dermatology information')}</h3><p>This guide is educational and does not replace an individual diagnosis or treatment plan.</p><a class="btn" href="/concept/book-appointment/">Book consultation</a><a class="btn alt" href="/concept/blog/">More articles</a></aside></div></section>'''
        write(f"blog/{slug}", shell(h1, body))
    return len(articles) + 1


def generate_media():
    body = hero("Media & updates · Aastha", "Clinical work, <em>shared responsibly.</em>", "A home for academic activity, conference participation, patient-education videos, clinic stories and verified press or media features.", "doctor-care.svg", '<div class="hero-actions"><a class="btn" href="#media-library">Explore media ↓</a><a class="btn alt" href="/concept/dr-cheena-langer/">Doctor profile</a></div>')
    cards = '''<div class="v18-media-grid" id="media-library">
      <article class="v18-media-card wide"><div><small>Academic & conference</small><h3>Faculty, talks and professional activity.</h3><p>Conference participation, academic presentations and professional updates can live here once the exact event details and approved photographs are entered through the CMS.</p></div><div class="v18-media-empty">No unverified event cards are being invented for the preview. Admin is ready for dated, sourced entries.</div></article>
      <article class="v18-media-card"><div><small>Video library</small><h3>Patient education.</h3><p>Short dermatologist-led explainers, procedure education and clinic videos, grouped by topic rather than social platform.</p></div><a href="/concept/blog/">Pair videos with patient guides →</a></article>
      <article class="v18-media-card"><div><small>Clinic gallery</small><h3>Real spaces. Real team.</h3><p>Approved photographs from Karan Nagar and Paloura can replace abstract visual plates once uploaded.</p></div><a href="/concept/locations/">Explore clinics →</a></article>
      <article class="v18-media-card"><div><small>Press & features</small><h3>Verified mentions only.</h3><p>Articles, interviews or external features should include the publication, date and source link.</p></div><div class="v18-media-empty">Empty until a verified source is added.</div></article>
      <article class="v18-media-card"><div><small>Media kit</small><h3>Approved clinic facts.</h3><p>Doctor bio, clinic name, addresses, contact details, logo guidance and approved photographs can be managed centrally.</p></div><a href="/concept/contact/">Clinic contact information →</a></article>
    </div>'''
    body += section("01 / Media library", "One source of truth for public-facing media.", "The public media area only shows approved assets. Drafts and uploads belong in the admin workspace.", cards)
    body += section("02 / Editorial rule", "Evidence before promotion.", "Conference, press and procedure content should be dated, attributable and linked to a real source. Patient photography should only appear when consent and usage approval are recorded.", '<div class="v3-reading-grid"><article class="v3-reading-card"><h3>Doctor profile</h3><p>Qualifications, academic activity and professional context.</p><a href="/concept/dr-cheena-langer/">View profile →</a></article><article class="v3-reading-card"><h3>Skin journal</h3><p>Longer educational context around common patient questions.</p><a href="/concept/blog/">Read journal →</a></article><article class="v3-reading-card"><h3>Two clinics</h3><p>Public location and access information.</p><a href="/concept/locations/">View clinics →</a></article></div>')
    write("media", shell("Media & Updates", body))
    return 1


def admin_nav(current: str) -> str:
    links = [("dashboard","Dashboard","/concept/admin/"),("pages","Pages & content","/concept/admin/pages/"),("blog","Blog","/concept/admin/blog/"),("media","Media library","/concept/admin/media/"),("settings","Global settings","/concept/admin/settings/")]
    return '<aside class="v18-admin-nav"><small>Aastha CMS preview</small>' + ''.join(f'<a href="{href}" {"aria-current=\"page\"" if key==current else ""}>{label}</a>' for key,label,href in links) + '</aside>'


def admin_shell(current: str, title: str, intro: str, content: str) -> str:
    admin_header = '''<header class="concept-nav"><div class="concept-shell"><a class="brand-mark" href="/concept/admin/">AASTHA <span>Website Admin · Preview</span></a><nav class="concept-links"><a href="/concept/">View website</a><a href="/concept/blog/">Journal</a><a href="/concept/media/">Media</a></nav><a class="nav-cta" href="/concept/">Exit admin</a></div></header>'''
    page = f'''<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{escape(title)} — Aastha Admin Preview</title><link rel="stylesheet" href="/assets/css/editorial-concept-v1.css"></head><body class="concept-page concept-admin">{admin_header}<div class="v18-admin-shell">{admin_nav(current)}<main class="v18-admin-main"><span class="v18-admin-kicker">Design preview · maps to Wagtail</span><h1 class="v18-admin-title">{title}</h1><p class="v18-admin-intro">{intro}</p>{content}</main></div></body></html>'''
    write("admin" if current == "dashboard" else f"admin/{current}", page)


def generate_admin():
    dashboard = '''<div class="v18-admin-stats"><div class="v18-admin-stat"><strong>Pages</strong><span>Public website content</span></div><div class="v18-admin-stat"><strong>Blog</strong><span>Patient guides</span></div><div class="v18-admin-stat"><strong>Media</strong><span>Images, video & press</span></div><div class="v18-admin-stat"><strong>Global</strong><span>Clinic facts & branding</span></div></div><div class="v18-admin-grid"><article class="v18-admin-card wide"><h3>Edit without touching layout code</h3><p>Choose an existing page, update text or approved media, preview the result and publish through the CMS workflow. Premium spacing, colours and components remain controlled by the site design system.</p><a href="/concept/admin/pages/">Open page manager →</a></article><article class="v18-admin-card"><h3>Upload approved media</h3><p>Manage real doctor, clinic, procedure and consented before/after assets.</p><a href="/concept/admin/media/">Open media →</a></article><article class="v18-admin-card"><h3>Publish patient guides</h3><p>Create, review and schedule blog posts with author/reviewer metadata.</p><a href="/concept/admin/blog/">Open blog →</a></article><article class="v18-admin-card"><h3>Global clinic facts</h3><p>Fees, phones, addresses and repeated brand information belong in one settings area.</p><a href="/concept/admin/settings/">Open settings →</a></article></div>'''
    admin_shell("dashboard","Website control centre","This preview mirrors the real Wagtail responsibilities already present in the production CMS: page editing, images, blog content, reusable sections, doctor/clinic data and global settings.",dashboard)

    pages = '''<div class="v18-admin-actions"><a class="v18-admin-button" href="#">Add page</a><a class="v18-admin-button alt" href="#">Preview site</a></div><table class="v18-admin-table"><thead><tr><th>Page</th><th>Type</th><th>State</th><th>Primary action</th></tr></thead><tbody><tr><td>Homepage</td><td>Landing page</td><td><span class="v18-admin-status live">Design mapped</span></td><td>Edit hero, sections, navigation</td></tr><tr><td>Acne treatment</td><td>Treatment</td><td><span class="v18-admin-status live">Design mapped</span></td><td>Edit clinical content + page media</td></tr><tr><td>Dr. Cheena Langer</td><td>Doctor profile</td><td><span class="v18-admin-status live">Design mapped</span></td><td>Edit profile + approved photograph</td></tr><tr><td>Karan Nagar / Paloura</td><td>Clinic locations</td><td><span class="v18-admin-status live">Design mapped</span></td><td>Edit timings, address, maps</td></tr></tbody></table>'''
    admin_shell("pages","Pages & content","One place to manage headings, explanatory copy, CTAs, FAQs, page-specific media and reusable sections without changing the visual system.",pages)

    blog = '''<div class="v18-admin-actions"><a class="v18-admin-button" href="#">New article</a><a class="v18-admin-button alt" href="/concept/blog/">View journal</a></div><div class="v18-admin-grid"><article class="v18-admin-card wide"><h3>Article editor</h3><p>Title, summary, published date, author, medical reviewer, hero media, article sections, FAQs, references, related treatment pages and SEO fields.</p></article><article class="v18-admin-card"><h3>Review workflow</h3><p>Draft → clinical review → approved → scheduled/published. Medical-review status should never be hidden from the editorial team.</p></article></div><table class="v18-admin-table"><thead><tr><th>Guide</th><th>Category</th><th>Public route</th></tr></thead><tbody><tr><td>Blackheads</td><td>Acne basics</td><td>/concept/blog/blackheads/</td></tr><tr><td>Whiteheads</td><td>Acne basics</td><td>/concept/blog/whiteheads/</td></tr><tr><td>Deep cystic acne</td><td>Deep acne</td><td>/concept/blog/cystic-acne/</td></tr></tbody></table>'''
    admin_shell("blog","Blog editor","The public journal is driven by structured BlogPage content, with review metadata and links back to clinical care pages.",blog)

    media = '''<div class="v18-admin-actions"><a class="v18-admin-button" href="#">Upload media</a><a class="v18-admin-button alt" href="/concept/media/">View media page</a></div><div class="v18-admin-grid"><article class="v18-admin-card"><h3>Doctor & team</h3><p>Approved profile photographs and staff imagery.</p></article><article class="v18-admin-card"><h3>Clinics</h3><p>Karan Nagar and Paloura interiors, exterior, signage and facilities.</p></article><article class="v18-admin-card"><h3>Procedures & devices</h3><p>Real equipment and procedure photography with accurate captions.</p></article><article class="v18-admin-card"><h3>Before / after</h3><p>Only consented pairs, with treatment, interval and disclosure metadata.</p></article><article class="v18-admin-card"><h3>Conference & press</h3><p>Event images, source links, dates and captions.</p></article><article class="v18-admin-card"><h3>Video</h3><p>Patient education, clinic explainers and approved embeds.</p></article></div>'''
    admin_shell("media","Media library","The placeholder problem is solved permanently when real assets are managed as structured, approved media instead of being hard-coded into templates.",media)

    settings = '''<div class="v18-admin-grid"><article class="v18-admin-card wide"><h3>Clinic-wide facts</h3><p>Consultation fee, follow-up rule, phone/WhatsApp numbers, email, clinic addresses, doctor timings, reception timings and map destinations should update site-wide from one source.</p></article><article class="v18-admin-card"><h3>Brand</h3><p>Clinic name, logo, palette default and social profile links.</p></article><article class="v18-admin-card"><h3>SEO defaults</h3><p>Organisation schema, default OG media, title patterns and canonical host.</p></article><article class="v18-admin-card"><h3>Safety</h3><p>Medical disclaimer, consent requirements and approved claims.</p></article></div>'''
    admin_shell("settings","Global settings","Repeated facts should never be manually copied across dozens of pages. This section represents the existing Wagtail SiteSettings/snippet model that will drive them centrally.",settings)
    return 5


def simple_page(slug: str, title: str, kicker: str, hero_title: str, intro: str, sections):
    body = hero(kicker, hero_title, intro, "hero-care.svg", '<div class="hero-actions"><a class="btn" href="/concept/book-appointment/">Book consultation</a><a class="btn alt" href="/concept/contact/">Contact clinic</a></div>')
    content = '<div class="v18-prose">' + ''.join(f'<section><h2>{h}</h2>{c}</section>' for h,c in sections) + '</div>'
    body += section("01 / Information", title, intro, content)
    write(slug, shell(title, body))


def generate_utilities():
    simple_page("about","About Aastha","Aastha Skin & Dermato-Cosmetic Centre · Jammu","Dermatology built around <em>clear clinical decisions.</em>","Aastha Skin & Dermato-Cosmetic Centre provides dermatologist-led skin, hair, laser, aesthetic and selected procedural care across two Jammu clinics.",[("Dr. Cheena Langer","<p>Dr. Cheena Langer is MBBS, MD Dermatology qualified, with more than 20 years in medicine. Her clinical work spans medical dermatology, acne and scars, pigmentation, hair and scalp concerns, lasers and selected aesthetic procedures.</p><p><a href='/concept/dr-cheena-langer/'>Explore the doctor profile →</a></p>"),("Two clinics in Jammu","<p>Consultations are available at Karan Nagar and Paloura. Each location page carries current public timings, directions and contact information.</p><p><a href='/concept/locations/'>Explore clinic locations →</a></p>"),("The care model","<p>History and examination come before treatment selection. Options, limitations, aftercare and expected timelines are explained before a plan is chosen.</p>")])
    simple_page("medical-disclaimer","Medical Disclaimer","Important information","Medical information has <em>limits.</em>","Website content is educational and cannot replace an individual consultation.",[("Medical disclaimer","<p>Results may vary from person to person. This content is for informational purposes only and does not substitute a consultation with a qualified medical professional. Dr. Cheena Langer, MD is a registered medical practitioner.</p>"),("Emergencies","<p>This website is not an emergency service. Seek urgent medical care for severe breathing difficulty, rapidly worsening illness or another medical emergency.</p>")])
    simple_page("privacy-policy","Privacy Policy","Website information","How website information is <em>handled.</em>","A clear public-facing summary of website privacy and contact-form handling.",[("Information you submit","<p>Contact or appointment forms may collect the details you choose to provide so the clinic can respond to your request.</p>"),("Clinical information","<p>Do not use a public website form as a substitute for emergency medical care. Sensitive clinical information should be shared through the clinic's appropriate consultation channels.</p>"),("Questions","<p>For privacy questions, contact the clinic using the published contact details.</p>")])
    simple_page("terms-and-conditions","Terms & Conditions","Website terms","Use the website as <em>information, not diagnosis.</em>","These terms describe the role of the public website and its educational content.",[("Website content","<p>Information is provided for general education and may change as clinical guidance, services or clinic information are updated.</p>"),("Appointments","<p>An online request is not a confirmed appointment until the clinic confirms the date, time and location.</p>"),("External links","<p>Links to external websites are provided for context or navigation. External sites operate under their own terms and privacy practices.</p>")])
    simple_page("appointment-request-received","Appointment Request Received","Appointment request","Your request is <em>with the clinic.</em>","The clinic can confirm the appointment time, branch and any preparation instructions directly with you.",[("What happens next","<p>Keep your phone available for confirmation. If your request is time-sensitive, you can also call or WhatsApp the clinic.</p>"),("Need to change something?","<p><a href='/concept/contact/'>Open clinic contact options →</a></p>")])
    return 5


def main():
    total = generate_blog() + generate_media() + generate_admin() + generate_utilities()
    print(f"Generated {total} v18 system pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
