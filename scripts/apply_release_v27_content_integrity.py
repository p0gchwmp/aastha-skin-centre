#!/usr/bin/env python3
"""Apply release-v27 content-integrity fixes across clinical detail pages.

This corrects repeated source patterns rather than patching individual
screenshots:

- restore complete FAQ answers from the portable recovery data;
- turn paragraph-based answer items into semantic lists;
- separate list introductions that were incorrectly rendered as bullets;
- replace bare phone-number CTAs with a deliberate appointment component;
- remove clinic address/hours blocks duplicated above the shared clinic cards;
- convert orphaned internal-link titles into an accessible related-care group;
- remove adjacent duplicate paragraphs and make every HTML id unique.

The transform is idempotent and can be safely rerun before a release build.
"""

from __future__ import annotations

import copy
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

from lxml import etree, html as lxml_html

ROOT = Path(__file__).resolve().parents[1]
FAQ_DATA = ROOT / "scripts" / "release_v27_faq_answers.json"
HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
PHONE_ONLY = re.compile(
    r"(?:\+?91[\s-]*)?(?:7006613362|9796676541|0191[\s-]*3509230|0191[\s-]*3135864)"
)
EDITORIAL_PREFIXES = (
    "suggested internal link",
    "suggested anchor",
    "editorial note",
    "implementation note",
)


def parse_page(path: Path) -> etree._Element:
    parser = etree.HTMLParser(remove_blank_text=False)
    document = etree.fromstring(path.read_bytes(), parser)
    if document is None:
        raise ValueError(f"Could not parse {path}")
    return document


def text_of(element: etree._Element) -> str:
    return " ".join(" ".join(element.itertext()).split())


def normalise(value: str) -> str:
    ascii_value = (
        unicodedata.normalize("NFKD", value)
        .encode("ascii", "ignore")
        .decode("ascii")
        .lower()
    )
    return re.sub(r"[^a-z0-9]+", " ", ascii_value).strip()


def has_class(element: etree._Element, class_name: str) -> bool:
    return class_name in (element.get("class") or "").split()


def add_class(element: etree._Element, class_name: str) -> None:
    classes = (element.get("class") or "").split()
    if class_name not in classes:
        classes.append(class_name)
        element.set("class", " ".join(classes))


def is_inside(element: etree._Element, class_name: str) -> bool:
    return any(has_class(ancestor, class_name) for ancestor in element.iterancestors())


def direct_child_with_class(
    element: etree._Element,
    class_name: str,
) -> etree._Element | None:
    return next(
        (
            child
            for child in element
            if isinstance(child.tag, str) and has_class(child, class_name)
        ),
        None,
    )


def phone_only(element: etree._Element) -> bool:
    value = re.sub(r"[\s()\-+]", "", text_of(element))
    return bool(re.fullmatch(r"(?:91)?(?:7006613362|9796676541|01913509230|01913135864)", value))


def clone_as(element: etree._Element, tag: str) -> etree._Element:
    replacement = etree.Element(tag)
    replacement.text = element.text
    for child in element:
        replacement.append(copy.deepcopy(child))
    return replacement


def fragment_element(fragment: str) -> etree._Element:
    return lxml_html.fragment_fromstring(fragment)


def remove_editorial_nodes(container: etree._Element) -> int:
    removed = 0
    for element in list(container.iter()):
        if element is container or not isinstance(element.tag, str):
            continue
        value = text_of(element).strip().lower()
        if any(value.startswith(prefix) for prefix in EDITORIAL_PREFIXES):
            parent = element.getparent()
            if parent is not None:
                parent.remove(element)
                removed += 1
    return removed


