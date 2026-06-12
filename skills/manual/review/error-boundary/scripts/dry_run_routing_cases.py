#!/usr/bin/env python3
"""Dry-run prompt routing cases for ng-review-error-boundary.

This does not call a model. It is a deliberately small, transparent heuristic
that protects the fixture labels from drifting away from the skill's routing
rules. Run from the skill directory:

    python3 scripts/dry_run_routing_cases.py
    python3 scripts/dry_run_routing_cases.py --report
    python3 scripts/dry_run_routing_cases.py --json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "references" / "routing-cases.json"

BOUNDARY_TERMS = [
    "boundary",
    "classification",
    "retry",
    "fallback",
    "degradation",
    "degrade",
    "cause preservation",
    "cause",
    "public error code",
    "public response",
    "error code safety",
    "sql state",
    "sqlstate",
    "db_error",
    "sdk adapter",
    "provider exceptions",
]

CONCRETE_TERMS = [
    "services/",
    "handlers/",
    "repository",
    "handler",
    "adapter",
    "cli",
    "diff",
    "module",
]

NO_TRIGGER_TERMS = [
    "syntax",
    "how `raise from` works",
    "explain the difference",
    "what is an http",
    "in general",
]

VAGUE_TERMS = [
    "check our errors",
    "before launch",
    "sometimes see db_error",
    "should we change it",
]


def route_prompt(prompt: str) -> str:
    """Return TRIGGER, NO_TRIGGER, or NARROW_FIRST for a compact eval prompt."""
    text = prompt.lower()

    if any(term in text for term in NO_TRIGGER_TERMS):
        return "NO_TRIGGER"

    has_boundary = any(term in text for term in BOUNDARY_TERMS)
    has_concrete = any(term in text for term in CONCRETE_TERMS) or "`" in prompt
    is_vague = any(term in text for term in VAGUE_TERMS)

    if has_boundary and has_concrete and not is_vague:
        return "TRIGGER"
    if has_boundary or is_vague:
        return "NARROW_FIRST"
    return "NO_TRIGGER"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Dry-run ng-review-error-boundary prompt routing fixtures.",
    )
    parser.add_argument(
        "--report",
        action="store_true",
        help="print one readable PASS/FAIL line per routing case",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="print machine-readable routing results for CI or agent handoff",
    )
    return parser.parse_args()


def format_case_report(case: dict, actual: str) -> str:
    case_id = case.get("id", "<missing-id>")
    expected = case.get("expected_route", "<missing-route>")
    status = "PASS" if actual == expected else "FAIL"
    prompt = case.get("prompt", "").replace("\n", " ")
    if len(prompt) > 96:
        prompt = f"{prompt[:93]}..."
    return f"{status} {case_id}: expected={expected} actual={actual} prompt={prompt}"


def format_case_result(case: dict, actual: str) -> dict:
    expected = case.get("expected_route")
    return {
        "id": case.get("id", "<missing-id>"),
        "expected_route": expected,
        "actual_route": actual,
        "passed": actual == expected,
        "must_mention": case.get("must_mention", []),
        "must_avoid": case.get("must_avoid", []),
    }


def main() -> int:
    args = parse_args()
    cases = json.loads(FIXTURE.read_text(encoding="utf-8"))
    failures: list[str] = []
    reports: list[str] = []
    results: list[dict] = []

    for case in cases:
        case_id = case.get("id", "<missing-id>")
        prompt = case.get("prompt", "")
        expected = case.get("expected_route")
        actual = route_prompt(prompt)
        reports.append(format_case_report(case, actual))
        results.append(format_case_result(case, actual))
        if actual != expected:
            failures.append(f"{case_id}: expected {expected}, got {actual}")

    if args.json:
        payload = {
            "skill": "ng-review-error-boundary",
            "case_count": len(cases),
            "failure_count": len(failures),
            "results": results,
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 1 if failures else 0

    if args.report:
        for report in reports:
            print(report)

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    print(f"dry-ran {len(cases)} routing cases for ng-review-error-boundary")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
