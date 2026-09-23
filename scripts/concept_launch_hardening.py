#!/usr/bin/env python3
"""Prepare production-target SEO metadata for the isolated editorial preview.

The preview itself remains noindex. This module only makes the rendered pages
carry the canonical/meta/schema they are expected to use after an approved
production cutover and emits separate prelaunch sitemap/robots candidates.
"""
from __future__ import annotations

from pathlib import Path
import html
import json
import re

PUBLIC_ORIGIN = "https://www.aasthaskincentre.in"
SITE_NAME = "Aastha Skin & Dermato-Cosmetic Centre"
PHONE_PRIMARY = "+91-7006613362"
PHONE_SECONDARY = "+91-9796676541"
PHYSICIAN_ID = PUBLIC_ORIGIN + "/dr-cheena-langer/#physician"
DEFAULT_OG_IMAGE = PUBLIC_ORIGIN + "/assets/images/visual-cues/clinical-skin-care.jpg"
DOCTOR_OG_IMAGE = PUBLIC_ORIGIN + "/media/images/DSC_5241_1.max-900x900.format-webp.webp"

RESERVED = {
    "conditions", "treatments", "dr-cheena-langer", "book-appointment", "contact",
    "locations", "blog", "media", "about", "privacy-policy", "medical-disclaimer",
    "terms-and-conditions", "appointment-request-received", "admin",
}