def restore_faq_answers(
    document: etree._Element,
    page_answers: dict[str, list[str]],
) -> tuple[int, int]:
    restored = 0
    retained = 0
    normalised_answers = {
        normalise(question): fragments for question, fragments in page_answers.items()
    }

    for details in document.iter("details"):
        if not is_inside(details, "faq-clean-list"):
            continue
        summary = next((child for child in details if child.tag == "summary"), None)
        answer = direct_child_with_class(details, "faq-answer")
        if summary is None or answer is None:
            continue

        fragments = page_answers.get(text_of(summary))
        if fragments is None:
            fragments = normalised_answers.get(normalise(text_of(summary)))
        if not fragments:
            retained += 1
            continue

        answer.text = None
        for child in list(answer):
            answer.remove(child)
        for fragment in fragments:
            element = fragment_element(fragment)
            if element.tag in HEADING_TAGS:
                element.tag = "h3"
                add_class(element, "faq-answer-heading")
            answer.append(element)
        remove_editorial_nodes(answer)
        restored += 1

    return restored, retained


def promote_missing_faq_sections(document: etree._Element) -> int:
    """Move the final practical questions into the standard FAQ component."""
    if any(has_class(element, "faq-section") for element in document.iter()):
        return 0

    disclosures = [
        element for element in document.iter("details") if has_class(element, "deep-dive")
    ]
    if not disclosures:
        return 0
    disclosure = disclosures[-1]
    body = direct_child_with_class(disclosure, "deep-dive-body")
    if body is None:
        return 0

    candidates: list[tuple[etree._Element, etree._Element]] = []
    for section in body:
        if not isinstance(section.tag, str) or not has_class(section, "article-section"):
            continue
        heading = next(
            (
                child
                for child in section
                if isinstance(child.tag, str) and child.tag in HEADING_TAGS
            ),
            None,
        )
        if heading is not None and text_of(heading).endswith("?"):
            candidates.append((section, heading))
    selected = candidates[-5:]
    if not selected:
        return 0

    faq = etree.Element("section", {"class": "faq-section article-section"})
    title = etree.SubElement(faq, "h2")
    title.text = "Frequently asked questions"
    faq_list = etree.SubElement(faq, "div", {"class": "faq-clean-list"})

    for section, heading in selected:
        details = etree.SubElement(faq_list, "details")
        summary = etree.SubElement(details, "summary")
        summary.text = text_of(heading)
        answer = etree.SubElement(details, "div", {"class": "faq-answer"})
        for child in section:
            if child is heading:
                continue
            answer.append(copy.deepcopy(child))
        body.remove(section)

    stack = next(
        (element for element in document.iter() if has_class(element, "article-stack")),
        None,
    )
    article_cta = next(
        (element for element in document.iter() if has_class(element, "article-cta")),
        None,
    )
    if stack is None or article_cta is None:
        return 0
    stack.insert(stack.index(article_cta), faq)
    if not any(isinstance(child.tag, str) for child in body):
        parent = disclosure.getparent()
        if parent is not None:
            parent.remove(disclosure)
    return len(selected)


def standardise_hifu_comparison(document: etree._Element) -> int:
    h1 = next(document.iter("h1"), None)
    if h1 is None or text_of(h1) != "HIFU & RF Skin Tightening":
        return 0

    changed = 0
    stack = next(
        (element for element in document.iter() if has_class(element, "article-stack")),
        None,
    )
    clinic = next(
        (element for element in document.iter() if has_class(element, "clinic-choice-section")),
        None,
    )
    if stack is None or clinic is None:
        return 0

    if not any(has_class(element, "care-principles") for element in document.iter()):
        care = etree.Element("section", {"class": "article-section care-principles"})
        heading = etree.SubElement(care, "h2")
        heading.text = "How care is planned"
        principles = etree.SubElement(
            care,
            "ul",
            {"class": "clean-list clean-list--three"},
        )
        for value in (
            "Assessment comes before treatment selection.",
            "Options, limitations, aftercare and expected timelines are explained.",
            "The plan is adapted to diagnosis, skin type and medical history.",
        ):
            item = etree.SubElement(principles, "li")
            item.text = value
        stack.insert(stack.index(clinic), care)
        changed += 1

    # Use the same verified clinic block as every other clinical page.
    reference = parse_page(ROOT / "treatments" / "pigmentation-treatment" / "index.html")
    standard_clinic = next(
        (
            element
            for element in reference.iter()
            if has_class(element, "clinic-choice-section")
        ),
        None,
    )
    if standard_clinic is not None:
        position = stack.index(clinic)
        stack.remove(clinic)
        stack.insert(position, copy.deepcopy(standard_clinic))
        changed += 1

    faq = next(
        (element for element in document.iter() if has_class(element, "faq-section")),
        None,
    )
    if faq is not None and not has_class(faq, "article-section"):
        add_class(faq, "article-section")
        changed += 1
    return changed


