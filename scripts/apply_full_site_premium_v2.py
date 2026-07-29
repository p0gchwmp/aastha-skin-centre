#!/usr/bin/env python3
from __future__ import annotations
import re, shutil, json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from lxml import html, etree

ROOT = Path(__file__).resolve().parents[1]
BACKUPS = ROOT / 'backups'
REPORTS = ROOT / 'reports'
CSS = '/assets/css/premium-site-v2.css'
JS = '/assets/js/premium-site-v2.js'
EXCLUDE = {'.git','.venv','dist','backups','reports','content-drop','schema-drop','deployment','_legacy-tools','_project-docs'}

PAGE_MAP = {
'acne':'/treatments/acne-treatment/','teenage acne':'/treatments/acne-treatment/','adult acne':'/treatments/acne-treatment/','hormonal acne':'/treatments/acne-treatment/','hormonal-pattern acne':'/treatments/acne-treatment/','blackheads':'/treatments/acne-treatment/','whiteheads':'/treatments/acne-treatment/','acne scars':'/treatments/acne-scar-treatment/','acne scar treatment':'/treatments/acne-scar-treatment/','acne marks':'/treatments/pigmentation-treatment/',
'pigmentation':'/treatments/pigmentation-treatment/','melasma':'/treatments/melasma-treatment/','freckles':'/treatments/freckles-treatment/','dark lips':'/treatments/dark-lips-treatment/','dark circles':'/treatments/dark-circles-under-eye-treatment/','under-eye dark circles':'/treatments/dark-circles-under-eye-treatment/','black neck':'/treatments/black-neck-acanthosis-nigricans-treatment/','dark neck':'/treatments/black-neck-acanthosis-nigricans-treatment/','vitiligo':'/treatments/vitiligo-treatment/','sun damage':'/treatments/sun-damage-treatment/',
'hair fall':'/treatments/hair-fall-treatment/','hair thinning':'/treatments/hair-fall-treatment/','male pattern hair loss':'/treatments/hair-fall-treatment/','female pattern hair loss':'/treatments/hair-fall-treatment/','alopecia areata':'/treatments/alopecia-areata-treatment/','dandruff':'/treatments/seborrheic-dermatitis-dandruff/','prp':'/treatments/prp-gfc-hair-treatment/','gfc':'/treatments/prp-gfc-hair-treatment/','hair transplant':'/treatments/hair-transplant/','laser hair reduction':'/treatments/laser-hair-reduction/',
'eczema':'/treatments/eczema-atopic-dermatitis-treatment/','atopic dermatitis':'/treatments/eczema-atopic-dermatitis-treatment/','contact dermatitis':'/treatments/contact-dermatitis-treatment/','skin allergy':'/treatments/skin-allergy-treatment/','urticaria':'/treatments/urticaria-hives-treatment/','hives':'/treatments/urticaria-hives-treatment/','psoriasis':'/treatments/psoriasis-treatment/','rosacea':'/treatments/rosacea-treatment/','lichen planus':'/treatments/lichen-planus-treatment/','fungal infection':'/treatments/fungal-infection-treatment/','ringworm':'/treatments/fungal-infection-treatment/','jock itch':'/treatments/fungal-infection-treatment/','athlete’s foot':'/treatments/fungal-infection-treatment/','athlete\'s foot':'/treatments/fungal-infection-treatment/','scabies':'/treatments/scabies-treatment/','molluscum':'/treatments/molluscum-contagiosum-treatment/',
'chemical peels':'/treatments/chemical-peels/','mnrf':'/treatments/mnrf-treatment/','fractional co2 laser':'/treatments/fractional-co2-laser/','fractional co₂ laser':'/treatments/fractional-co2-laser/','q-switched laser':'/treatments/q-switched-laser-toning/','laser toning':'/treatments/q-switched-laser-toning/','ipl photofacial':'/treatments/ipl-photofacial/','tattoo removal':'/treatments/laser-tattoo-removal/','hifu':'/treatments/hifu-treatment/','rf skin tightening':'/treatments/rf-skin-tightening/','hydrafacial':'/treatments/hydrafacial-medifacial/',
'warts':'/treatments/wart-mole-skin-tag-removal/','moles':'/treatments/wart-mole-skin-tag-removal/','skin tags':'/treatments/wart-mole-skin-tag-removal/','dpn':'/treatments/dpn-seborrheic-keratosis-removal/','seborrhoeic keratosis':'/treatments/dpn-seborrheic-keratosis-removal/','sebaceous cysts':'/treatments/cyst-lipoma-removal/','lipoma':'/treatments/cyst-lipoma-removal/','xanthelasma':'/treatments/xanthelasma-removal/','corns':'/treatments/corn-removal-treatment/','ingrown toenail':'/treatments/ingrown-toenail-nail-surgery/','skin biopsy':'/treatments/skin-biopsy/','skin cancer screening':'/treatments/skin-cancer-screening/','paediatric dermatology':'/treatments/paediatric-dermatology/'
}
EDITORIAL = re.compile(r'^(?:body sections?|page body|end cta|final cta|mid-page cta|faq section|schema block|suggested internal links?|suggested links?|recommended buttons?|main action buttons?|success-page buttons?|contact-page introduction|contact-form success message|placeholder:?|validation:?|required|optional|article library)$', re.I)
DEV_PHRASES = re.compile(r'(reusable template|keyword map|future article|placeholder for|content-ready template|ready to be inserted|development status|build and medical qa pending|suggested internal link:)', re.I)


