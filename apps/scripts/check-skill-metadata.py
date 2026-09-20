#!/usr/bin/env python3
"""Check that skill directories have discoverability metadata.

The linker can fall back to frontmatter, but `skill.yaml` is the stable source for
skill id, title, summary, tags, triggers, and tool compatibility. This check is
intentionally lightweight so it can run before broader app tests or during cron
maintenance.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SKILLS_DIR = ROOT / "skills"
REQUIRED_SCALAR_FIELDS = ("id", "version", "title", "summary", "kind")
REQUIRED_LIST_FIELDS = (
    ("tags",),
    ("triggers", "keywords"),
    ("compatibility", "tools"),
)


@dataclass(frozen=True)
class MetadataProblem:
    skill_dir: Path
    message: str


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def iter_skill_dirs(skills_dir: Path) -> list[Path]:
    return sorted({skill_file.parent for skill_file in skills_dir.rglob("SKILL.md")})


def category_for(skill_dir: Path, skills_dir: Path) -> str:
    try:
        return skill_dir.relative_to(skills_dir).parts[0]
    except (IndexError, ValueError):
        return "unknown"


def scalar_value(lines: list[str], field: str) -> str | None:
    prefix = f"{field}:"
    for line in lines:
        if line.startswith(prefix):
            return line[len(prefix) :].strip().strip('"\'')
    return None


def has_non_empty_list(lines: list[str], path: tuple[str, ...]) -> bool:
    """Return whether a simple YAML list under a top-level/nested key has items.

    This intentionally parses only the metadata shape used in this repository;
    keeping it dependency-free lets the check run before package installation.
    """
    indent = 0
    start = 0
    for key in path:
        prefix = " " * indent + f"{key}:"
        for index in range(start, len(lines)):
            line = lines[index]
            if line.startswith(prefix):
                start = index + 1
                indent += 2
                break
        else:
            return False

    for line in lines[start:]:
        if not line.strip():
            continue
        line_indent = len(line) - len(line.lstrip(" "))
        if line_indent < indent:
            return False
        if line_indent == indent and line.lstrip().startswith("- ") and line.lstrip()[2:].strip():
            return True
    return False


def validate_skill_yaml(skill_dir: Path) -> list[MetadataProblem]:
    metadata_path = skill_dir / "skill.yaml"
    if not metadata_path.exists():
        return [MetadataProblem(skill_dir, "missing skill.yaml")]

    lines = metadata_path.read_text(encoding="utf-8").splitlines()
    problems: list[MetadataProblem] = []
    for field in REQUIRED_SCALAR_FIELDS:
        value = scalar_value(lines, field)
        if value is None:
            problems.append(MetadataProblem(skill_dir, f"missing `{field}`"))
        elif not value:
            problems.append(MetadataProblem(skill_dir, f"empty `{field}`"))

    for field_path in REQUIRED_LIST_FIELDS:
        if not has_non_empty_list(lines, field_path):
            problems.append(MetadataProblem(skill_dir, f"missing or empty `{'.'.join(field_path)}`"))

    return problems


def check_metadata(skills_dir: Path, category: str | None) -> list[MetadataProblem]:
    problems: list[MetadataProblem] = []
    for skill_dir in iter_skill_dirs(skills_dir):
        if category and category_for(skill_dir, skills_dir) != category:
            continue
        problems.extend(validate_skill_yaml(skill_dir))
    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Fail when skill directories with SKILL.md are missing required skill.yaml metadata."
    )
    parser.add_argument(
        "--skills-dir",
        default=str(SKILLS_DIR),
        help="Skills root to scan; defaults to skills/ in this repository.",
    )
    parser.add_argument(
        "--category",
        default="manual",
        help="Top-level category to scan, for example manual/cron/auto. Use 'all' for every category. Default: manual.",
    )
    args = parser.parse_args(argv)

    skills_dir = Path(args.skills_dir).resolve()
    category = None if args.category == "all" else args.category
    problems = check_metadata(skills_dir, category)

    scanned_label = args.category if category else "all"
    if problems:
        print(f"Skill metadata check failed: {len(problems)} problem(s) in {scanned_label} skill(s):", file=sys.stderr)
        for problem in problems:
            print(f"- {rel(problem.skill_dir)}: {problem.message}", file=sys.stderr)
        return 1

    print(f"Skill metadata check passed: 0 problem(s) ({scanned_label})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
