#!/usr/bin/env python3
"""Repair clinical page structure and build dedicated acne knowledge pages."""

from __future__ import annotations

import html
import json
import re
import unicodedata
from collections import Counter
from copy import deepcopy
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
TREATMENTS = ROOT / "treatments"
BLOG = ROOT / "blog"
ARTICLE_DATA = ROOT / "content" / "blog-articles-v28.json"
PRIMARY = "https://www.aasthaskincentre.in"

SHARED_CLASSES = (
    "care-principles",
    "clinic-choice-section",
    "faq-section",
    "article-cta",
    "medical-disclaimer",
)

ARTICLE_LINKS = {
    "blackheads": "/blog/blackheads/",
    "whiteheads": "/blog/whiteheads/",
    "small red pimples": "/blog/acne-papules/",
    "pus filled lesions": "/blog/acne-pustules/",
    "painful nodules": "/blog/acne-nodules/",
    "deep cystic breakouts": "/blog/cystic-acne/",
    "oily skin": "/blog/oily-skin-and-acne/",
    "post acne red marks": "/blog/post-acne-red-marks/",
    "post acne dark marks": "/blog/post-acne-dark-marks/",
    "acne like eruptions": "/blog/acne-like-eruptions/",
}

SOURCE_LINKS = [
    (
        "American Academy of Dermatology: How to treat different types of acne",
        "https://www.aad.org/public/diseases/acne/diy/types-breakouts",
    ),
    (
        "American Academy of Dermatology: Acne diagnosis and treatment",
        "https://www.aad.org/public/diseases/acne/derm-treat/treat",
    ),
    (
        "American Academy of Dermatology: Acne signs and symptoms",
        "https://www.aad.org/public/diseases/acne/really-acne/symptoms",
    ),
]


def parse(path: Path) -> etree._Element:
    parser = etree.HTMLParser(remove_blank_text=False)
    document = etree.fromstring(path.read_bytes(), parser)
    if document is None:
        raise ValueError(f"Could not parse {path}")
    return document


def has_class(element: etree._Element, class_name: str) -> bool:
    return class_name in (element.get("class") or "").split()


def inside(element: etree._Element, class_name: str) -> bool:
    return any(has_class(parent, class_name) for parent in element.iterancestors())


def text_of(element: etree._Element) -> str:
    return " ".join(" ".join(element.itertext()).split())


