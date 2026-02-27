from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ValidationFinding:
    level: str
    skill_id: str
    message: str


@dataclass(frozen=True)
class ValidationReport:
    errors: list[ValidationFinding] = field(default_factory=list)
    warnings: list[ValidationFinding] = field(default_factory=list)

    @property
    def error_count(self) -> int:
        return len(self.errors)

    @property
    def warning_count(self) -> int:
        return len(self.warnings)

    def to_dict(self) -> dict[str, Any]:
        return {
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "errors": [f.__dict__ for f in self.errors],
            "warnings": [f.__dict__ for f in self.warnings],
        }


@dataclass(frozen=True)
class SkillRecord:
    id: str
    version: str | None
    title: str
    summary: str
    kind: str
    root_dir: Path
    skill_md_path: Path
    metadata_path: Path | None
    frontmatter: dict[str, Any]
    metadata: dict[str, Any]
    tool_overrides: dict[str, dict[str, Any]]
    runtime: dict[str, Any]
    compatibility: dict[str, Any]
    tags: list[str]

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "version": self.version,
            "title": self.title,
            "summary": self.summary,
            "kind": self.kind,
            "root_dir": str(self.root_dir),
            "skill_md_path": str(self.skill_md_path),
            "metadata_path": str(self.metadata_path) if self.metadata_path else None,
            "tags": self.tags,
            "runtime": self.runtime,
            "compatibility": self.compatibility,
            "tool_overrides": self.tool_overrides,
        }

