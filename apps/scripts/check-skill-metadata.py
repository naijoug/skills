#!/usr/bin/env python3
"""Check that skill directories have discoverability metadata.

The linker can fall back to frontmatter, but `skill.yaml` is the stable source for
skill id, title, summary, tags, triggers, and tool compatibility. This check is
intentionally lightweight so it can run before broader app tests or during cron
maintenance.
"""

from __future__ import annotations

import argparse
import json
import re
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


def field_block(lines: list[str], field: str) -> tuple[str, list[str]] | None:
    """Read one block-style YAML key within the supplied mapping scope.

    Repository metadata uses two-space indentation and scalar/block-list values.
    This is intentionally not a general YAML parser; flow mappings and aliases
    are not accepted for checked fields. Duplicate keys fail the check.
    """
    pattern = re.compile(rf"^{re.escape(field)}:(?:[ \t]+(.*))?$")
    matches = [(index, pattern.match(line)) for index, line in enumerate(lines) if pattern.match(line)]
    if len(matches) != 1:
        return None
    index, match = matches[0]
    body = []
    for line in lines[index + 1:]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if not line.startswith("  "):
            break
        body.append(line[2:])
    return (match.group(1) or "").strip(), body


def scalar_text(value: str) -> str:
    value = re.sub(r"\s+#.*$", "", value).strip() if not value.startswith(('"', "'")) else value
    if value.startswith('"'):
        try:
            result, end = json.JSONDecoder().raw_decode(value)
            return result if isinstance(result, str) and (not value[end:].strip() or value[end:].lstrip().startswith("#")) else ""
        except ValueError:
            return ""
    if value.startswith("'"):
        match = re.fullmatch(r"'((?:[^']|'')*)'(?:\s+#.*)?", value)
        return match.group(1).replace("''", "'") if match else ""
    return "" if value in {"null", "~"} or value.startswith("#") else value


def scalar_value(lines: list[str], field: str) -> str | None:
    block = field_block(lines, field)
    if block is None:
        return None
    value, body = block
    if value in {"|", ">", "|-", ">-"}:
        return " ".join(body).strip()
    return scalar_text(value)


def has_non_empty_list(lines: list[str], path: tuple[str, ...]) -> bool:
    """Return whether a simple YAML list under a top-level/nested key has items.

    This intentionally parses only the metadata shape used in this repository;
    keeping it dependency-free lets the check run before package installation.
    """
    scope = lines
    for key in path:
        block = field_block(scope, key)
        if block is None or scalar_text(block[0]):
            return False
        scope = block[1]
    return bool(scope) and all(line.startswith("- ") and scalar_text(line[2:].strip()) for line in scope)


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


def validate_openai_policy(skill_dir: Path, category: str) -> list[MetadataProblem]:
    """Manual skills are explicit-only in this repository by design."""
    if category != "manual":
        return []
    policy_path = skill_dir / "agents" / "openai.yaml"
    if not policy_path.exists():
        return [MetadataProblem(skill_dir, "manual skill missing agents/openai.yaml")]
    lines = policy_path.read_text(encoding="utf-8").splitlines()
    policy = field_block(lines, "policy")
    invocation = field_block(policy[1], "allow_implicit_invocation") if policy and not scalar_text(policy[0]) else None
    if invocation is None or re.sub(r"\s+#.*$", "", invocation[0]) != "false" or invocation[1]:
        return [MetadataProblem(skill_dir, "manual skill must set policy.allow_implicit_invocation to boolean false (block YAML)")]
    if any(field_block(lines, key) for key in ("display_name", "short_description", "default_prompt", "prompt")):
        return [MetadataProblem(skill_dir, "UI metadata belongs under interface in agents/openai.yaml")]
    return []


def validate_frontmatter(skill_dir: Path) -> list[MetadataProblem]:
    lines = (skill_dir / "SKILL.md").read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---" or "---" not in lines[1:]:
        return [MetadataProblem(skill_dir, "SKILL.md missing closed YAML frontmatter")]
    frontmatter = lines[1:lines.index("---", 1)]
    name = scalar_value(frontmatter, "name")
    problems = []
    if not name or len(name) > 64 or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
        problems.append(MetadataProblem(skill_dir, "SKILL.md needs one valid lowercase-hyphenated name"))
    if not scalar_value(frontmatter, "description"):
        problems.append(MetadataProblem(skill_dir, "SKILL.md needs one nonempty description"))
    metadata = skill_dir / "skill.yaml"
    if metadata.exists():
        metadata_lines = metadata.read_text(encoding="utf-8").splitlines()
        if name != scalar_value(metadata_lines, "id"):
            problems.append(MetadataProblem(skill_dir, "SKILL.md name and skill.yaml id differ"))
        if not re.fullmatch(r"\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?", scalar_value(metadata_lines, "version") or ""):
            problems.append(MetadataProblem(skill_dir, "skill.yaml version must be semantic versioning"))
    # Check actual Markdown links in instructions, not illustrative shell commands.
    in_fence = False
    for line in lines[lines.index("---", 1) + 1:]:
        if line.lstrip().startswith(("```", "~~~")):
            in_fence = not in_fence
        if in_fence:
            continue
        for target in re.findall(r"\]\(((?:references|scripts|assets)/[^\s)#]+)(?:#[^\s)]+)?\)", line):
            if not (skill_dir / target).exists():
                problems.append(MetadataProblem(skill_dir, f"broken bundled link: {target}"))
    return problems


def check_metadata(skills_dir: Path, category: str | None) -> list[MetadataProblem]:
    problems: list[MetadataProblem] = []
    if not skills_dir.is_dir():
        return [MetadataProblem(skills_dir, "skills root does not exist")]
    identities: dict[str, Path] = {}
    for skill_dir in iter_skill_dirs(skills_dir):
        if category and category_for(skill_dir, skills_dir) != category:
            continue
        problems.extend(validate_skill_yaml(skill_dir))
        problems.extend(validate_frontmatter(skill_dir))
        problems.extend(validate_openai_policy(skill_dir, category_for(skill_dir, skills_dir)))
        metadata = skill_dir / "skill.yaml"
        identity = scalar_value(metadata.read_text(encoding="utf-8").splitlines(), "id") if metadata.exists() else None
        if identity:
            if identity in identities:
                problems.append(MetadataProblem(skill_dir, f"duplicate skill id also at {rel(identities[identity])}"))
            identities[identity] = skill_dir
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
