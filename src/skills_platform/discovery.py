from __future__ import annotations

from pathlib import Path
from typing import Any

from .frontmatter import extract_markdown_title, extract_summary_line, parse_markdown_frontmatter
from .models import SkillRecord
from .simple_yaml import parse_simple_yaml


def discover_skills(root: str | Path) -> list[SkillRecord]:
    root_path = Path(root)
    if not root_path.exists():
        return []
    records: list[SkillRecord] = []
    for skill_dir in sorted(p for p in root_path.iterdir() if p.is_dir()):
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            continue
        records.append(_load_skill_record(skill_dir, skill_md))
    return records


def get_skill(skills: list[SkillRecord], skill_id: str) -> SkillRecord | None:
    for skill in skills:
        if skill.id == skill_id:
            return skill
    return None


def _load_skill_record(skill_dir: Path, skill_md_path: Path) -> SkillRecord:
    doc = parse_markdown_frontmatter(skill_md_path.read_text(encoding="utf-8"))
    metadata_path = _find_metadata_file(skill_dir)
    metadata = _load_optional_yaml(metadata_path) if metadata_path else {}
    if not isinstance(metadata, dict):
        metadata = {}
    overrides = _load_tool_overrides(skill_dir / "agents")

    frontmatter = doc.frontmatter or {}
    skill_id = str(metadata.get("id") or frontmatter.get("name") or skill_dir.name)
    title = (
        metadata.get("title")
        or _get_nested(overrides.get("openai", {}), "interface", "display_name")
        or extract_markdown_title(doc.body)
        or _title_from_id(skill_id)
    )
    summary = (
        str(metadata.get("summary") or "").strip()
        or str(_get_nested(overrides.get("openai", {}), "interface", "short_description") or "").strip()
        or str(frontmatter.get("description") or "").strip()
        or (extract_summary_line(doc.body) or "").strip()
        or f"Skill {skill_id}"
    )

    kind = str(metadata.get("kind") or "prompt_only")
    version = str(metadata.get("version")) if metadata.get("version") is not None else None
    runtime = metadata.get("runtime") if isinstance(metadata.get("runtime"), dict) else {}
    compatibility = (
        metadata.get("compatibility") if isinstance(metadata.get("compatibility"), dict) else {}
    )
    tags = metadata.get("tags") if isinstance(metadata.get("tags"), list) else []
    tags = [str(tag) for tag in tags]

    return SkillRecord(
        id=skill_id,
        version=version,
        title=str(title),
        summary=summary,
        kind=kind,
        root_dir=skill_dir,
        skill_md_path=skill_md_path,
        metadata_path=metadata_path,
        frontmatter=frontmatter,
        metadata=metadata,
        tool_overrides=overrides,
        runtime=runtime,
        compatibility=compatibility,
        tags=tags,
    )


def _load_tool_overrides(agents_dir: Path) -> dict[str, dict[str, Any]]:
    if not agents_dir.exists() or not agents_dir.is_dir():
        return {}
    result: dict[str, dict[str, Any]] = {}
    for path in sorted(agents_dir.iterdir()):
        if not path.is_file() or path.suffix.lower() not in {".yaml", ".yml"}:
            continue
        data = _load_optional_yaml(path)
        if isinstance(data, dict):
            result[path.stem] = data
    return result


def _find_metadata_file(skill_dir: Path) -> Path | None:
    for name in ("skill.yaml", "skill.yml"):
        path = skill_dir / name
        if path.exists():
            return path
    return None


def _load_optional_yaml(path: Path | None):
    if path is None:
        return {}
    return parse_simple_yaml(path.read_text(encoding="utf-8"))


def _title_from_id(skill_id: str) -> str:
    return skill_id.replace("-", " ").replace("_", " ").title()


def _get_nested(data: dict[str, Any], *keys: str) -> Any:
    cur: Any = data
    for key in keys:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(key)
    return cur