def text(node): return ' '.join(''.join(node.itertext()).split()) if node is not None else ''
def norm(s): return re.sub(r'[^a-z0-9]+',' ',s.lower()).strip()
def slug(s):
    v=re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
    return v[:70] or 'section'

def public_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE for part in p.parts): continue
        if p.name == 'blog.html': continue
        yield p

def ensure_assets(doc):
    head=doc.find('.//head')
    if head is None: return
    if not doc.xpath(f'//link[@href="{CSS}"]'):
        head.append(html.fromstring(f'<link rel="stylesheet" href="{CSS}">'))
    body=doc.find('.//body')
    if body is not None and not doc.xpath(f'//script[@src="{JS}"]'):
        body.append(html.fromstring(f'<script src="{JS}" defer></script>'))

def remove_editorial(doc):
    removed=0
    for node in list(doc.xpath('//main//*[self::h1 or self::h2 or self::h3 or self::h4 or self::p or self::li or self::strong]')):
        val=text(node).strip()
        if EDITORIAL.match(val) or DEV_PHRASES.search(val):
            parent=node.getparent()
            if parent is not None:
                parent.remove(node); removed+=1
    return removed

def linkify_li(li):
    if li.xpath('.//a'): return False
    val=text(li).strip(); key=norm(val)
    target=None
    for label,href in sorted(PAGE_MAP.items(), key=lambda x:len(x[0]), reverse=True):
        if key == norm(label) or key.startswith(norm(label)+' '): target=href; break
    if not target: return False
    li.clear(); a=etree.Element('a',href=target); a.text=val; li.append(a); return True

def is_list_item(node):
    if node.tag != 'p': return False
    v=text(node).strip()
    if not v or len(v)>86: return False
    if re.search(r'[.!?]$',v): return False
    if re.search(r'₹|\b\d{6,}\b|@|https?://|Monday|Sunday|Address|Landline|Call or WhatsApp',v,re.I): return False
    if v.lower() in {'yes','no','call','email','message'}: return False
    return True

def convert_raw_lists(prose):
    count=0; i=0
    while i < len(prose):
        children=list(prose)
        if i>=len(children): break
        if not is_list_item(children[i]): i+=1; continue
        run=[]; j=i
        while j<len(children) and is_list_item(children[j]): run.append(children[j]); j+=1
        if len(run)>=3:
            ul=etree.Element('ul'); ul.set('class','premium-bullet-grid')
            prose.insert(prose.index(run[0]),ul)
            for p in run:
                li=etree.Element('li')
                for child in list(p): p.remove(child); li.append(child)
                li.text=(p.text or '')
                ul.append(li); prose.remove(p)
                linkify_li(li)
            count+=len(run); i=prose.index(ul)+1
        else: i=j
    return count

def normalise_lists(prose):
    linked=0
    for ul in prose.xpath('.//ul|.//ol'):
        classes=(ul.get('class') or '').split()
        if not any(c in classes for c in ['premium-bullet-grid','related-link-grid','faq-pro-list']):
            ul.set('class',' '.join(classes+['premium-bullet-grid']))
        for li in ul.xpath('./li'): linked += int(linkify_li(li))
    return linked

