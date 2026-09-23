#!/usr/bin/env python3
"""Bundle layered concept CSS/JS into two content-hashed preview assets."""
from __future__ import annotations

import hashlib
from pathlib import Path

CSS_FILES = [
    "editorial-experience-v3.css",
    "editorial-experience-v3-fixes.css",
    "editorial-experience-v4.css",
    "editorial-experience-v5.css",
    "editorial-experience-v6.css",
    "editorial-experience-v6-fixes.css",
    "editorial-experience-v7.css",
    "editorial-experience-v8.css",
    "editorial-experience-v10.css",
    "editorial-experience-v11.css",
    "editorial-experience-v12.css",
    "editorial-experience-v14.css",
    "editorial-experience-v15.css",
    "editorial-experience-v16.css",
    "editorial-experience-v17.css",
    "editorial-experience-v18.css",
    "editorial-experience-v19.css",
    "editorial-experience-v20.css",
    "editorial-experience-v21.css",
    "editorial-experience-v22.css",
    "editorial-experience-v23.css",
    "editorial-experience-v24.css",
    "editorial-experience-v25.css",
    "editorial-experience-v26.css",
    "editorial-experience-v27.css",
    "editorial-experience-v28.css",
    "editorial-experience-v29.css",
    "editorial-experience-v30.css",
    "editorial-experience-v31.css",
    "editorial-experience-v32.css",
    "editorial-experience-v33.css",
    "editorial-experience-v34.css",
    "editorial-experience-v35.css",
    "editorial-experience-v36.css",
    "editorial-experience-v36-media.css",
    "editorial-experience-v37-motion.css",
    "editorial-experience-v38-refinement.css",
    "editorial-experience-v39-explore.css",
    "editorial-experience-v40-admin-insights.css",
    "editorial-experience-v41-interaction.css",
    "editorial-experience-v43-a11y.css",
    "editorial-experience-v44-rhythm.css",
    "editorial-experience-v46-nav-state.css",
    "editorial-experience-v47-media-authority.css",
    "editorial-experience-v48-visibility.css",
    "editorial-experience-v49-polish.css",
]

JS_FILES = [
    "editorial-experience-v3.js",
    "editorial-experience-v3-fixes.js",
    "editorial-experience-v4.js",
    "editorial-experience-v5.js",
    "editorial-experience-v5-fixes.js",
    "editorial-experience-v6.js",
    "editorial-experience-v6-polish.js",
    "editorial-experience-v7.js",
    "editorial-experience-v7-polish.js",
    "editorial-experience-v8.js",
    "editorial-experience-v11.js",
    "editorial-experience-v11-migrations.js",
    "editorial-experience-v12.js",
    "editorial-experience-v13-migrations.js",
    "editorial-experience-v16.js",
    "editorial-experience-v18.js",
    "editorial-experience-v20.js",
    "editorial-experience-v21.js",
    "editorial-experience-v22.js",
    "editorial-experience-v23.js",
    # v24 runtime intentionally omitted: v25 replaced its generic navigator.
    "editorial-experience-v25.js",
    "editorial-experience-v26.js",
    "editorial-experience-v27.js",
    "editorial-experience-v27-bridge.js",
    "editorial-experience-v28.js",
    "editorial-experience-v29.js",
    "editorial-experience-v30.js",
    "editorial-experience-v31.js",
    "editorial-experience-v32.js",
    "editorial-experience-v34.js",
    "editorial-experience-v35.js",
    "editorial-experience-v36-media.js",
    "editorial-experience-v36.js",
    "editorial-experience-v37-motion.js",
    "editorial-experience-v38-refinement.js",
    "editorial-experience-v39-explore.js",
    "editorial-experience-v41-interaction.js",
    "editorial-experience-v43-a11y.js",
    "editorial-experience-v45-micro-motion.js",
    "editorial-experience-v46-nav-state.js",
    "editorial-experience-v49-polish.js",
]


def _bundle(folder: Path, filenames: list[str], kind: str) -> tuple[str, Path]:
    chunks: list[str] = []
    for name in filenames:
        source = folder / name
        if not source.exists():
            raise RuntimeError(f"Missing concept {kind} source: {source}")
        chunks.append(f"/* ---- {name} ---- */\n{source.read_text(encoding='utf-8').rstrip()}\n")
    content = "\n".join(chunks)
    digest = hashlib.sha256(content.encode("utf-8")).hexdigest()[:12]
    suffix = ".css" if kind == "css" else ".js"
    target = folder / f"editorial-experience.bundle.{digest}{suffix}"
    target.write_text(content, encoding="utf-8")
    url = "/" + target.relative_to(folder.parents[1]).as_posix()
    return url, target


def bundle_concept_assets(dist: Path, concept_pages: list[Path]) -> tuple[str, str, int]:
    css_dir = dist / "assets" / "css"
    js_dir = dist / "assets" / "js"
    css_url, _ = _bundle(css_dir, CSS_FILES, "css")
    js_url, _ = _bundle(js_dir, JS_FILES, "js")

    css_tags = [f'<link rel="stylesheet" href="/assets/css/{name}">' for name in CSS_FILES]
    js_tags = [f'<script src="/assets/js/{name}" defer></script>' for name in JS_FILES]
    js_tags.append('<script src="/assets/js/editorial-experience-v24.js" defer></script>')
    bundle_css_tag = f'<link rel="stylesheet" href="{css_url}">'
    bundle_js_tag = f'<script src="{js_url}" defer></script>'

    changed = 0
    for page in concept_pages:
        source = page.read_text(encoding="utf-8")
        updated = source
        for tag in css_tags:
            updated = updated.replace(tag, "")
        for tag in js_tags:
            updated = updated.replace(tag, "")
        if bundle_css_tag not in updated:
            updated = updated.replace("</head>", f"{bundle_css_tag}</head>", 1)
        if bundle_js_tag not in updated:
            updated = updated.replace("</body>", f"{bundle_js_tag}</body>", 1)
        if updated != source:
            page.write_text(updated, encoding="utf-8")
            changed += 1

    print(f"Concept bundles: {css_url} + {js_url} across {changed} pages")
    return css_url, js_url, changed
