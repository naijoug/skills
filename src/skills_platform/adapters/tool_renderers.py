from __future__ import annotations

from dataclasses import dataclass

from .base import ExportContext
from .common import ensure_output_dirs, render_rule_markdown, write_install_readme, write_shared_mcp_config
from ..models import SkillRecord


@dataclass(frozen=True)
class GenericToolAdapter:
    target: str

    def export(self, ctx: ExportContext, skills: list[SkillRecord]) -> dict:
        dirs = ensure_output_dirs(ctx.target_dir)
        for skill in skills:
            rule_path = dirs["rules"] / f"{skill.id}.md"
            rule_path.write_text(render_rule_markdown(ctx.target, skill), encoding="utf-8")
        write_shared_mcp_config(dirs["config"], ctx.target)
        write_install_readme(dirs["install"], ctx.target)
        return {
            "target": self.target,
            "output_dir": str(ctx.target_dir),
            "skill_count": len(skills),
        }