def wrap_sections(prose):
    children=list(prose); sections=[]; current=None
    for node in children:
        if node.tag=='h2':
            current=etree.Element('section'); current.set('class','premium-content-section')
            prose.insert(prose.index(node),current); prose.remove(node); current.append(node); sections.append(current)
        elif current is not None and node.getparent() is prose:
            prose.remove(node); current.append(node)
    return sections

def collapse_long_sections(prose, sections):
    if len(sections) <= 9: return 0
    keep_words=re.compile(r'(what is|how is|when should|treatment|cost|frequently asked|where .*available|consult|diagnos|medical disclaimer)',re.I)
    collapsed=0
    for idx,section in enumerate(list(sections)):
        h=section.find('./h2'); title=text(h)
        if idx<5 or keep_words.search(title): continue
        details=etree.Element('details'); details.set('class','premium-content-details')
        summary=etree.Element('summary'); summary.text=title
        body=etree.Element('div'); body.set('class','premium-details-body')
        for child in list(section):
            section.remove(child)
            if child is not h: body.append(child)
        details.append(summary); details.append(body)
        parent=section.getparent(); pos=parent.index(section); parent.remove(section); parent.insert(pos,details); collapsed+=1
    return collapsed

def sidebar_markup():
    return html.fromstring('''<aside class="premium-sidebar-card"><span class="eyebrow">Consultation</span><h2>Book with Dr. Cheena Langer</h2><p>Choose Karan Nagar or Paloura Chowk for a dermatologist-led assessment.</p><div class="premium-side-meta"><span><strong>Fee:</strong> ₹500</span><span><strong>Follow-up:</strong> one visit within 10 days</span><span><strong>Call/WhatsApp:</strong> 7006613362</span></div><a class="button" href="/book-appointment/">Request Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp the Clinic</a></aside>''')

def add_summary_strip(main):
    if main.xpath('.//section[contains(@class,"premium-summary-strip")]'): return
    hero=main.xpath('./section[contains(@class,"page-hero")]')
    if not hero: return
    strip=html.fromstring('''<section class="premium-summary-strip"><div class="container"><div class="premium-summary-grid"><div class="premium-summary-item"><strong>Dermatologist-led</strong><span>Diagnosis before treatment selection</span></div><div class="premium-summary-item"><strong>Two Jammu clinics</strong><span>Karan Nagar and Paloura Chowk</span></div><div class="premium-summary-item"><strong>Clear treatment planning</strong><span>Options, limitations and aftercare explained</span></div></div></div></section>''')
    main.insert(main.index(hero[0])+1,strip)

def clean_inner(doc, rel):
    main=doc.xpath('//main')[0] if doc.xpath('//main') else None
    if main is None:return {}
    add_summary_strip(main)
    layout=doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," content-layout ")]')
    if not layout:return {}
    layout=layout[0]
    prose_nodes=layout.xpath('./article[contains(concat(" ",normalize-space(@class)," ")," prose ")]')
    if not prose_nodes:return {}
    prose=prose_nodes[0]
    # remove old/duplicate sidebar(s)
    for aside in layout.xpath('./aside'): layout.remove(aside)
    layout.append(sidebar_markup())
    raw=convert_raw_lists(prose); linked=normalise_lists(prose)
    sections=wrap_sections(prose); collapsed=collapse_long_sections(prose,sections)
    # add classes and compact location links
    for h in prose.xpath('.//h2|.//h3'):
        if not h.get('id'): h.set('id',slug(text(h)))
    return {'raw':raw,'linked':linked,'sections':len(sections),'collapsed':collapsed}

def hero(title,lead,img):
    return f'''<section class="page-hero page-hero--professional"><div class="container"><div class="page-hero-copy"><nav><a href="/">Home</a> / <span aria-current="page">{title}</span></nav><span class="eyebrow">Dermatologist-led care in Jammu</span><h1>{title}</h1><p class="lead">{lead}</p><div class="hero-actions"><a class="button" href="/book-appointment/">Book an Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp the Clinic</a></div></div><div class="page-hero-art"><img src="{img}" alt="" width="640" height="420"></div></div></section>'''

