from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from ..models import SkillRecord


@dataclass(frozen=True)
class ExportContext:
    target: str
    target_dir: Path
    repo_root: Path
    skills_root: Path


class ToolAdapter(Protocol):
    target: str

    def export(self, ctx: ExportContext, skills: list[SkillRecord]) -> dict:
        ...

