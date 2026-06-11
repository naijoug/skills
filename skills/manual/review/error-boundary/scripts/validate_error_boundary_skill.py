#!/usr/bin/env python3
"""Lightweight regression checks for the error-boundary review skill.

Run from the skill directory:

    python3 scripts/validate_error_boundary_skill.py

The checks intentionally avoid external dependencies so the skill can be
validated in a minimal agent/runtime environment.
"""

from __future__ import annotations

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
]

REQUIRED_SKILL_REFERENCES = [
    "references/language-probes.md",
    "references/sample-review-output.md",
    "references/trigger-examples.md",
    "references/near-miss-eval.md",
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
    "Eval Rubric",
]

REQUIRED_LANGUAGE_SECTIONS = ["## Go", "## Python", "## Rust", "## TypeScript"]

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
]

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
    require("version: 1.5.0" in yaml, "skill.yaml version is not 1.5.0", failures)
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

    near_miss = files["references/near-miss-eval.md"]
    for marker in REQUIRED_NEAR_MISS_MARKERS:
        require(marker in near_miss, f"near-miss eval missing marker: {marker}", failures)

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    print(
        "validated ng-review-error-boundary skill: files, triggers, "
        "trigger examples, near-miss eval, references, and sample markers"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