def is_compact_list_item(element: etree._Element) -> bool:
    if element.tag != "p":
        return False
    value = text_of(element)
    words = value.split()
    if not value or len(words) > 18:
        return False
    if value.endswith((".", "?", "!", ":")):
        return False
    if value.startswith(("“", '"')) or value.endswith(("”", '"')):
        return False
    return True


def paragraph_runs_to_lists(container: etree._Element) -> int:
    """Convert ``lead:`` + short paragraph runs into semantic bullet lists."""
    converted = 0
    index = 0
    while index < len(container):
        child = container[index]
        if child.tag != "p" or not text_of(child).endswith(":"):
            index += 1
            continue

        candidates: list[etree._Element] = []
        scan = index + 1
        while scan < len(container) and is_compact_list_item(container[scan]):
            candidates.append(container[scan])
            scan += 1
        if len(candidates) < 2:
            index += 1
            continue

        bullet_list = etree.Element("ul", {"class": "clean-list"})
        for candidate in candidates:
            bullet_list.append(clone_as(candidate, "li"))
            container.remove(candidate)
        container.insert(index + 1, bullet_list)
        converted += 1
        index += 2
    return converted


def split_colon_list_leads(document: etree._Element) -> int:
    """Move prose introductions out of lists and split internal list groups."""
    changed = 0
    for bullet_list in list(document.iter("ul")):
        if not has_class(bullet_list, "clean-list") or has_class(
            bullet_list, "clean-list--three"
        ):
            continue
        items = [child for child in bullet_list if child.tag == "li"]
        colon_items = [item for item in items if text_of(item).endswith(":")]
        if not colon_items:
            continue

        replacements: list[etree._Element] = []
        active_list: etree._Element | None = None
        for item in items:
            if text_of(item).endswith(":"):
                lead = clone_as(item, "p")
                add_class(lead, "list-lead")
                replacements.append(lead)
                active_list = None
                continue
            if active_list is None:
                active_list = etree.Element("ul", dict(bullet_list.attrib))
                replacements.append(active_list)
            active_list.append(copy.deepcopy(item))

        parent = bullet_list.getparent()
        if parent is None:
            continue
        position = parent.index(bullet_list)
        for replacement in replacements:
            parent.insert(position, replacement)
            position += 1
        parent.remove(bullet_list)
        changed += len(colon_items)
    return changed


def treatment_title_map() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for path in sorted((ROOT / "treatments").glob("*/index.html")):
        document = parse_page(path)
        h1 = next(document.iter("h1"), None)
        canonical = next(
            (
                element.get("href")
                for element in document.iter("link")
                if element.get("rel") == "canonical"
            ),
            None,
        )
        if h1 is not None and canonical:
            mapping[text_of(h1)] = urlparse(canonical).path
    return mapping


def convert_orphaned_related_links(
    document: etree._Element,
    title_paths: dict[str, str],
) -> int:
    converted = 0
    for parent in list(document.iter()):
        if not isinstance(parent.tag, str):
            continue
        children = list(parent)
        index = 0
        while index < len(children):
            child = children[index]
            if child.tag != "p" or text_of(child) not in title_paths:
                index += 1
                continue

            run: list[etree._Element] = []
            scan = index
            while (
                scan < len(children)
                and children[scan].tag == "p"
                and text_of(children[scan]) in title_paths
            ):
                run.append(children[scan])
                scan += 1

            related = etree.Element(
                "nav",
                {
                    "class": "related-care-links",
                    "aria-label": "Related treatment pages",
                },
            )
            label = etree.SubElement(related, "span", {"class": "quiet-label"})
            label.text = "Related care"
            for paragraph in run:
                title = text_of(paragraph)
                link = etree.SubElement(related, "a", {"href": title_paths[title]})
                link.text = re.sub(r"\s+in Jammu$", "", title)

            position = parent.index(run[0])
            parent.insert(position, related)
            for paragraph in run:
                parent.remove(paragraph)
            converted += len(run)
            children = list(parent)
            index = position + 1
    return converted