def normalise(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.replace("’", "'").replace("–", "-").replace("—", "-")
    value = re.sub(r"[^a-zA-Z0-9]+", " ", value).strip().casefold()
    return value


def add_class(element: etree._Element, class_name: str) -> None:
    classes = (element.get("class") or "").split()
    if class_name not in classes:
        classes.append(class_name)
        element.set("class", " ".join(classes))


def direct_article(path: Path, document: etree._Element) -> etree._Element:
    articles = [
        node
        for node in document.iter("article")
        if has_class(node, "article-stack")
    ]
    if len(articles) != 1:
        raise ValueError(f"{path}: expected one .article-stack, found {len(articles)}")
    return articles[0]


def is_standard_cta(element: etree._Element) -> bool:
    hrefs = {link.get("href", "") for link in element.iter("a")}
    return (
        any(href == "/book-appointment/" for href in hrefs)
        and any(href.startswith("https://wa.me/") for href in hrefs)
        and any(child.tag == "div" for child in element)
    )


def unwrap_as_article_section(element: etree._Element) -> None:
    parent = element.getparent()
    if parent is None:
        return
    replacement = etree.Element("section", {"class": "article-section"})
    replacement.text = element.text
    for child in list(element):
        element.remove(child)
        replacement.append(child)
    replacement.tail = element.tail
    parent.replace(element, replacement)


def choose_component(
    article: etree._Element,
    class_name: str,
) -> etree._Element | None:
    candidates = [
        node
        for node in article.iter()
        if isinstance(node.tag, str) and has_class(node, class_name)
    ]
    if not candidates:
        return None

    if class_name == "faq-section":
        candidates.sort(
            key=lambda node: (
                sum(1 for item in node.iter("details")),
                node.getparent() is article,
            )
        )
    elif class_name == "article-cta":
        standard = [node for node in candidates if is_standard_cta(node)]
        if standard:
            candidates = standard
        candidates.sort(key=lambda node: node.getparent() is article)
    else:
        candidates.sort(key=lambda node: node.getparent() is article)

    return deepcopy(candidates[-1])


def remove_components_and_recover_content(
    article: etree._Element,
) -> dict[str, etree._Element | None]:
    selected = {
        class_name: choose_component(article, class_name)
        for class_name in SHARED_CLASSES
    }

    # Recover legitimate prose accidentally wrapped as an authoring CTA.
    for node in list(article.iter()):
        if (
            isinstance(node.tag, str)
            and has_class(node, "article-cta")
            and not is_standard_cta(node)
        ):
            unwrap_as_article_section(node)

    # Remove every old shared component; one clean copy is appended later.
    for node in reversed(list(article.iter())):
        if node is article or not isinstance(node.tag, str):
            continue
        if any(has_class(node, class_name) for class_name in SHARED_CLASSES):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
    return selected


def is_operational_duplicate(element: etree._Element) -> bool:
    if element.tag not in {"p", "h2", "h3"}:
        return False
    value = text_of(element)
    simple = normalise(value)
    lowered = value.casefold()
    if simple in {
        "dr cheena langer s timings",
        "procedure hours",
        "karan nagar clinic",
        "paloura clinic",
    }:
        return True
    if "website verification file" in lowered:
        return True
    if element.tag == "p" and re.fullmatch(
        r"(?:call|whatsapp)?\s*\+?(?:91)?[\s-]*(?:7006613362|9796676541)",
        value,
        flags=re.I,
    ):
        return True
    if element.tag == "p" and (
        "consultation fee is ₹500" in lowered
        or "consultation fee is rs" in lowered
        or "consultation fee is inr" in lowered
    ):
        return True
    if re.match(r"^(monday|mon|sunday|sun)\b", lowered) and re.search(
        r"\d{1,2}:\d{2}\s*(?:am|pm)", lowered
    ):
        return True
    return False


def remove_operational_duplicates(article: etree._Element) -> int:
    removed = 0
    for node in list(article.iter()):
        if node is article or not isinstance(node.tag, str):
            continue
        if inside(node, "faq-answer") or inside(node, "deep-dive-cta"):
            continue
        if is_operational_duplicate(node):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
                removed += 1
    return removed


def unwrap_link(link: etree._Element) -> None:
    parent = link.getparent()
    if parent is None:
        return
    index = parent.index(link)
    children = list(link)
    if children:
        if link.text:
            if index == 0:
                parent.text = (parent.text or "") + link.text
            else:
                previous = parent[index - 1]
                previous.tail = (previous.tail or "") + link.text
        for child in children:
            link.remove(child)
            parent.insert(index, child)
            index += 1
    else:
        text = link.text or ""
        if index == 0:
            parent.text = (parent.text or "") + text
        else:
            previous = parent[index - 1]
            previous.tail = (previous.tail or "") + text
    if link.tail:
        if index == 0:
            parent.text = (parent.text or "") + link.tail
        else:
            previous = parent[index - 1]
            previous.tail = (previous.tail or "") + link.tail
    parent.remove(link)


def page_path(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    if relative == "index.html":
        return "/"
    return "/" + relative.removesuffix("index.html")


def repair_links(path: Path, document: etree._Element) -> tuple[int, int]:
    current = page_path(path).rstrip("/")
    redirected = 0
    unwrapped = 0
    for link in list(document.iter("a")):
        href = link.get("href", "")
        label = normalise(text_of(link))

        if label in {"blackheads", "whiteheads"}:
            desired = ARTICLE_LINKS[label]
            if href != desired:
                link.set("href", desired)
                redirected += 1
            continue

        if href.startswith("/") and href.split("#", 1)[0].rstrip("/") == current:
            unwrap_link(link)
            unwrapped += 1
    return redirected, unwrapped


def repair_acne_signs(document: etree._Element) -> int:
    changed = 0
    heading = next(
        (
            node
            for node in document.iter()
            if node.tag in {"h2", "h3"}
            and normalise(text_of(node)) == "common signs of acne"
        ),
        None,
    )
    if heading is None:
        return 0

    section = heading.getparent()
    if section is None:
        return 0
    for item in section.iter("li"):
        label = normalise(text_of(item))
        if label == "acne scars":
            target = "/treatments/acne-scar-treatment/"
        else:
            target = ARTICLE_LINKS.get(label)
        if not target:
            continue
        links = list(item.iter("a"))
        if links:
            links[0].set("href", target)
        else:
            original_text = text_of(item)
            for child in list(item):
                item.remove(child)
            item.text = None
            anchor = etree.SubElement(item, "a", {"href": target})
            anchor.text = original_text
        changed += 1

    for paragraph in section.iter("p"):
        value = text_of(paragraph)
        if not value.startswith("Not every acne-like eruption"):
            continue
        paragraph.clear()
        paragraph.text = "Not every "
        link = etree.SubElement(paragraph, "a", {"href": "/blog/acne-like-eruptions/"})
        link.text = "acne-like eruption"
        link.tail = (
            " is acne. Folliculitis, perioral dermatitis and hidradenitis "
            "suppurativa can resemble acne but require different treatment."
        )
        changed += 1
    return changed


def remove_empty_containers(article: etree._Element) -> int:
    removed = 0
    for node in reversed(list(article.iter())):
        if node is article or not isinstance(node.tag, str):
            continue
        if node.tag not in {"section", "details", "div"}:
            continue
        if has_class(node, "deep-dive"):
            body = next(
                (child for child in node if has_class(child, "deep-dive-body")),
                None,
            )
            if body is not None and not text_of(body):
                parent = node.getparent()
                if parent is not None:
                    parent.remove(node)
                    removed += 1
        elif has_class(node, "article-section") and not text_of(node):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
                removed += 1
    return removed


def append_shared_components(
    article: etree._Element,
    selected: dict[str, etree._Element | None],
) -> None:
    for class_name in (
        "care-principles",
        "clinic-choice-section",
        "faq-section",
        "article-cta",
        "medical-disclaimer",
    ):
        component = selected.get(class_name)
        if component is not None:
            article.append(component)


def unique_ids(document: etree._Element) -> int:
    seen: Counter[str] = Counter()
    changed = 0
    for node in document.iter():
        identifier = node.get("id")
        if not identifier:
            continue
        seen[identifier] += 1
        if seen[identifier] > 1:
            node.set("id", f"{identifier}-{seen[identifier]}")
            changed += 1
    return changed


def write_document(path: Path, document: etree._Element) -> None:
    rendered = etree.tostring(
        document,
        encoding="unicode",
        method="html",
        doctype="<!DOCTYPE html>",
    )
    path.write_text(rendered.rstrip() + "\n", encoding="utf-8")


def clean_treatment_page(path: Path) -> Counter[str]:
    document = parse(path)
    article = direct_article(path, document)
    metrics: Counter[str] = Counter()
    selected = remove_components_and_recover_content(article)
    metrics["operational_duplicates_removed"] = remove_operational_duplicates(article)
    metrics["empty_containers_removed"] = remove_empty_containers(article)
    redirected, unwrapped = repair_links(path, document)
    metrics["links_redirected"] = redirected
    metrics["self_links_unwrapped"] = unwrapped
    if path.parent.name == "acne-treatment":
        metrics["acne_sign_links_repaired"] = repair_acne_signs(document)
    append_shared_components(article, selected)
    metrics["duplicate_ids_fixed"] = unique_ids(document)
    write_document(path, document)
    metrics["pages_cleaned"] = 1
    return metrics


def section_markup(section: dict) -> str:
    paragraphs = "".join(
        f"<p>{html.escape(paragraph)}</p>"
        for paragraph in section.get("paragraphs", [])
    )
    bullets = section.get("bullets", [])
    bullet_markup = ""
    if bullets:
        bullet_markup = '<ul class="clean-list">' + "".join(
            f"<li>{html.escape(item)}</li>" for item in bullets
        ) + "</ul>"
    identifier = re.sub(r"[^a-z0-9]+", "-", section["heading"].casefold()).strip("-")
    return (
        f'<section class="article-section">'
        f'<h2 id="{identifier}">{html.escape(section["heading"])}</h2>'
        f"{paragraphs}{bullet_markup}</section>"
    )


def faq_markup(items: list[list[str]]) -> str:
    details = "".join(
        "<details><summary>"
        + html.escape(question)
        + '</summary><div class="faq-answer"><p>'
        + html.escape(answer)
        + "</p></div></details>"
        for question, answer in items
    )
    return (
        '<section class="faq-section article-section">'
        "<h2>Frequently asked questions</h2>"
        f'<div class="faq-clean-list">{details}</div></section>'
    )


def related_markup(items: list[list[str]]) -> str:
    links = "".join(
        f'<a href="{html.escape(url, quote=True)}">{html.escape(label)}</a>'
        for label, url in items
    )
    return (
        '<section class="article-section related-knowledge">'
        "<h2>Continue reading</h2>"
        f'<nav class="related-care-links" aria-label="Related pages">{links}</nav>'
        "</section>"
    )


def source_markup() -> str:
    links = "".join(
        f'<li><a href="{html.escape(url, quote=True)}" target="_blank" '
        f'rel="noopener noreferrer">{html.escape(label)}</a></li>'
        for label, url in SOURCE_LINKS
    )
    return (
        '<section class="article-section source-note">'
        "<h2>Medical information sources</h2>"
        "<p>This guide was prepared from established dermatology patient guidance "
        "and requires final clinical approval by Dr. Cheena Langer before launch.</p>"
        f'<ul class="clean-list">{links}</ul></section>'
    )


def blog_page(article: dict) -> str:
    today = date.today().isoformat()
    canonical = f"{PRIMARY}/blog/{article['slug']}/"
    sections = "".join(section_markup(section) for section in article["sections"])
    faq = faq_markup(article["faqs"])
    related = related_markup(article["related"])
    title = html.escape(article["title"])
    topic_title = article["title"].split(":", 1)[0]
    seo_title = html.escape(f"{topic_title} | Aastha Skin Jammu")
    description = html.escape(article["meta_description"], quote=True)
    intro = html.escape(article["intro"])
    category = html.escape(article["category"])
    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": canonical + "#article",
        "url": canonical,
        "headline": article["title"],
        "description": article["meta_description"],
        "datePublished": today,
        "dateModified": today,
        "author": {"@id": f"{PRIMARY}/dr-cheena-langer/#physician"},
        "reviewedBy": {"@id": f"{PRIMARY}/dr-cheena-langer/#physician"},
        "publisher": {"@id": f"{PRIMARY}/#organization"},
        "inLanguage": "en-IN",
    }
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {"@type": "Answer", "text": answer},
            }
            for question, answer in article["faqs"]
        ],
    }
    return f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="/assets/js/theme-init.js"></script>
  <title>{seo_title}</title>
  <meta name="description" content="{description}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="Aastha Skin &amp; Dermato-Cosmetic Centre">
  <meta property="og:image" content="{PRIMARY}/assets/images/professional/acne-care.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="stylesheet" href="/assets/css/professional.css">
  <link rel="stylesheet" href="/assets/css/release-v24.css">
  <script type="application/ld+json">{json.dumps(schema, ensure_ascii=False, indent=2)}</script>
  <script type="application/ld+json">{json.dumps(faq_schema, ensure_ascii=False, indent=2)}</script>
