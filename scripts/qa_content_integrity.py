#!/usr/bin/env python3
"""Validate visual-content integrity that ordinary link/build QA cannot see."""

from __future__ import annotations

import html
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

from lxml import etree

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
PHONE_ONLY = re.compile(
    r"(?:91)?(?:7006613362|9796676541|01913509230|01913135864)"
)
EDITORIAL_MARKERS = (
    "suggested internal link",
    "implementation note",
    "editorial note",
    "content-ready template",
)
REQUIRED_TREATMENT_COMPONENTS = (
    "care-principles",
    "clinic-choice-section",
    "faq-section",
    "article-cta",
)
EXCLUDED_PARTS = {
    ".git",
    ".venv",
    "backups",
    "content-drop",
    "dist",
    "reports",
    "schema-drop",
    "tools",
}


def parse(path: Path) -> etree._Element:
    parser = etree.HTMLParser(remove_blank_text=False)
    document = etree.fromstring(path.read_bytes(), parser)
    if document is None:
        raise ValueError(f"Could not parse {path}")
    return document


def text_of(element: etree._Element) -> str:
    return " ".join(" ".join(element.itertext()).split())


def has_class(element: etree._Element, class_name: str) -> bool:
    return class_name in (element.get("class") or "").split()


def is_inside(element: etree._Element, class_name: str) -> bool:
    return any(has_class(ancestor, class_name) for ancestor in element.iterancestors())


def phone_only(element: etree._Element) -> bool:
    compact = re.sub(r"[\s()\-+]", "", text_of(element))
    return bool(PHONE_ONLY.fullmatch(compact))


def source_pages() -> list[Path]:
    return [
        path
        for path in sorted(ROOT.rglob("*.html"))
        if not any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts)
    ]


def treatment_title_map() -> set[str]:
    titles = set()
    for path in sorted((ROOT / "treatments").glob("*/index.html")):
        document = parse(path)
        h1 = next(document.iter("h1"), None)
        if h1 is not None:
            titles.add(text_of(h1))
    return titles


