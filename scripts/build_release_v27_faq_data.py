#!/usr/bin/env python3
"""Build the release-v27 FAQ recovery data from the last complete source.

The v24 rebuild retained each FAQ's first paragraph but accidentally dropped
the remaining paragraphs and lists.  This utility pairs the current FAQ
questions with their complete answers in the pre-rebuild source and writes a
portable JSON data file used by ``apply_release_v27_content_integrity.py``.

Run from the repository root:

    python scripts/build_release_v27_faq_data.py \
      --legacy-root ../aastha-skin-centre-source-pre-rebuild
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import unicodedata
from pathlib import Path

from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "scripts" / "release_v27_faq_answers.json"
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


def is_inside(element: etree._Element, class_name: str) -> bool:
    return any(has_class(ancestor, class_name) for ancestor in element.iterancestors())


def is_editorial(element: etree._Element) -> bool:
    value = text_of(element).strip().lower()
    return any(value.startswith(prefix) for prefix in EDITORIAL_PREFIXES)


def answer_nodes(
    heading: etree._Element,
    next_question: str | None,
) -> list[etree._Element]:
    level = int(heading.tag[1])
    nodes: list[etree._Element] = []
    for sibling in heading.itersiblings():
        if isinstance(sibling.tag, str) and sibling.tag in {"h1", "h2", "h3"}:
            if int(sibling.tag[1]) <= level:
                break
        if isinstance(sibling.tag, str) and not is_editorial(sibling):
            nodes.append(copy.deepcopy(sibling))

    # One legacy pattern uses same-level headings for named techniques after a
    # colon-only introduction (for example Electrosurgery, Snip removal and
    # Cryotherapy beneath "How are skin tags removed?").  Extend only this
    # structurally clear case; broad next-question boundaries can otherwise
    # absorb legacy CTA/disclaimer authoring blocks into an FAQ answer.
    if (
        next_question
        and len(nodes) == 1
        and nodes[0].tag == "p"
        and text_of(nodes[0]).endswith(":")
    ):
        extended: list[etree._Element] = []
        for sibling in heading.itersiblings():
            if (
                isinstance(sibling.tag, str)
                and sibling.tag in {"h1", "h2", "h3"}
                and normalise(text_of(sibling)) == normalise(next_question)
            ):
                break
            if isinstance(sibling.tag, str) and not is_editorial(sibling):
                extended.append(copy.deepcopy(sibling))
        if len(extended) > len(nodes):
            nodes = extended
    return nodes


def current_faq_questions(document: etree._Element) -> list[str]:
    questions: list[str] = []
    for details in document.iter("details"):
        if not is_inside(details, "faq-clean-list"):
            continue
        summary = next((child for child in details if child.tag == "summary"), None)
        if summary is not None:
            questions.append(text_of(summary))
    return questions


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--legacy-root",
        type=Path,
        required=True,
        help="Path to the complete pre-v24 website source.",
    )
    args = parser.parse_args()
    legacy_root = args.legacy_root.resolve()

    data: dict[str, dict[str, list[str]]] = {}
    matched = 0
    unmatched: list[str] = []

    for current_path in sorted((ROOT / "treatments").glob("*/index.html")):
        relative = current_path.relative_to(ROOT)
        legacy_path = legacy_root / relative
        if not legacy_path.exists():
            raise FileNotFoundError(f"Missing legacy page: {legacy_path}")

        current = parse_page(current_path)
        legacy = parse_page(legacy_path)
        headings: dict[str, list[etree._Element]] = {}
        for element in legacy.iter():
            if isinstance(element.tag, str) and element.tag in {"h1", "h2", "h3"}:
                headings.setdefault(normalise(text_of(element)), []).append(element)

        page_answers: dict[str, list[str]] = {}
        questions = current_faq_questions(current)
        for index, question in enumerate(questions):
            candidates = headings.get(normalise(question), [])
            if not candidates:
                unmatched.append(f"{current_path.parent.name}: {question}")
                continue
            next_question = questions[index + 1] if index + 1 < len(questions) else None
            nodes = answer_nodes(candidates[-1], next_question)
            if not nodes:
                unmatched.append(f"{current_path.parent.name}: {question} (empty)")
                continue
            page_answers[question] = [
                etree.tostring(node, encoding="unicode", method="html")
                for node in nodes
            ]
            matched += 1

        data[current_path.parent.name] = page_answers

    OUTPUT.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"FAQ answers recovered: {matched}")
    print(f"FAQ questions retained from current source: {len(unmatched)}")
    for item in unmatched:
        print(f"  - {item}")
    print(f"Data file: {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