def rebuild_blog(doc):
    cards=[
      ('Acne','Acne treatment: when breakouts need medical care','Active acne, painful cysts, marks and scar prevention.','/treatments/acne-treatment/','/assets/images/professional/acne-care.svg'),
      ('Pigmentation','Why pigmentation needs the right diagnosis','Melasma, post-acne marks and sun spots do not share one universal treatment.','/treatments/pigmentation-treatment/','/assets/images/professional/laser-care.svg'),
      ('Hair','Hair fall: diagnosis before procedures','Understand shedding, thinning, pattern hair loss and scalp causes.','/treatments/hair-fall-treatment/','/assets/images/professional/hair-care.svg'),
      ('Infections','Why fungal infection may keep returning','Incomplete treatment, family spread and steroid-mixed creams can contribute.','/treatments/fungal-infection-treatment/','/assets/images/professional/medical-care.svg'),
      ('Laser','What to know before laser hair reduction','Assessment, planned sessions, skin type and hair characteristics.','/treatments/laser-hair-reduction/','/assets/images/professional/laser-care.svg'),
      ('Allergy','When an itchy rash needs a dermatologist','Eczema, allergy and infection can look similar but need different care.','/treatments/skin-allergy-treatment/','/assets/images/professional/medical-care.svg')]
    cardhtml=''.join(f'''<a class="patient-guide-card" href="{href}"><img src="{img}" alt="" width="640" height="360"><div class="patient-guide-body"><span class="guide-topic">{topic}</span><h2>{title}</h2><p>{desc}</p><span class="guide-link">Read guide →</span></div></a>''' for topic,title,desc,href,img in cards)
    markup=f'''<main id="main-content" class="hub-main">{hero('Skin Journal and patient guides','Clear, practical dermatologist-reviewed information linked directly to the relevant care pages.','/assets/images/premium-v2/journal.svg')}<section class="hub-section"><div class="container"><div class="section-heading"><div><span class="section-kicker">Patient education</span><h2>Start with a topic that matters to you</h2><p>These guides provide general information. A personal consultation is needed for diagnosis and treatment selection.</p></div></div><div class="guide-grid">{cardhtml}</div></div></section><section class="home-cta"><div class="container home-cta-grid"><div><span class="section-kicker" style="color:#f4d474">Need personal guidance?</span><h2>Turn general information into an individual plan.</h2><p>Consult Dr. Cheena Langer at Karan Nagar or Paloura Chowk.</p></div><div class="hero-actions"><a class="button" href="/book-appointment/">Book Appointment</a><a class="button button-secondary" href="https://wa.me/917006613362">WhatsApp Now</a></div></div></section></main>'''
    old=doc.xpath('//main'); new=html.fromstring(markup)
    if old: old[0].getparent().replace(old[0],new)

def rebuild_contact(doc):
    markup=f'''<main id="main-content">{hero('Contact Aastha Skin Centre','Call, WhatsApp or request an appointment at Karan Nagar or Paloura Chowk.','/assets/images/premium-v2/contact.svg')}<section class="section"><div class="container"><div class="contact-action-grid"><a class="contact-action-card" href="tel:+917006613362"><strong>Call the clinic</strong><span>7006613362</span></a><a class="contact-action-card" href="https://wa.me/917006613362"><strong>WhatsApp</strong><span>Send a clinic enquiry</span></a><a class="contact-action-card" href="mailto:aasthaskinsurgs@gmail.com"><strong>Email</strong><span>aasthaskinsurgs@gmail.com</span></a><a class="contact-action-card" href="/book-appointment/"><strong>Book appointment</strong><span>Request a preferred date</span></a></div><div class="premium-location-grid"><article class="premium-location-card"><h2>Karan Nagar</h2><p>Lane 2, Karan Nagar, near Amphalla Chowk, Jammu – 180005</p><p><strong>Dr. Cheena Langer:</strong><br>Mon–Sat 11:00 AM–4:00 PM<br>Sun 11:00 AM–3:00 PM</p><div class="premium-location-actions"><a href="/locations/karan-nagar/">Clinic details</a><a href="https://maps.app.goo.gl/pHCQ1r4crKuZBSi98">Directions</a><a href="tel:+911913509230">Landline</a></div></article><article class="premium-location-card"><h2>Paloura Chowk</h2><p>Top Paloura, opposite Government Senior Secondary School, Jammu – 181121</p><p><strong>Dr. Cheena Langer:</strong><br>Mon–Sat 6:00 PM–8:00 PM<br>Sun 10:30 AM–12:00 PM</p><div class="premium-location-actions"><a href="/locations/paloura/">Clinic details</a><a href="https://maps.app.goo.gl/kh4AqZoUkscpEgWc8">Directions</a><a href="tel:+911913135864">Landline</a></div></article></div><div class="premium-form" style="margin-top:28px"><span class="eyebrow">General enquiry</span><h2>Send the clinic a WhatsApp enquiry</h2><p>This form prepares a WhatsApp message. Sending it does not confirm an appointment.</p><form data-premium-contact-form class="premium-form-grid"><label>Name<input name="name" required autocomplete="name"></label><label>Mobile number<input name="mobile" required inputmode="numeric" maxlength="10" autocomplete="tel"></label><label>Preferred clinic<select name="clinic"><option>No preference</option><option>Karan Nagar</option><option>Paloura Chowk</option></select></label><label>Reason<select name="reason"><option>Request an appointment</option><option>Ask about a treatment</option><option>Existing-patient follow-up</option><option>Procedure scheduling</option><option>Other</option></select></label><label class="full">Message<textarea name="message" placeholder="Tell us briefly how the clinic can assist you. Do not submit emergency or highly sensitive information."></textarea></label><div class="full"><button class="button" type="submit">Continue on WhatsApp</button></div></form></div><div class="medical-disclaimer notice" style="margin-top:28px"><strong>Emergency note:</strong> Clinic numbers are not emergency-service numbers. Difficulty breathing, facial or throat swelling, severe medicine reactions, rapidly spreading redness or extensive blistering require urgent hospital care.</div></div></section></main>'''
    old=doc.xpath('//main'); new=html.fromstring(markup)
    if old: old[0].getparent().replace(old[0],new)

