#!/usr/bin/env python3
"""Lightweight regression checks for the error-boundary review skill.

Run from the skill directory:

    python3 scripts/validate_error_boundary_skill.py

The checks intentionally avoid external dependencies so the skill can be
validated in a minimal agent/runtime environment.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "SKILL.md",
    "skill.yaml",
    "references/trigger-examples.md",
    "references/language-probes.md",
    "references/sample-review-output.md",
    "references/near-miss-eval.md",
    "references/routing-cases.json",
    "scripts/dry_run_routing_cases.py",
]

REQUIRED_SKILL_REFERENCES = [
    "references/language-probes.md",
    "references/sample-review-output.md",
    "references/trigger-examples.md",
    "references/near-miss-eval.md",
    "references/routing-cases.json",
    "scripts/dry_run_routing_cases.py",
    "--report",
    "--json",
    "--output",
    "scripts/validate_error_boundary_skill.py",
    "Decision Table",
    "P0",
    "P1",
    "P2",
]

REQUIRED_TRIGGER_KEYWORDS = [
    "error boundary review",
    "error handling review",
    "retry policy review",
    "public error code",
    "database error leak",
    "sdk error leak",
    "错误边界",
    "错误处理审查",
    "重试策略",
    "降级策略",
]

REQUIRED_SAMPLE_MARKERS = [
    "DB_ERROR",
    "SQLSTATE",
    "Cause/context preservation",
    "hidden retry/degrade ownership",
    "PR Comment Form",
    "[error-boundary][P0]",
    "[error-boundary][P1]",
    "[error-boundary][P2]",
    "PR-comments-only mode",
    "PR-comments-only mini fixture",
    "## Error Boundary PR Comments",
    "1–3 focused comments",
    "omit the full decision table",
    "Only give me PR comments for this diff",
    "services/profile/http.ts",
    "concrete relative path evidence",
    "does not invent line numbers",
    "hidden implementation details",
    "timeout recovery is classified by string parsing",
    "root cause chain",
    "Expected decision-table row",
    "Suggested tests",
    "Eval Rubric",
]

REQUIRED_LANGUAGE_SECTIONS = ["## Go", "## Python", "## Rust", "## TypeScript"]

REQUIRED_DRY_RUN_MARKERS = [
    "argparse",
    "--report",
    "--json",
    "format_case_report",
    "format_case_result",
    "write_json_output",
    "expected=",
    "actual=",
    "actual_route",
    "failure_count",
    "wrote routing results to",
    "PASS",
    "FAIL",
]

REQUIRED_NEAR_MISS_MARKERS = [
    "## Should Trigger",
    "## Should Not Trigger",
    "## Ambiguous: Ask or Narrow Before Triggering",
    "TRIGGER",
    "NO_TRIGGER",
    "NARROW_FIRST",
    "Syntax tutorial",
    "Concept explanation",
    "Debugging request",
    "Broad API design",
    "## Scriptable Routing Cases",
    "trigger-db-public-leak",
    "trigger-sdk-cause",
    "no-trigger-syntax",
    "no-trigger-concept",
    "narrow-first-vague",
    "narrow-first-db-error",
]

NEAR_MISS_ROUTE_MINIMUMS = {
    "TRIGGER": 2,
    "NO_TRIGGER": 2,
    "NARROW_FIRST": 2,
}

TRIGGER_EXAMPLE_MINIMUMS = {
    "Positive (Chinese)": 4,
    "Positive (English)": 4,
    "Negative / Near Miss": 4,
}

TRIGGER_EXAMPLE_REQUIRED_TERMS = {
    "Positive (Chinese)": ["错误", "重试", "降级"],
    "Positive (English)": ["error", "retry", "fallback"],
    "Negative / Near Miss": ["Syntax tutorial", "Concept explanation", "Debugging request"],
}

ABSOLUTE_PATH_RE = re.compile(r"/Users/[A-Za-z0-9_.-]+/")


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def section_body(markdown: str, heading: str) -> str:
    pattern = re.compile(
        rf"^## {re.escape(heading)}\n(?P<body>.*?)(?=^## |\Z)",
        re.MULTILINE | re.DOTALL,
    )
    match = pattern.search(markdown)
    return match.group("body") if match else ""


def bullet_count(markdown: str) -> int:
    return len(re.findall(r"(?m)^- ", markdown))


def main() -> int:
    failures: list[str] = []

    for relative in REQUIRED_FILES:
        require((ROOT / relative).exists(), f"missing required file: {relative}", failures)

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    files = {relative: read(relative) for relative in REQUIRED_FILES}

    for relative, content in files.items():
        require(
            ABSOLUTE_PATH_RE.search(content) is None,
            f"absolute user path leaked in {relative}",
            failures,
        )

    skill = files["SKILL.md"]
    for marker in REQUIRED_SKILL_REFERENCES:
        require(marker in skill, f"SKILL.md missing marker: {marker}", failures)

    yaml = files["skill.yaml"]
    require("version: 1.16.0" in yaml, "skill.yaml version is not 1.16.0", failures)
    for keyword in REQUIRED_TRIGGER_KEYWORDS:
        require(keyword in yaml, f"skill.yaml missing trigger keyword: {keyword}", failures)

    triggers = files["references/trigger-examples.md"]
    for section, minimum in TRIGGER_EXAMPLE_MINIMUMS.items():
        body = section_body(triggers, section)
        require(body != "", f"trigger examples missing section: {section}", failures)
        require(
            bullet_count(body) >= minimum,
            f"trigger examples section {section} has fewer than {minimum} bullets",
            failures,
        )
        for term in TRIGGER_EXAMPLE_REQUIRED_TERMS[section]:
            require(term in body, f"trigger examples section {section} missing term: {term}", failures)

    probes = files["references/language-probes.md"]
    for section in REQUIRED_LANGUAGE_SECTIONS:
        require(section in probes, f"language probes missing section: {section}", failures)
    require(
        "## Minimum suggested tests" in probes,
        "language probes missing minimum suggested tests section",
        failures,
    )

    sample = files["references/sample-review-output.md"]
    for marker in REQUIRED_SAMPLE_MARKERS:
        require(marker in sample, f"sample output missing marker: {marker}", failures)

    dry_run = files["scripts/dry_run_routing_cases.py"]
    for marker in REQUIRED_DRY_RUN_MARKERS:
        require(marker in dry_run, f"dry-run script missing marker: {marker}", failures)

    near_miss = files["references/near-miss-eval.md"]
    for marker in REQUIRED_NEAR_MISS_MARKERS:
        require(marker in near_miss, f"near-miss eval missing marker: {marker}", failures)
    routing_cases = section_body(near_miss, "Scriptable Routing Cases")
    for route, minimum in NEAR_MISS_ROUTE_MINIMUMS.items():
        count = len(re.findall(rf"`{route}`", routing_cases))
        require(
            count >= minimum,
            f"near-miss scriptable routing cases include fewer than {minimum} {route} rows",
            failures,
        )
    for required_phrase in [
        "decision table",
        "public error code",
        "full P0–P3 decision table",
        "ask for relative paths",
        "inventing an implementation",
        "scripts/dry_run_routing_cases.py",
        "## Saving a routing artifact",
        "--json --output artifacts/error-boundary-routing.json",
        "failure_count",
        "expected_route",
        "actual_route",
        "cross-agent handoff",
    ]:
        require(
            required_phrase in routing_cases,
            f"near-miss scriptable routing cases missing phrase: {required_phrase}",
            failures,
        )

    try:
        fixture = json.loads(files["references/routing-cases.json"])
    except json.JSONDecodeError as error:
        failures.append(f"routing fixture is not valid JSON: {error}")
        fixture = []

    require(isinstance(fixture, list), "routing fixture must be a list", failures)
    fixture_by_route = {route: 0 for route in NEAR_MISS_ROUTE_MINIMUMS}
    fixture_ids: set[str] = set()
    for index, case in enumerate(fixture):
        require(isinstance(case, dict), f"routing fixture case {index} is not an object", failures)
        if not isinstance(case, dict):
            continue
        case_id = case.get("id")
        route = case.get("expected_route")
        prompt = case.get("prompt")
        must_mention = case.get("must_mention")
        must_avoid = case.get("must_avoid")
        require(isinstance(case_id, str) and bool(case_id), f"routing fixture case {index} missing id", failures)
        require(case_id not in fixture_ids, f"routing fixture duplicate id: {case_id}", failures)
        if isinstance(case_id, str):
            fixture_ids.add(case_id)
            require(case_id in routing_cases, f"routing fixture id not mirrored in near-miss table: {case_id}", failures)
        require(route in NEAR_MISS_ROUTE_MINIMUMS, f"routing fixture {case_id} has invalid route: {route}", failures)
        if route in fixture_by_route:
            fixture_by_route[route] += 1
        require(isinstance(prompt, str) and bool(prompt.strip()), f"routing fixture {case_id} missing prompt", failures)
        require(
            isinstance(must_mention, list) and all(isinstance(item, str) and item for item in must_mention),
            f"routing fixture {case_id} must_mention must be a non-empty string list",
            failures,
        )
        require(
            isinstance(must_avoid, list) and all(isinstance(item, str) and item for item in must_avoid),
            f"routing fixture {case_id} must_avoid must be a non-empty string list",
            failures,
        )

    for route, minimum in NEAR_MISS_ROUTE_MINIMUMS.items():
        require(
            fixture_by_route[route] >= minimum,
            f"routing fixture includes fewer than {minimum} {route} cases",
            failures,
        )

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    print(
        "validated ng-review-error-boundary skill: files, triggers, "
        "trigger examples, near-miss eval, scriptable routing cases, "
        "routing fixture, dry-run report/json/output, references, and sample markers"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
