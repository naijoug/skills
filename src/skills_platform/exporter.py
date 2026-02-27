from __future__ import annotations

from pathlib import Path

from .adapters.base import ExportContext
from .adapters.registry import get_adapter
from .discovery import discover_skills


def export_targets(root: str | Path, output_root: str | Path, targets: list[str]) -> dict:
    skills_root = Path(root)
    out_root = Path(output_root)
    out_root.mkdir(parents=True, exist_ok=True)
    skills = discover_skills(skills_root)
    results = []
    for target in targets:
        adapter = get_adapter(target)
        target_dir = out_root / adapter.target
        ctx = ExportContext(
            target=adapter.target,
            target_dir=target_dir,
            repo_root=Path.cwd(),
            skills_root=skills_root,
        )
        results.append(adapter.export(ctx, skills))
    return {
        "targets": [r["target"] for r in results],
        "results": results,
        "skill_count": len(skills),
        "output_root": str(out_root),
    }