</head>
<body class="release-v24">
  <div data-site-header></div>
  <main id="main-content">
    <section class="page-hero page-hero--professional"><div class="container">
      <div class="page-hero-copy">
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
        <span class="eyebrow">{category} · Medical review pending</span>
        <h1>{title}</h1>
        <p class="lead">{intro}</p>
        <p class="blog-meta">Updated: {today} · Prepared for review by Dr. Cheena Langer, MD Dermatology</p>
      </div>
      <div class="page-hero-art"><img src="/assets/images/professional/acne-care.svg" alt="" width="560" height="360"></div>
    </div></section>
    <section class="premium-summary-strip"><div class="container"><div class="premium-summary-grid">
      <div class="premium-summary-item"><strong>Specific topic</strong><span>A dedicated explanation, not a redirect</span></div>
      <div class="premium-summary-item"><strong>Diagnosis matters</strong><span>Similar-looking bumps may need different care</span></div>
      <div class="premium-summary-item"><strong>Connected guidance</strong><span>Related articles and treatment pages are linked</span></div>
    </div></div></section>
    <section class="section"><div class="container content-layout">
      <article class="prose article-stack">
        <section class="article-section"><h2>Key point</h2><p class="page-intro">{intro}</p></section>
        {sections}
        {related}
        {source_markup()}
        {faq}
        <section class="article-cta"><div><span class="quiet-label">Need a diagnosis?</span><h2>Discuss persistent or painful acne with a dermatologist</h2><p>Request a consultation with Dr. Cheena Langer at Karan Nagar or Paloura Chowk.</p></div><div class="hero-actions"><a class="button" href="/book-appointment/">Book an appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp now</a></div></section>
        <p class="medical-disclaimer"><strong>Medical disclaimer:</strong> Results may vary from person to person. This content is for informational purposes only and does not substitute a consultation with a qualified medical professional. Dr. Cheena Langer, MD is a registered medical practitioner.</p>
      </article>
      <aside class="care-sidebar" aria-label="Consultation information"><div class="care-sidebar-card">
        <span class="quiet-label">Consultation</span><h2>Speak with the clinic</h2>
        <p>Choose Karan Nagar or Paloura Chowk for a dermatologist-led assessment.</p>
        <dl class="care-facts"><div><dt>Consultation fee</dt><dd>₹500</dd></div><div><dt>Follow-up</dt><dd>One visit within 10 days</dd></div></dl>
        <a class="button" href="/book-appointment/">Request an appointment</a>
        <a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp the clinic</a>
        <a class="plain-link" href="tel:+917006613362">Call 7006613362</a>
      </div></aside>
    </div></section>
  </main>
  <div data-site-footer></div>
  <script src="/assets/js/site.js" defer></script>
  <script src="/assets/js/professional.js" defer></script>
  <script src="/assets/js/release-v24.js" defer></script>
