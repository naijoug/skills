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
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SKILLS_DIR = ROOT / "skills"


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


def check_metadata(skills_dir: Path, category: str | None) -> list[Path]:
    missing: list[Path] = []
    for skill_dir in iter_skill_dirs(skills_dir):
        if category and category_for(skill_dir, skills_dir) != category:
            continue
        if not (skill_dir / "skill.yaml").exists():
            missing.append(skill_dir)
    return missing


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Fail when skill directories with SKILL.md are missing skill.yaml."
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
    missing = check_metadata(skills_dir, category)

    scanned_label = args.category if category else "all"
    if missing:
        print(f"Missing skill.yaml in {len(missing)} {scanned_label} skill(s):", file=sys.stderr)
        for skill_dir in missing:
            print(f"- {rel(skill_dir)}", file=sys.stderr)
        return 1

    print(f"Skill metadata check passed: missing skill.yaml: 0 ({scanned_label})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
