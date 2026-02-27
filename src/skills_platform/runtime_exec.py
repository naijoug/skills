from __future__ import annotations

from pathlib import Path
from typing import Any

from .discovery import discover_skills, get_skill


def run_skill(root: str | Path, skill_id: str, inputs: dict[str, Any] | None = None) -> dict[str, Any]:
    skills = discover_skills(root)
    skill = get_skill(skills, skill_id)
    if skill is None:
        return {
            "ok": False,
            "code": "SKILL_NOT_FOUND",
            "message": f"Skill not found: {skill_id}",
            "details": {"skill_id": skill_id},
        }
    if skill.kind != "prompt_plus_runtime":
        return {
            "ok": True,
            "code": "PROMPT_ONLY",
            "message": f"Skill '{skill_id}' is prompt-only; no runtime action executed",
            "details": {"skill_id": skill_id, "kind": skill.kind},
        }
    return {
        "ok": True,
        "code": "NOT_IMPLEMENTED",
        "message": f"Runtime plugin execution is scaffolded but not implemented for '{skill_id}'",
        "details": {
            "skill_id": skill_id,
            "entrypoint": skill.runtime.get("entrypoint"),
            "inputs": inputs or {},
        },
    }

