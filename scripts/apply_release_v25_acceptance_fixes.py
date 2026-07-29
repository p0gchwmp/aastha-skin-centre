#!/usr/bin/env python3
"""Apply release-v25 acceptance fixes to every source HTML page."""

from __future__ import annotations

import html
import re
from pathlib import Path

from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
SKIP_PARTS = {"dist", "inspection", "node_modules"}
SOCIAL_IMAGE = "https://www.aasthaskincentre.in/assets/images/professional/hero-care.svg"


def pages() -> list[Path]:
    return [
        p for p in ROOT.rglob("*.html")
        if not any(part in SKIP_PARTS for part in p.relative_to(ROOT).parts)
    ]


def clean_description(value: str) -> str:
    match = re.match(r"Content-ready template for (.+?) at Aastha Skin Centre in Jammu\.", value, re.I)
    if not match:
        return value
    topic = match.group(1)
    return f"Learn about dermatologist-led assessment and treatment planning for {topic} at Aastha Skin Centre in Jammu."


def update_metadata(text: str) -> str:
    desc_match = re.search(r'<meta name="description" content="([^"]*)">', text, re.I)
    meta_description = html.unescape(desc_match.group(1)) if desc_match else ""
    meta_description = clean_description(meta_description)

    def replace_og(match: re.Match[str]) -> str:
        current = html.unescape(match.group(1))
        improved = meta_description or clean_description(current)
        return f'<meta property="og:description" content="{html.escape(improved, quote=True)}">'

    text = re.sub(
        r'<meta property="og:description" content="([^"]*)">',
        replace_og,
        text,
        count=1,
        flags=re.I,
    )
    if 'property="og:image"' not in text:
        marker = re.search(r'(<meta property="og:site_name"[^>]*>)', text, re.I)
        if marker:
            addition = (
                f'\n  <meta property="og:image" content="{SOCIAL_IMAGE}">'
                '\n  <meta property="og:image:alt" content="Aastha Skin and Dermato-Cosmetic Centre, Jammu">'
                '\n  <meta name="twitter:card" content="summary_large_image">'
            )
            text = text[: marker.end()] + addition + text[marker.end() :]
    return text


def clean_dom(text: str) -> str:
    parser = etree.HTMLParser(remove_blank_text=False)
    doc = etree.fromstring(text.encode("utf-8"), parser)
    if doc is None:
        return text

    for node in doc.xpath(
        '//*[contains(translate(normalize-space(string(.)),'
        '"ABCDEFGHIJKLMNOPQRSTUVWXYZ","abcdefghijklmnopqrstuvwxyz"),"implementation note:")]'
    ):
        if node.tag in {"div", "p"} and node.getparent() is not None:
            node.getparent().remove(node)

    # Remove visually empty imported sections (a heading with no meaningful body).
    for section in list(doc.xpath(
        '//section[contains(concat(" ",normalize-space(@class)," ")," article-section ")]'
    )):
        children = [c for c in section if isinstance(c.tag, str)]
        visible = " ".join(section.itertext()).strip()
        headings = [c for c in children if c.tag in {"h2", "h3"}]
        non_heading_text = " ".join(
            " ".join(c.itertext()).strip() for c in children if c.tag not in {"h2", "h3"}
        ).strip()
        if headings and not non_heading_text and len(visible) == len(" ".join(headings[0].itertext()).strip()):
            parent = section.getparent()
            if parent is not None:
                parent.remove(section)

    rendered = etree.tostring(doc, encoding="unicode", method="html", doctype="<!DOCTYPE html>")
    return rendered


def main() -> None:
    changed = 0
    for path in pages():
        original = path.read_text(encoding="utf-8")
        updated = clean_dom(update_metadata(original))
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Updated {changed} HTML pages")


if __name__ == "__main__":
    main()