def make_contextual_cta(heading: etree._Element) -> etree._Element:
    panel = etree.Element("aside", {"class": "deep-dive-cta"})
    label = etree.SubElement(panel, "span", {"class": "quiet-label"})
    label.text = "Need help choosing?"

    title = etree.SubElement(panel, "h3")
    title.text = text_of(heading)
    if heading.get("id"):
        title.set("id", heading.get("id"))

    description = etree.SubElement(panel, "p")
    description.text = (
        "Request a dermatologist-led assessment at Karan Nagar or Paloura Chowk."
    )

    actions = etree.SubElement(panel, "div", {"class": "deep-dive-actions"})
    book = etree.SubElement(actions, "a", {"class": "button", "href": "/book-appointment/"})
    book.text = "Book an appointment"
    whatsapp = etree.SubElement(
        actions,
        "a",
        {
            "class": "button button-secondary",
            "href": "https://wa.me/917006613362",
            "target": "_blank",
            "rel": "noopener",
        },
    )
    whatsapp.text = "WhatsApp the clinic"
    call = etree.SubElement(
        actions,
        "a",
        {"class": "plain-link", "href": "tel:+917006613362"},
    )
    call.text = "Call 7006613362"
    return panel


def convert_bare_phone_ctas(document: etree._Element) -> int:
    converted = 0
    for heading in list(document.iter()):
        if (
            not isinstance(heading.tag, str)
            or heading.tag not in HEADING_TAGS
            or not is_inside(heading, "article-stack")
            or is_inside(heading, "article-cta")
            or is_inside(heading, "clinic-choice-section")
            or is_inside(heading, "faq-section")
        ):
            continue

        phones: list[etree._Element] = []
        sibling = heading.getnext()
        while sibling is not None and sibling.tag == "p" and phone_only(sibling):
            phones.append(sibling)
            sibling = sibling.getnext()
        if not phones:
            continue

        parent = heading.getparent()
        if parent is None:
            continue
        position = parent.index(heading)
        panel = make_contextual_cta(heading)
        parent.insert(position, panel)
        parent.remove(heading)
        for phone in phones:
            parent.remove(phone)
        converted += 1
    return converted


def is_redundant_operational(element: etree._Element) -> bool:
    if element.tag not in {"p", "h2", "h3"}:
        return False
    value = text_of(element).strip()
    lowered = value.lower().strip("“”\" ")
    simplified = normalise(value)

    if element.tag == "p" and phone_only(element):
        return True
    if lowered.startswith(("landline:", "email:")):
        return True
    if simplified in {
        "karan nagar clinic",
        "paloura clinic",
        "dr cheena langer s timings",
        "procedure hours",
    }:
        return True
    if (
        "aastha skin" in lowered
        and "dermato" in lowered
        and ("180005" in lowered or "181121" in lowered)
    ):
        return True
    if re.match(r"^(monday|mon|sunday|sun)\b", lowered) and re.search(
        r"\d{1,2}:\d{2}\s*(?:am|pm)", lowered
    ):
        return True
    if lowered.startswith(
        (
            "appointments and walk-ins are accepted",
            "same-day appointments may be available",
            "submitting this form requests an appointment",
            "consultation is available at both branches",
        )
    ):
        return True
    return False


def remove_redundant_operational_content(document: etree._Element) -> int:
    removed = 0
    stacks = [element for element in document.iter() if has_class(element, "article-stack")]
    for stack in stacks:
        care = next(
            (element for element in stack.iter() if has_class(element, "care-principles")),
            None,
        )
        if care is None:
            continue
        for element in list(stack.iter()):
            if element is care:
                break
            if not isinstance(element.tag, str) or not is_redundant_operational(element):
                continue
            parent = element.getparent()
            if parent is not None:
                parent.remove(element)
                removed += 1
    return removed


