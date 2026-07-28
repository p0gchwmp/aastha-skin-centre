#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "assets" / "data" / "site-config.json"
BACKUPS = ROOT / "backups"
REPORTS = ROOT / "reports"

def load_config():
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))

def add_theme_init(text: str) -> str:
    if "/assets/js/theme-init.js" in text:
        return text
    marker = '<meta name="viewport" content="width=device-width,initial-scale=1">'
    if marker in text:
        return text.replace(marker, marker + '\n  <script src="/assets/js/theme-init.js"></script>', 1)
    return text.replace("</head>", '  <script src="/assets/js/theme-init.js"></script>\n</head>', 1)

def replace_visible_facts(text: str, config: dict) -> str:
    clinic = config["clinic"]
    contact = config["contact"]
    locations = config["locations"]
    fee = f'{clinic["currency_symbol"]}{clinic["consultation_fee"]}'
    days = str(clinic["follow_up_days"])

    replacements = [
        (r"₹\s*500", fee),
        (r"within\s+10\s+days", f"within {days} days"),
        (r"10-day", f"{days}-day"),
        (r"ten-day", f"{days}-day"),
        (r"7006613362", contact["primary_mobile"]),
        (r"9796676541", contact["secondary_mobile"]),
        (r"0191-3509230", locations["karan_nagar"]["landline"]),
        (r"0191-3135864", locations["paloura"]["landline"]),
        (re.escape("https://maps.app.goo.gl/pHCQ1r4crKuZBSi98"), locations["karan_nagar"]["google_maps"]),
        (re.escape("https://maps.app.goo.gl/kh4AqZoUkscpEgWc8"), locations["paloura"]["google_maps"]),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, str(replacement), text, flags=re.I)
    return text

def update_schema_objects(value, config):
    if isinstance(value, list):
        return [update_schema_objects(item, config) for item in value]
    if not isinstance(value, dict):
        return value

    output = {key: update_schema_objects(item, config) for key, item in value.items()}
    item_type = output.get("@type")
    item_id = str(output.get("@id", ""))
    contact = config["contact"]
    clinic = config["clinic"]
    locations = config["locations"]

    if item_type in {"Physician", "MedicalOrganization"}:
        output["telephone"] = [
            f'+91-{contact["primary_mobile"]}',
            f'+91-{contact["secondary_mobile"]}'
        ]
        if "email" in output or item_type == "MedicalOrganization":
            output["email"] = clinic["email"]

    if item_type == "MedicalClinic":
        if "karan-nagar" in item_id or "Karan Nagar" in str(output.get("name", "")):
            loc = locations["karan_nagar"]
            output["telephone"] = [
                f'+91-{contact["primary_mobile"]}',
                f'+91-{contact["secondary_mobile"]}',
                f'+91-{loc["landline"]}'
            ]
            output["hasMap"] = loc["google_maps"]
            output["email"] = clinic["email"]
        elif "paloura" in item_id.lower() or "Paloura" in str(output.get("name", "")):
            loc = locations["paloura"]
            output["telephone"] = [
                f'+91-{contact["primary_mobile"]}',
                f'+91-{contact["secondary_mobile"]}',
                f'+91-{loc["landline"]}'
            ]
            output["hasMap"] = loc["google_maps"]
            output["email"] = clinic["email"]
    return output

def update_jsonld(text: str, config: dict) -> str:
    pattern = re.compile(
        r'(<script\s+type="application/ld\+json">)(.*?)(</script>)',
        flags=re.I | re.S
    )
    def repl(match):
        try:
            data = json.loads(match.group(2))
            data = update_schema_objects(data, config)
            return match.group(1) + "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n" + match.group(3)
        except Exception:
            return match.group(0)
    return pattern.sub(repl, text)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    config = load_config()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_root = BACKUPS / f"global-settings-{stamp}"
    changed = []

    for path in sorted(ROOT.rglob("*.html")):
        if any(part in {"backups", "reports", "content-drop", "schema-drop"} for part in path.parts):
            continue
        before = path.read_text(encoding="utf-8", errors="ignore")
        after = add_theme_init(before)
        after = replace_visible_facts(after, config)
        after = update_jsonld(after, config)
        if after == before:
            continue
        changed.append(str(path.relative_to(ROOT)).replace("\\", "/"))
        if not args.dry_run:
            target = backup_root / path.relative_to(ROOT)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            path.write_text(after, encoding="utf-8")

    REPORTS.mkdir(exist_ok=True)
    report = REPORTS / f"global-settings-{'dry-run' if args.dry_run else 'applied'}-{stamp}.txt"
    report.write_text(
        "\n".join([
            f"Mode: {'dry-run' if args.dry_run else 'applied'}",
            f"Config: {CONFIG_PATH}",
            f"Changed pages: {len(changed)}",
            "",
            *changed
        ]),
        encoding="utf-8"
    )
    print(f"Changed pages: {len(changed)}")
    print(f"Report: {report}")

if __name__ == "__main__":
    main()
