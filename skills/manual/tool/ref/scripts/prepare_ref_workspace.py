#!/usr/bin/env python3
"""Initialize docs/ref.md and .ref/ for a target project."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def ensure_gitignore_entry(project_root: Path, entry: str) -> Path:
    gitignore_path = project_root / ".gitignore"
    if gitignore_path.exists():
        lines = gitignore_path.read_text(encoding="utf-8").splitlines()
    else:
        lines = []

    if any(line.strip() == entry for line in lines):
        return gitignore_path

    new_lines = list(lines)
    if new_lines and new_lines[-1].strip():
        new_lines.append("")
    new_lines.append(entry)
    gitignore_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    return gitignore_path


def render_ref_template(topic: str) -> str:
    return (
        "# Reference Pack\n\n"
        f"- Topic: `{topic}`\n"
        f"- Generated: `{now_iso()}`\n"
        "- Scope: `initialized`\n\n"
        "## Search Queries\n\n"
        "- \n\n"
        "## Official Docs\n\n"
        "| Title | Link | Why It Matters |\n"
        "| --- | --- | --- |\n"
        "|  |  |  |\n\n"
        "## Open Source Projects\n\n"
        "| Project | Link | Local Path | Why Selected |\n"
        "| --- | --- | --- | --- |\n"
        "|  |  | `.ref/repos/` |  |\n\n"
        "## Repo Notes\n\n"
        "### <repo-name>\n\n"
        "- Local path:\n"
        "- Coverage:\n"
        "- Key files/modules:\n"
        "- Mechanisms worth borrowing:\n"
        "- Caveats:\n\n"
        "## Cross-Project Patterns\n\n"
        "- \n\n"
        "## Recommended Directions\n\n"
        "- \n\n"
        "## Open Questions\n\n"
        "- \n"
    )


def initialize_ref_doc(path: Path, topic: str, overwrite: bool) -> str:
    if path.exists() and not overwrite:
        return "exists"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render_ref_template(topic), encoding="utf-8")
    return "created" if not overwrite else "overwritten"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Prepare docs/ref.md and .ref workspace.")
    parser.add_argument("--project-root", default=".", help="Target project root")
    parser.add_argument("--topic", default="TBD", help="Reference topic shown in docs/ref.md")
    parser.add_argument("--docs-path", default="docs/ref.md", help="Path relative to project root")
    parser.add_argument("--ref-dir", default=".ref", help="Reference directory relative to project root")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite docs/ref.md if it already exists")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    project_root = Path(args.project_root).expanduser().resolve()
    docs_path = project_root / args.docs_path
    ref_dir = project_root / args.ref_dir
    repos_dir = ref_dir / "repos"

    ensure_dir(project_root / "docs")
    ensure_dir(ref_dir)
    ensure_dir(repos_dir)
    gitignore_path = ensure_gitignore_entry(project_root, f"{args.ref_dir.rstrip('/')}/")
    doc_status = initialize_ref_doc(docs_path, args.topic.strip() or "TBD", args.overwrite)

    result = {
        "project_root": str(project_root),
        "docs_path": str(docs_path),
        "doc_status": doc_status,
        "ref_dir": str(ref_dir),
        "repos_dir": str(repos_dir),
        "gitignore_path": str(gitignore_path),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