def remove_adjacent_duplicates(document: etree._Element) -> int:
    removed = 0
    for parent in list(document.iter()):
        previous: etree._Element | None = None
        for child in list(parent):
            if (
                previous is not None
                and child.tag == previous.tag == "p"
                and normalise(text_of(child))
                and normalise(text_of(child)) == normalise(text_of(previous))
            ):
                parent.remove(child)
                removed += 1
                continue
            previous = child
    return removed


def remove_empty_sections(document: etree._Element) -> int:
    removed = 0
    for section in list(document.iter("section")):
        if not has_class(section, "article-section"):
            continue
        visible = text_of(section)
        meaningful = [
            child
            for child in section
            if isinstance(child.tag, str) and child.tag not in HEADING_TAGS
        ]
        if not visible or not meaningful:
            parent = section.getparent()
            if parent is not None:
                parent.remove(section)
                removed += 1
    return removed


def make_ids_unique(document: etree._Element) -> int:
    seen: Counter[str] = Counter()
    changed = 0
    for element in document.iter():
        identifier = element.get("id")
        if not identifier:
            continue
        seen[identifier] += 1
        if seen[identifier] == 1:
            continue
        element.set("id", f"{identifier}-{seen[identifier]}")
        changed += 1
    return changed


def format_faq_content(document: etree._Element) -> int:
    converted_lists = 0
    for answer in [element for element in document.iter() if has_class(element, "faq-answer")]:
        for heading in answer.iter():
            if heading is not answer and isinstance(heading.tag, str) and heading.tag in HEADING_TAGS:
                heading.tag = "h3"
                add_class(heading, "faq-answer-heading")
        converted_lists += paragraph_runs_to_lists(answer)
    return converted_lists


def apply_to_page(
    path: Path,
    faq_data: dict[str, dict[str, list[str]]],
    title_paths: dict[str, str],
) -> Counter[str]:
    document = parse_page(path)
    metrics: Counter[str] = Counter()
    page_answers = faq_data.get(path.parent.name, {})

    metrics["faq_sections_promoted"] += promote_missing_faq_sections(document)
    metrics["hifu_shell_fixes"] += standardise_hifu_comparison(document)
    restored, retained = restore_faq_answers(document, page_answers)
    metrics["faq_answers_restored"] += restored
    metrics["faq_answers_retained"] += retained
    metrics["faq_lists_created"] += format_faq_content(document)
    metrics["list_leads_fixed"] += split_colon_list_leads(document)
    metrics["related_links_fixed"] += convert_orphaned_related_links(document, title_paths)
    metrics["contextual_ctas_created"] += convert_bare_phone_ctas(document)
    metrics["duplicated_clinic_lines_removed"] += remove_redundant_operational_content(document)
    metrics["duplicate_paragraphs_removed"] += remove_adjacent_duplicates(document)
    metrics["empty_sections_removed"] += remove_empty_sections(document)
    metrics["duplicate_ids_fixed"] += make_ids_unique(document)
    metrics["editorial_nodes_removed"] += remove_editorial_nodes(document)

    rendered = etree.tostring(
        document,
        encoding="unicode",
        method="html",
        doctype="<!DOCTYPE html>",
    )
    if not rendered.endswith("\n"):
        rendered += "\n"
    original = path.read_text(encoding="utf-8")
    if rendered != original:
        path.write_text(rendered, encoding="utf-8")
        metrics["pages_changed"] += 1
    return metrics


def main() -> int:
    if not FAQ_DATA.exists():
        raise FileNotFoundError(
            f"Missing {FAQ_DATA}. Build it with build_release_v27_faq_data.py."
        )
    faq_data = json.loads(FAQ_DATA.read_text(encoding="utf-8"))
    title_paths = treatment_title_map()
    totals: Counter[str] = Counter()

    for path in sorted((ROOT / "treatments").glob("*/index.html")):
        totals.update(apply_to_page(path, faq_data, title_paths))

    for key in sorted(totals):
        print(f"{key.replace('_', ' ').title()}: {totals[key]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