def fix_site_js():
    p=ROOT/'assets/js/site.js'
    if not p.exists(): return False
    s=p.read_text(encoding='utf-8',errors='ignore')
    ns=s.replace('function applyGlobalFacts(config) {\n  function applyGlobalFacts(config) {','function applyGlobalFacts(config) {')
    if ns!=s: p.write_text(ns,encoding='utf-8'); return True
    return False

def add_blog_fallback():
    # A separate blog.html would duplicate the /blog/ canonical, so use a host redirect only.
    legacy = ROOT / 'blog.html'
    if legacy.exists():
        legacy.unlink()
    r=ROOT/'render.yaml'
    if r.exists():
        s=r.read_text(encoding='utf-8')
        if 'source: /blog\n' not in s:
            marker='    routes:\n'
            route='      - type: redirect\n        source: /blog\n        destination: /blog/\n'
            if marker in s: s=s.replace(marker,marker+route,1); r.write_text(s,encoding='utf-8')

def main():
    stamp=datetime.now().strftime('%Y%m%d-%H%M%S'); backup=BACKUPS/f'premium-v2-{stamp}'; changed=[]; stats={'editorial':0,'raw':0,'linked':0,'sections':0,'collapsed':0}
    for path in sorted(public_html()):
        rel=path.relative_to(ROOT)
        src=path.read_text(encoding='utf-8',errors='ignore')
        try: doc=html.document_fromstring(src)
        except Exception as e: print('ERROR',rel,e); continue
        ensure_assets(doc); stats['editorial']+=remove_editorial(doc)
        if rel.as_posix()=='blog/index.html': rebuild_blog(doc)
        elif rel.as_posix()=='contact/index.html': rebuild_contact(doc)
        else:
            out=clean_inner(doc,rel); [stats.__setitem__(k,stats.get(k,0)+v) for k,v in out.items()]
        result='<!DOCTYPE html>\n'+html.tostring(doc,encoding='unicode',method='html')
        if result!=src:
            dest=backup/rel; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(path,dest); path.write_text(result,encoding='utf-8'); changed.append(str(rel).replace('\\','/'))
    jsfix=fix_site_js(); add_blog_fallback()
    REPORTS.mkdir(exist_ok=True); report=REPORTS/f'premium-v2-{stamp}.txt'; report.write_text('\n'.join(['Aastha full-site premium v2 rebuild',f'Changed HTML: {len(changed)}',f'Site JS repaired: {jsfix}',*(f'{k}: {v}' for k,v in stats.items()),'',*changed]),encoding='utf-8')
    print(f'Changed HTML files: {len(changed)}'); print(f'Site JS repaired: {jsfix}'); [print(f'{k}: {v}') for k,v in stats.items()]; print('Report:',report)
if __name__=='__main__': main()
