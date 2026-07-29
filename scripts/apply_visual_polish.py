#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKUPS = ROOT / "backups"
REPORTS = ROOT / "reports"

EXCLUDED = {
    ".venv", ".git", ".github", "backups", "reports", "content-drop",
    "schema-drop", "dist", "tools", "deployment", "_project-docs",
    "_legacy-tools", "post-template"
}

CSS_TAG = '<link rel="stylesheet" href="/assets/css/polish.css">'
JS_TAG = '<script src="/assets/js/polish.js" defer></script>'

def public_html_files():
    for path in ROOT.rglob("*.html"):
        if any(part in EXCLUDED for part in path.parts):
            continue
        yield path

def main() -> int:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_root = BACKUPS / f"visual-polish-{stamp}"
    changed = []

    for path in sorted(public_html_files()):
        before = path.read_text(encoding="utf-8", errors="ignore")
        after = before

        if "/assets/css/polish.css" not in after:
            if '<link rel="stylesheet" href="/assets/css/styles.css">' in after:
                after = after.replace(
                    '<link rel="stylesheet" href="/assets/css/styles.css">',
                    '<link rel="stylesheet" href="/assets/css/styles.css">\n  ' + CSS_TAG,
                    1
                )
            else:
                after = after.replace("</head>", "  " + CSS_TAG + "\n</head>", 1)

        if "/assets/js/polish.js" not in after:
            after = after.replace("</body>", "  " + JS_TAG + "\n</body>", 1)

        if after == before:
            continue

        backup = backup_root / path.relative_to(ROOT)
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, backup)
        path.write_text(after, encoding="utf-8")
        changed.append(str(path.relative_to(ROOT)).replace("\\", "/"))

    REPORTS.mkdir(exist_ok=True)
    report = REPORTS / f"visual-polish-applied-{stamp}.txt"
    report.write_text(
        "\n".join([
            "Aastha Visual Polish Patch",
            f"Changed pages: {len(changed)}",
            "",
            *changed
        ]),
        encoding="utf-8"
    )

    print(f"Changed pages: {len(changed)}")
    print(f"Report: {report}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