def main() -> int:
    issues: list[dict[str, str]] = []
    metrics: Counter[str] = Counter()
    treatment_titles = treatment_title_map()

    def add(path: Path, message: str) -> None:
        issues.append(
            {
                "level": "ERROR",
                "file": path.relative_to(ROOT).as_posix(),
                "message": message,
            }
        )

    for path in source_pages():
        document = parse(path)
        relative = path.relative_to(ROOT)

        ids = [element.get("id") for element in document.iter() if element.get("id")]
        duplicates = sorted(identifier for identifier, count in Counter(ids).items() if count > 1)
        if duplicates:
            add(path, "Duplicate HTML id(s): " + ", ".join(duplicates))

        lowered_source = path.read_text(encoding="utf-8", errors="ignore").lower()
        for marker in EDITORIAL_MARKERS:
            if marker in lowered_source:
                add(path, f"Visible editorial marker remains: {marker}")

        for parent in document.iter():
            previous: etree._Element | None = None
            for child in parent:
                if (
                    previous is not None
                    and child.tag == previous.tag == "p"
                    and text_of(child)
                    and text_of(child).casefold() == text_of(previous).casefold()
                ):
                    add(path, f"Adjacent duplicate paragraph: {text_of(child)[:100]}")
                previous = child

        is_treatment_detail = (
            len(relative.parts) == 3
            and relative.parts[0] == "treatments"
            and relative.parts[-1] == "index.html"
        )
        if not is_treatment_detail:
            continue

        metrics["treatment_pages"] += 1
        for class_name in REQUIRED_TREATMENT_COMPONENTS:
            if not any(has_class(element, class_name) for element in document.iter()):
                add(path, f"Missing shared treatment component: .{class_name}")

        if "Results may vary from person to person." not in text_of(document):
            add(path, "Medical disclaimer text is missing.")

        for section in document.iter("section"):
            if not has_class(section, "article-section"):
                continue
            meaningful = [
                child
                for child in section
                if isinstance(child.tag, str)
                and child.tag not in {"h1", "h2", "h3", "h4", "h5", "h6"}
            ]
            if not text_of(section) or not meaningful:
                add(path, "Empty or heading-only .article-section remains.")

        for paragraph in document.iter("p"):
            if is_inside(paragraph, "article-stack") and phone_only(paragraph):
                add(path, f"Bare phone-number paragraph remains: {text_of(paragraph)}")
            if text_of(paragraph) in treatment_titles:
                add(path, f"Orphaned related-page title remains: {text_of(paragraph)}")

        for item in document.iter("li"):
            if is_inside(item, "clean-list") and text_of(item).endswith(":"):
                add(path, f"List introduction is still a bullet: {text_of(item)}")

        for details in document.iter("details"):
            if not is_inside(details, "faq-clean-list"):
                continue
            metrics["faq_items"] += 1
            summary = next((child for child in details if child.tag == "summary"), None)
            answer = next(
                (
                    child
                    for child in details
                    if isinstance(child.tag, str) and has_class(child, "faq-answer")
                ),
                None,
            )
            if summary is None or not text_of(summary):
                add(path, "FAQ item has no readable summary.")
                continue
            if answer is None:
                add(path, f'FAQ "{text_of(summary)}" has no .faq-answer.')
                continue

            answer_text = text_of(answer)
            if len(answer_text.split()) < 12:
                add(path, f'FAQ "{text_of(summary)}" is still truncated ({len(answer_text.split())} words).')
            if answer_text.endswith(":"):
                add(path, f'FAQ "{text_of(summary)}" ends with an incomplete colon.')
            for nested in answer.iter():
                if nested is answer or not isinstance(nested.tag, str):
                    continue
                nested_text = text_of(nested).strip().casefold()
                if nested.tag in {"h1", "h2", "h3", "h4", "h5", "h6"} and nested_text in {
                    "end cta",
                    "medical disclaimer",
                }:
                    add(
                        path,
                        f'FAQ "{text_of(summary)}" contains a legacy authoring heading: {text_of(nested)}.',
                    )
                if has_class(nested, "medical-disclaimer"):
                    add(
                        path,
                        f'FAQ "{text_of(summary)}" contains a duplicated medical disclaimer.',
                    )

            children = [child for child in answer if isinstance(child.tag, str)]
            for index, child in enumerate(children):
                if child.tag == "p" and text_of(child).endswith(":"):
                    following = children[index + 1] if index + 1 < len(children) else None
                    if following is None or following.tag not in {"ul", "ol", "h3"}:
                        add(
                            path,
                            f'FAQ "{text_of(summary)}" has a list lead without structured content.',
                        )

        for panel in [
            element for element in document.iter() if has_class(element, "deep-dive-cta")
        ]:
            metrics["contextual_ctas"] += 1
            hrefs = {
                link.get("href", "")
                for link in panel.iter("a")
            }
            if "/book-appointment/" not in hrefs:
                add(path, "Contextual CTA is missing the appointment link.")
            if not any(href.startswith("https://wa.me/") for href in hrefs):
                add(path, "Contextual CTA is missing the WhatsApp link.")
            if not any(href.startswith("tel:") for href in hrefs):
                add(path, "Contextual CTA is missing the call link.")

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    json_path = REPORT_DIR / f"content-integrity-{stamp}.json"
    html_path = REPORT_DIR / f"content-integrity-{stamp}.html"
    json_path.write_text(json.dumps(issues, ensure_ascii=False, indent=2), encoding="utf-8")

    rows = "\n".join(
        f"<tr><td>{html.escape(issue['file'])}</td><td>{html.escape(issue['message'])}</td></tr>"
        for issue in issues
    )
    html_path.write_text(
        f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Aastha Content Integrity QA</title>
<style>
body{{font-family:Arial,sans-serif;margin:32px;color:#242124}}
h1{{color:#7b1e3a}} .metrics{{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}}
.metric{{padding:8px 12px;border-radius:999px;background:#f5eef1;font-weight:700}}
table{{width:100%;border-collapse:collapse}} th,td{{border:1px solid #ddd;padding:9px;text-align:left}}
th{{background:#7b1e3a;color:#fff}}
</style></head><body><h1>Aastha Content Integrity QA</h1>
<div class="metrics">
<span class="metric">Treatment pages: {metrics['treatment_pages']}</span>
<span class="metric">FAQ items: {metrics['faq_items']}</span>
<span class="metric">Contextual CTAs: {metrics['contextual_ctas']}</span>
<span class="metric">Errors: {len(issues)}</span>
</div><table><thead><tr><th>File</th><th>Issue</th></tr></thead><tbody>{rows}</tbody></table>
</body></html>""",
        encoding="utf-8",
    )

    print(
        "Content integrity: "
        f"{metrics['treatment_pages']} treatment pages | "
        f"{metrics['faq_items']} FAQs | "
        f"{metrics['contextual_ctas']} contextual CTAs"
    )
    print(f"Errors: {len(issues)}")
    print(f"HTML report: {html_path}")
    print(f"JSON report: {json_path}")
    return 2 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
