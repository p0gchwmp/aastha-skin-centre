#!/usr/bin/env python3
"""Run a read-only Manus API v2 QA review against the editorial concept preview.

Requires MANUS_API_KEY. The task is explicitly instructed not to submit forms,
send messages, call phone links, log in, or modify remote data.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from urllib import parse, request

API_ROOT = "https://api.manus.ai/v2"


def api_json(url: str, *, key: str, method: str = "GET", payload: dict | None = None) -> dict:
    data = None
    headers = {"x-manus-api-key": key}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = request.Request(url, data=data, headers=headers, method=method)
    with request.urlopen(req, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def schema() -> dict:
    item = {
        "type": "object",
        "properties": {
            "page": {"type": "string"},
            "issue": {"type": "string"},
            "evidence": {"type": "string"},
        },
        "required": ["page", "issue", "evidence"],
        "additionalProperties": False,
    }
    check = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "status": {"type": "string", "enum": ["pass", "warn", "fail", "not_checked"]},
            "notes": {"type": "string"},
        },
        "required": ["name", "status", "notes"],
        "additionalProperties": False,
    }
    return {
        "type": "object",
        "properties": {
            "summary": {"type": "string"},
            "blockers": {"type": "array", "items": item},
            "warnings": {"type": "array", "items": item},
            "checks": {"type": "array", "items": check},
        },
        "required": ["summary", "blockers", "warnings", "checks"],
        "additionalProperties": False,
    }


def create_task(key: str, base_url: str, profile: str) -> dict:
    base = base_url.rstrip("/")
    routes = [
        "/",
        "/concept/dr-cheena-langer/",
        "/concept/conditions/",
        "/concept/treatments/",
        "/concept/acne-treatment/",
        "/concept/pigmentation-treatment/",
        "/concept/book-appointment/",
        "/concept/locations/karan-nagar/",
        "/concept/locations/paloura/",
        "/concept/blog/",
    ]
    route_text = "\n".join(f"- {base}{route}" for route in routes)
    prompt = f"""Perform a read-only pre-launch QA review of Aastha Skin Centre's editorial concept preview.

Review these routes:
{route_text}

Rules:
- Do not submit appointment/contact forms.
- Do not send WhatsApp messages, make calls, log in, publish, or modify any data.
- Review desktop and mobile layouts where possible.
- Check navigation, the Explore command palette, concern explorer, Find Your Route, treatment rail, care-process navigation, doctor section, clinic switcher, FAQs, and obvious broken links.
- Check keyboard/focus behavior and reduced-motion behavior where inspectable.
- Check that this concept preview remains non-indexable and flag visible canonical/schema/SEO anomalies.
- Flag missing/broken images, horizontal overflow, overlapping or clipped text, hidden critical content, inaccessible controls, misleading medical claims, prototype/debug wording, or fake analytics.
- Distinguish launch blockers from non-blocking warnings.
- Base findings only on what you actually observe. If something cannot be checked, mark it not_checked.
- Return concise evidence tied to the specific page.
"""
    payload = {
        "title": "Aastha editorial concept QA",
        "agent_profile": profile,
        "interactive_mode": False,
        "hide_in_task_list": False,
        "share_visibility": "private",
        "message": {"content": prompt},
        "structured_output_schema": schema(),
    }
    result = api_json(f"{API_ROOT}/task.create", key=key, method="POST", payload=payload)
    if not result.get("ok"):
        raise RuntimeError(json.dumps(result, indent=2))
    return result


def poll_result(key: str, task_id: str, timeout_seconds: int, poll_seconds: int) -> dict:
    deadline = time.monotonic() + timeout_seconds
    last_status = "running"
    while time.monotonic() < deadline:
        query = parse.urlencode({"task_id": task_id, "order": "desc", "limit": 100})
        data = api_json(f"{API_ROOT}/task.listMessages?{query}", key=key)
        if not data.get("ok"):
            raise RuntimeError(json.dumps(data, indent=2))

        for message in data.get("messages", []):
            kind = message.get("type")
            if kind == "structured_output_result":
                result = message.get("structured_output_result", {})
                if not result.get("success"):
                    raise RuntimeError(result.get("error") or "Manus structured output failed")
                return result.get("value", {})
            if kind == "error_message":
                error = message.get("error_message", {})
                raise RuntimeError(error.get("content") or "Manus task failed")
            if kind == "status_update":
                status = message.get("status_update", {})
                last_status = status.get("agent_status", last_status)
                if last_status == "error":
                    raise RuntimeError("Manus task entered error state")
                if last_status == "waiting":
                    raise RuntimeError("Manus QA unexpectedly requires user input")

        time.sleep(max(3, poll_seconds))

    raise TimeoutError(f"Timed out waiting for Manus QA; last status={last_status}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="https://aastha-editorial-concept-preview.onrender.com")
    parser.add_argument("--profile", choices=("lite", "standard", "max"), default="standard")
    parser.add_argument("--timeout-seconds", type=int, default=900)
    parser.add_argument("--poll-seconds", type=int, default=15)
    parser.add_argument("--output", type=Path, default=Path("audit-artifacts/manus-concept-qa.json"))
    args = parser.parse_args()

    key = os.environ.get("MANUS_API_KEY", "").strip()
    if not key:
        print("MANUS_API_KEY is required.", file=sys.stderr)
        return 2

    task = create_task(key, args.base_url, args.profile)
    print(f"Created Manus QA task: {task['task_url']}")
    result = poll_result(key, task["task_id"], args.timeout_seconds, args.poll_seconds)

    payload = {
        "task_id": task["task_id"],
        "task_url": task["task_url"],
        "base_url": args.base_url,
        "result": result,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
