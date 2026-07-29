#!/usr/bin/env python3
"""Strict release-v28 content graph, structure and global-data QA."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {
    ".git",
    ".venv",
    "dist",
    "reports",
    "backups",
    "post-template",
    "scripts",
}
REQUIRED_COMPONENTS = (
    "care-principles",
    "clinic-choice-section",
    "faq-section",
    "article-cta",
    "medical-disclaimer",
)
EXPECTED_BLOG_SLUGS = {
    "blackheads",
    "whiteheads",
    "acne-papules",
    "acne-pustules",
    "acne-nodules",
    "cystic-acne",
    "oily-skin-and-acne",
    "post-acne-red-marks",
    "post-acne-dark-marks",
    "acne-like-eruptions",
}


def parse(path: Path) -> etree._Element:
    parser = etree.HTMLParser(remove_blank_text=False)
    document = etree.fromstring(path.read_bytes(), parser)
    if document is None:
        raise ValueError(f"Could not parse {path}")
    return document


def has_class(element: etree._Element, class_name: str) -> bool:
    return class_name in (element.get("class") or "").split()


def text_of(element: etree._Element) -> str:
    return " ".join(" ".join(element.itertext()).split())


def public_pages() -> list[Path]:
    return [
        path
        for path in sorted(ROOT.rglob("*.html"))
        if not any(part in EXCLUDED for part in path.relative_to(ROOT).parts)
    ]


def route_for(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    if relative == "index.html":
        return "/"
    if relative == "404.html":
        return "/404.html"
    return "/" + relative.removesuffix("index.html")


def target_exists(href: str) -> bool:
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc or not parsed.path.startswith("/"):
        return True
    path = parsed.path
    if path == "/":
        return (ROOT / "index.html").exists()
    if path.endswith("/"):
        return (ROOT / path.lstrip("/") / "index.html").exists()
    return (ROOT / path.lstrip("/")).exists()


def main() -> int:
    errors: list[str] = []
    pages = public_pages()
    metrics: Counter[str] = Counter()

    config_path = ROOT / "assets" / "data" / "site-config.json"
    try:
        config = json.loads(config_path.read_text(encoding="utf-8"))
        for key_path in (
            ("clinic", "consultation_fee"),
            ("clinic", "follow_up_days"),
            ("contact", "primary_mobile"),
            ("contact", "whatsapp_mobile"),
            ("locations", "karan_nagar"),
            ("locations", "paloura"),
        ):
            value = config
            for key in key_path:
                value = value[key]
            if value in ("", None):
                errors.append(f"site-config.json: empty required value {'.'.join(key_path)}")
    except Exception as exc:
        errors.append(f"site-config.json: invalid configuration ({exc})")

    for path in pages:
        document = parse(path)
        route = route_for(path).rstrip("/") or "/"
        metrics["pages"] += 1

        identifiers = [
            node.get("id")
            for node in document.iter()
            if isinstance(node.tag, str) and node.get("id")
        ]
        duplicate_ids = [
            identifier
            for identifier, count in Counter(identifiers).items()
            if count > 1
        ]
        if duplicate_ids:
            errors.append(
                f"{path.relative_to(ROOT)}: duplicate IDs {', '.join(duplicate_ids)}"
            )

        lowered = path.read_text(encoding="utf-8", errors="ignore").casefold()
        if "website verification file" in lowered:
            errors.append(f"{path.relative_to(ROOT)}: internal verification-file text is visible")
        if len(re.findall(r"dr[.]?\s*cheena langer[’']?s timings", lowered)) > 0:
            errors.append(f"{path.relative_to(ROOT)}: redundant doctor-timings heading remains")

        for link in document.iter("a"):
            href = link.get("href", "")
            if not href:
                errors.append(f"{path.relative_to(ROOT)}: empty link for {text_of(link)!r}")
                continue
            if href.startswith("/") and href.split("#", 1)[0].rstrip("/") == route:
                errors.append(
                    f"{path.relative_to(ROOT)}: self-link {text_of(link)!r} -> {href}"
                )
            if not target_exists(href):
                errors.append(
                    f"{path.relative_to(ROOT)}: missing internal target {href!r}"
                )

            label = text_of(link).strip().casefold()
            if label == "blackheads" and href != "/blog/blackheads/":
                errors.append(
                    f"{path.relative_to(ROOT)}: Blackheads points to {href!r}"
                )
            if label == "whiteheads" and href != "/blog/whiteheads/":
                errors.append(
                    f"{path.relative_to(ROOT)}: Whiteheads points to {href!r}"
                )

        relative = path.relative_to(ROOT)
        is_treatment = (
            len(relative.parts) == 3
            and relative.parts[0] == "treatments"
            and relative.parts[-1] == "index.html"
        )
        if not is_treatment:
            continue

        metrics["treatment_pages"] += 1
        articles = [
            node
            for node in document.iter("article")
            if has_class(node, "article-stack")
        ]
        if len(articles) != 1:
            errors.append(
                f"{relative}: expected one .article-stack, found {len(articles)}"
            )
            continue
        article = articles[0]

        positions: list[int] = []
        direct_children = list(article)
        for class_name in REQUIRED_COMPONENTS:
            matches = [
                node
                for node in article.iter()
                if isinstance(node.tag, str) and has_class(node, class_name)
            ]
            if len(matches) != 1:
                errors.append(
                    f"{relative}: expected one .{class_name}, found {len(matches)}"
                )
                continue
            if matches[0].getparent() is not article:
                errors.append(f"{relative}: .{class_name} is nested in another block")
            else:
                positions.append(direct_children.index(matches[0]))

        if len(positions) == len(REQUIRED_COMPONENTS) and positions != sorted(positions):
            errors.append(f"{relative}: shared end-of-page components are out of order")

        faq = next(
            (
                node
                for node in article.iter()
                if has_class(node, "faq-section")
            ),
            None,
        )
        if faq is not None:
            count = sum(1 for _ in faq.iter("details"))
            metrics["faq_items"] += count
            if count < 3:
                errors.append(f"{relative}: FAQ has only {count} questions")

        cta = next(
            (
                node
                for node in article.iter()
                if has_class(node, "article-cta")
            ),
            None,
        )
        if cta is not None:
            hrefs = {link.get("href", "") for link in cta.iter("a")}
            if "/book-appointment/" not in hrefs:
                errors.append(f"{relative}: final CTA lacks appointment link")
            if not any(href.startswith("https://wa.me/") for href in hrefs):
                errors.append(f"{relative}: final CTA lacks WhatsApp link")

    actual_slugs = {
        path.parent.name
        for path in (ROOT / "blog").glob("*/index.html")
        if path.parent.name != "post-template"
    }
    if actual_slugs != EXPECTED_BLOG_SLUGS:
        errors.append(
            "Blog article set mismatch: "
            f"missing={sorted(EXPECTED_BLOG_SLUGS - actual_slugs)}, "
            f"extra={sorted(actual_slugs - EXPECTED_BLOG_SLUGS)}"
        )

    site_script = (ROOT / "assets" / "js" / "site.js").read_text(
        encoding="utf-8"
    )
    form_script = (ROOT / "assets" / "js" / "release-v24.js").read_text(
        encoding="utf-8"
    )
    if "setupAppointmentForm(config)" in site_script:
        errors.append("Appointment form is initialised by more than one script")
    if "dataset.whatsappUrl" not in site_script:
        errors.append("Global configuration does not expose the WhatsApp URL")
    if "dataset.whatsappUrl" not in form_script:
        errors.append("Appointment form does not use the global WhatsApp URL")

    acne = parse(ROOT / "treatments" / "acne-treatment" / "index.html")
    signs_heading = next(
        (
            node
            for node in acne.iter()
            if node.tag in {"h2", "h3"}
            and text_of(node).strip().casefold() == "common signs of acne"
        ),
        None,
    )
    if signs_heading is None:
        errors.append("Acne page: Common signs section is missing")
    else:
        section = signs_heading.getparent()
        sign_items = list(section.iter("li")) if section is not None else []
        linked_items = [
            item for item in sign_items if any(True for _ in item.iter("a"))
        ]
        if len(sign_items) != 10 or len(linked_items) != 10:
            errors.append(
                "Acne page: all 10 signs must have dedicated internal links "
                f"(items={len(sign_items)}, linked={len(linked_items)})"
            )

    print(f"Pages checked: {metrics['pages']}")
    print(f"Treatment pages checked: {metrics['treatment_pages']}")
    print(f"FAQ items checked: {metrics['faq_items']}")
    print(f"Dedicated blog pages checked: {len(actual_slugs)}")
    print(f"Errors: {len(errors)}")
    for error in errors:
        print(f"ERROR: {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