</body>
</html>
"""


def blog_index(articles: list[dict]) -> str:
    cards = "".join(
        f'<a class="journal-card" href="/blog/{html.escape(article["slug"])}/">'
        '<img src="/assets/images/professional/acne-care.svg" alt="" width="640" height="360">'
        f'<div><span>{html.escape(article["category"])}</span>'
        f'<h2>{html.escape(article["title"])}</h2>'
        f'<p>{html.escape(article["meta_description"])}</p>'
        '<strong>Read the article <span aria-hidden="true">→</span></strong></div></a>'
        for article in articles
    )
    return f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="/assets/js/theme-init.js"></script>
  <title>Dermatology Blog in Jammu | Aastha Skin</title>
  <meta name="description" content="Read dedicated dermatologist-reviewed skin and acne articles from Aastha Skin Centre in Jammu.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="{PRIMARY}/blog/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Dermatology Blog in Jammu | Aastha Skin">
  <meta property="og:description" content="Dedicated skin and acne guides with clear links to related care.">
  <meta property="og:url" content="{PRIMARY}/blog/">
  <meta property="og:site_name" content="Aastha Skin &amp; Dermato-Cosmetic Centre">
  <meta property="og:image" content="{PRIMARY}/assets/images/professional/hero-care.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/css/styles.css">
  <link rel="stylesheet" href="/assets/css/professional.css">
  <link rel="stylesheet" href="/assets/css/release-v24.css">
  <script type="application/ld+json">{{
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "{PRIMARY}/blog/#blog",
    "url": "{PRIMARY}/blog/",
    "name": "Aastha Skin Centre Dermatology Blog",
    "publisher": {{"@id": "{PRIMARY}/#organization"}},
    "inLanguage": "en-IN"
  }}</script>
</head>
<body class="release-v24">
  <div data-site-header></div>
  <main id="main-content" class="journal-main">
    <section class="page-hero page-hero--professional journal-hero"><div class="container">
      <div class="page-hero-copy"><nav class="breadcrumbs"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Skin journal</span></nav><span class="eyebrow">Patient guides</span><h1>Every linked topic now has its own useful page</h1><p class="lead">Browse focused articles, understand how similar concerns differ and follow clear links to related treatment pages.</p><div class="hero-actions"><a class="button" href="/conditions/">Explore concerns</a><a class="button button-secondary" href="/book-appointment/">Book an appointment</a></div></div>
      <div class="page-hero-art"><img src="/assets/images/premium-v2/journal.svg" alt="" width="560" height="360"></div>
    </div></section>
    <section class="journal-section"><div class="container"><div class="section-heading"><div><span class="quiet-label">Acne knowledge centre</span><h2>Understand the exact sign you are seeing</h2><p>These pages provide general information and do not replace an individual diagnosis.</p></div></div><div class="journal-grid">{cards}</div></div></section>
    <section class="article-cta journal-cta"><div><span class="quiet-label">Need personal guidance?</span><h2>Discuss your concern with a dermatologist</h2><p>Consult Dr. Cheena Langer at Karan Nagar or Paloura Chowk.</p></div><div class="hero-actions"><a class="button" href="/book-appointment/">Book an appointment</a><a class="button button-secondary" href="https://wa.me/917006613362" target="_blank" rel="noopener">WhatsApp now</a></div></section>
  </main>
  <div data-site-footer></div>
  <script src="/assets/js/site.js" defer></script>
  <script src="/assets/js/professional.js" defer></script>
  <script src="/assets/js/release-v24.js" defer></script>
</body>
</html>
"""


def generate_blog_pages() -> int:
    articles = json.loads(ARTICLE_DATA.read_text(encoding="utf-8"))
    for article in articles:
        directory = BLOG / article["slug"]
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "index.html").write_text(blog_page(article), encoding="utf-8")
    (BLOG / "index.html").write_text(blog_index(articles), encoding="utf-8")
    return len(articles)


def main() -> int:
    totals: Counter[str] = Counter()
    for path in sorted(TREATMENTS.glob("*/index.html")):
        totals.update(clean_treatment_page(path))
    totals["blog_pages_generated"] = generate_blog_pages()

    for key in sorted(totals):
        print(f"{key.replace('_', ' ').title()}: {totals[key]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