TITLE_RE = re.compile(r"<title\b[^>]*>(.*?)</title>", re.I | re.S)
META_RE = re.compile(r"<meta\b[^>]*>", re.I)
LINK_RE = re.compile(r"<link\b[^>]*>", re.I)
JSONLD_RE = re.compile(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>', re.I | re.S)
TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def _attr(tag: str, name: str) -> str:
    match = re.search(rf'\b{re.escape(name)}\s*=\s*["\']([^"\']*)["\']', tag, re.I)
    return html.unescape(match.group(1)).strip() if match else ""


def _text(fragment: str) -> str:
    return WS_RE.sub(" ", html.unescape(TAG_RE.sub(" ", fragment))).strip()


def _clip(text: str, limit: int = 158) -> str:
    text = WS_RE.sub(" ", text).strip()
    if len(text) <= limit:
        return text
    clipped = text[: limit + 1].rsplit(" ", 1)[0].rstrip(" ,;:-")
    return clipped + "."


def _meta_value(source: str, key: str, *, prop: bool = False) -> str:
    attr_name = "property" if prop else "name"
    for tag in META_RE.findall(source):
        if _attr(tag, attr_name).lower() == key.lower():
            return _attr(tag, "content")
    return ""


def _title(source: str) -> str:
    match = TITLE_RE.search(source)
    return _text(match.group(1)) if match else ""


def public_path_for(page: Path, concept_root: Path) -> str | None:
    rel = page.parent.relative_to(concept_root).as_posix()
    if rel in (".", ""):
        return "/"
    if rel == "admin" or rel.startswith("admin/"):
        return None
    if rel.startswith("locations/") or rel.startswith("blog/"):
        return f"/{rel}/"
    if "/" not in rel and rel in RESERVED:
        return f"/{rel}/"
    if "/" not in rel:
        return f"/treatments/{rel}/"
    return f"/{rel}/"


def _legacy_file(dist: Path, public_path: str) -> Path:
    if public_path == "/":
        return dist / "index.html"
    return dist / public_path.lstrip("/") / "index.html"


def _fallback_title(source: str, public_path: str) -> str:
    title = _title(source)
    title = re.sub(r"\s*(?:—|\|)\s*(?:Editorial\s+)?(?:Concept|Preview).*$", "", title, flags=re.I).strip()
    if title:
        return title
    slug = public_path.strip("/").split("/")[-1] if public_path != "/" else "Aastha Skin Centre"
    return slug.replace("-", " ").title() + " | Aastha Skin Centre Jammu"


def _fallback_description(source: str, public_path: str) -> str:
    candidates = [_meta_value(source, "description")]
    for klass in ("hero-copy", "section-copy", "detail-intro"):
        match = re.search(rf'<p\b[^>]*class=["\'][^"\']*\b{klass}\b[^"\']*["\'][^>]*>(.*?)</p>', source, re.I | re.S)
        if match:
            candidates.append(_text(match.group(1)))
    first_p = re.search(r"<p\b[^>]*>(.*?)</p>", source, re.I | re.S)
    if first_p:
        candidates.append(_text(first_p.group(1)))
    for value in candidates:
        if len(value) >= 55:
            return _clip(value)
    label = "dermatology care in Jammu" if public_path == "/" else public_path.strip("/").split("/")[-1].replace("-", " ")
    return _clip(f"Explore {label} at Aastha Skin & Dermato-Cosmetic Centre in Jammu, with diagnosis-led care by Dr. Cheena Langer, MBBS, MD Dermatology.")


def _seo_values(dist: Path, page: Path, public_path: str) -> tuple[str, str]:
    source = page.read_text(encoding="utf-8")
    legacy = _legacy_file(dist, public_path)
    legacy_source = ""
    if legacy.exists() and legacy.resolve() != page.resolve():
        legacy_source = legacy.read_text(encoding="utf-8")

    legacy_title = _title(legacy_source) if legacy_source else ""
    legacy_desc = _meta_value(legacy_source, "description") if legacy_source else ""
    title = legacy_title or _fallback_title(source, public_path)
    title = re.sub(r"\b(?:Editorial\s+)?Concept\b", "", title, flags=re.I)
    title = WS_RE.sub(" ", title).strip(" |-—") or _fallback_title(source, public_path)
    description = legacy_desc if len(legacy_desc.strip()) >= 55 else _fallback_description(source, public_path)
    return title, _clip(description)


def _address_schema(branch: str) -> dict[str, str]:
    if branch == "karan-nagar":
        return {"@type": "PostalAddress", "streetAddress": "Lane 2, Karan Nagar, near Amphalla Chowk", "addressLocality": "Jammu", "postalCode": "180005", "addressRegion": "Jammu and Kashmir", "addressCountry": "IN"}
    return {"@type": "PostalAddress", "streetAddress": "Top Paloura, opposite Government Senior Secondary School, Paloura Chowk", "addressLocality": "Jammu", "postalCode": "181121", "addressRegion": "Jammu and Kashmir", "addressCountry": "IN"}


def _schema_for(public_path: str, canonical: str, title: str, description: str) -> dict:
    website = {"@type": "WebSite", "@id": PUBLIC_ORIGIN + "/#website", "url": PUBLIC_ORIGIN + "/", "name": SITE_NAME}
    physician = {"@type": "Physician", "@id": PHYSICIAN_ID, "name": "Dr. Cheena Langer", "url": PUBLIC_ORIGIN + "/dr-cheena-langer/", "telephone": [PHONE_PRIMARY, PHONE_SECONDARY], "medicalSpecialty": "Dermatology"}
    page = {"@type": "WebPage", "@id": canonical + "#webpage", "url": canonical, "name": title, "description": description, "isPartOf": {"@id": website["@id"]}}
    graph = [website, page]

    if public_path.startswith("/treatments/") and public_path != "/treatments/":
        page["@type"] = "MedicalWebPage"
        page["about"] = {"@id": PHYSICIAN_ID}
        page["reviewedBy"] = {"@id": PHYSICIAN_ID}
        graph.append(physician)
    elif public_path.startswith("/blog/") and public_path != "/blog/":
        page["@type"] = "Article"
        page["headline"] = title
        page["author"] = {"@id": PHYSICIAN_ID}
        graph.append(physician)
    elif public_path == "/dr-cheena-langer/":
        page["@type"] = "ProfilePage"
        page["mainEntity"] = {"@id": PHYSICIAN_ID}
        graph.append(physician)
    elif public_path in {"/", "/about/", "/media/"}:
        page["about"] = {"@id": PHYSICIAN_ID}
        graph.append(physician)
    elif public_path in {"/conditions/", "/treatments/", "/blog/", "/locations/"}:
        page["@type"] = "CollectionPage"
    elif public_path in {"/book-appointment/", "/contact/"}:
        page["@type"] = "ContactPage"

    if public_path in {"/locations/karan-nagar/", "/locations/paloura/"}:
        branch = "karan-nagar" if "karan-nagar" in public_path else "paloura"
        clinic_id = canonical + "#clinic"
        page["mainEntity"] = {"@id": clinic_id}
        graph.append({"@type": "MedicalClinic", "@id": clinic_id, "name": "Aastha Skin & Dermato-Cosmetic Centre — Karan Nagar" if branch == "karan-nagar" else "Aastha Skin & Dermato-Cosmetic Centre — Paloura Chowk", "url": canonical, "telephone": [PHONE_PRIMARY, PHONE_SECONDARY], "medicalSpecialty": "Dermatology", "address": _address_schema(branch)})

    return {"@context": "https://schema.org", "@graph": graph}


def _remove_managed_head(source: str) -> str:
    managed_names = {"description", "twitter:card", "twitter:title", "twitter:description", "twitter:image"}
    managed_props = {"og:title", "og:description", "og:url", "og:site_name", "og:type", "og:image"}
    for tag in META_RE.findall(source):
        if _attr(tag, "name").lower() in managed_names or _attr(tag, "property").lower() in managed_props:
            source = source.replace(tag, "")
    for tag in LINK_RE.findall(source):
        if _attr(tag, "rel").lower() == "canonical":
            source = source.replace(tag, "")
    return JSONLD_RE.sub("", source)


def _inject(page: Path, dist: Path, concept_root: Path) -> dict | None:
    public_path = public_path_for(page, concept_root)
    if public_path is None:
        return None
    source = page.read_text(encoding="utf-8")
    title, description = _seo_values(dist, page, public_path)
    canonical = PUBLIC_ORIGIN + public_path
    og_image = DOCTOR_OG_IMAGE if public_path == "/dr-cheena-langer/" else DEFAULT_OG_IMAGE
    source = _remove_managed_head(source)
    if TITLE_RE.search(source):
        source = TITLE_RE.sub(f"<title>{html.escape(title)}</title>", source, count=1)
    else:
        source = source.replace("</head>", f"<title>{html.escape(title)}</title></head>", 1)
    schema = _schema_for(public_path, canonical, title, description)
    head = "\n".join([
        f'<meta name="description" content="{html.escape(description, quote=True)}">',
        f'<link rel="canonical" href="{html.escape(canonical, quote=True)}">',
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{html.escape(SITE_NAME, quote=True)}">',
        f'<meta property="og:title" content="{html.escape(title, quote=True)}">',
        f'<meta property="og:description" content="{html.escape(description, quote=True)}">',
        f'<meta property="og:url" content="{html.escape(canonical, quote=True)}">',
        f'<meta property="og:image" content="{html.escape(og_image, quote=True)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{html.escape(title, quote=True)}">',
        f'<meta name="twitter:description" content="{html.escape(description, quote=True)}">',
        f'<meta name="twitter:image" content="{html.escape(og_image, quote=True)}">',
        '<script type="application/ld+json">' + json.dumps(schema, ensure_ascii=False, separators=(",", ":")) + '</script>',
    ])
    source = source.replace("</head>", head + "\n</head>", 1)
    page.write_text(source, encoding="utf-8")
    return {"public_path": public_path, "canonical": canonical, "title": title, "description": description, "schema_types": [item.get("@type") for item in schema["@graph"]]}


def harden_launch_metadata(dist: Path, concept_pages: list[Path]) -> list[dict]:
    concept_root = dist / "concept"
    records = []
    for page in concept_pages:
        record = _inject(page, dist, concept_root)
        if record:
            records.append(record)
    records.sort(key=lambda item: item["public_path"])
    prelaunch = dist / "prelaunch"
    prelaunch.mkdir(parents=True, exist_ok=True)
    urls = "\n".join(f"  <url><loc>{html.escape(item['canonical'])}</loc></url>" for item in records)
    (prelaunch / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n', encoding="utf-8")
    (prelaunch / "robots.txt").write_text("User-agent: *\nDisallow: /admin/\nSitemap: https://www.aasthaskincentre.in/sitemap.xml\n", encoding="utf-8")
    (prelaunch / "routes.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Launch SEO hardening: {len(records)} public concept page(s)")
    return records
