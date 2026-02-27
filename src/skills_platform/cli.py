from __future__ import annotations

import argparse
import json
import platform
import sys
from pathlib import Path

from .adapters.registry import list_supported_targets
from .discovery import discover_skills, get_skill
from .exporter import export_targets
from .runtime_exec import run_skill
from .validation import validate_skills


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if not getattr(args, "command", None):
        parser.print_help()
        return 2

    if args.command == "list":
        return _cmd_list(args)
    if args.command == "show":
        return _cmd_show(args)
    if args.command == "validate":
        return _cmd_validate(args)
    if args.command == "render":
        return _cmd_render(args)
    if args.command == "doctor":
        return _cmd_doctor(args)
    if args.command == "run":
        return _cmd_run(args)
    parser.error(f"Unknown command: {args.command}")
    return 2


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="skills", description="Cross-tool skills platform CLI")
    subparsers = parser.add_subparsers(dest="command")

    p_list = subparsers.add_parser("list", help="List discovered skills")
    _add_common_flags(p_list)

    p_show = subparsers.add_parser("show", help="Show skill details")
    p_show.add_argument("skill_id")
    _add_common_flags(p_show)

    p_validate = subparsers.add_parser("validate", help="Validate skills metadata")
    _add_common_flags(p_validate)

    p_render = subparsers.add_parser("render", help="Render exports for tool targets")
    p_render.add_argument("--target", dest="targets", action="append", required=True)
    p_render.add_argument("--output", required=True)
    _add_common_flags(p_render)

    p_doctor = subparsers.add_parser("doctor", help="Environment diagnostics")
    _add_common_flags(p_doctor)

    p_run = subparsers.add_parser("run", help="Run a skill runtime action")
    p_run.add_argument("skill_id")
    p_run.add_argument("--input", dest="inputs", action="append", default=[])
    _add_common_flags(p_run)
    return parser


def _add_common_flags(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--root", default="skills", help="Skills root directory")
    parser.add_argument("--json", action="store_true", help="JSON output")


def _cmd_list(args) -> int:
    skills = discover_skills(args.root)
    payload = {"skills": [skill.to_dict() for skill in skills], "count": len(skills)}
    return _emit(args, payload, human_lines=[f"{s.id}\t{s.kind}\t{s.title}" for s in skills])


def _cmd_show(args) -> int:
    skills = discover_skills(args.root)
    skill = get_skill(skills, args.skill_id)
    if skill is None:
        return _emit_error(args, "SKILL_NOT_FOUND", f"Skill not found: {args.skill_id}", exit_code=1)
    payload = {"skill": skill.to_dict()}
    human_lines = [
        f"id: {skill.id}",
        f"title: {skill.title}",
        f"kind: {skill.kind}",
        f"summary: {skill.summary}",
        f"root: {skill.root_dir}",
    ]
    return _emit(args, payload, human_lines=human_lines)


def _cmd_validate(args) -> int:
    report = validate_skills(discover_skills(args.root))
    payload = report.to_dict()
    status = "OK" if report.error_count == 0 else "FAIL"
    human_lines = [
        f"Validation: {status}",
        f"errors: {report.error_count}",
        f"warnings: {report.warning_count}",
    ]
    human_lines.extend(f"warning[{w.skill_id}]: {w.message}" for w in report.warnings)
    human_lines.extend(f"error[{e.skill_id}]: {e.message}" for e in report.errors)
    code = 0 if report.error_count == 0 else 1
    return _emit(args, payload, human_lines=human_lines, exit_code=code)


def _cmd_render(args) -> int:
    result = export_targets(args.root, args.output, args.targets)
    human_lines = [
        f"Rendered {result['skill_count']} skills to {result['output_root']}",
        f"targets: {', '.join(result['targets'])}",
    ]
    return _emit(args, result, human_lines=human_lines)


def _cmd_doctor(args) -> int:
    root = Path(args.root)
    payload = {
        "python": sys.version.split()[0],
        "executable": sys.executable,
        "platform": platform.platform(),
        "skills_root": str(root),
        "skills_root_exists": root.exists(),
        "supported_targets": list_supported_targets(),
    }
    human_lines = [
        f"python: {payload['python']}",
        f"executable: {payload['executable']}",
        f"platform: {payload['platform']}",
        f"skills_root: {payload['skills_root']} ({'exists' if root.exists() else 'missing'})",
        f"supported_targets: {', '.join(payload['supported_targets'])}",
    ]
    return _emit(args, payload, human_lines=human_lines)


def _cmd_run(args) -> int:
    inputs = _parse_inputs(args.inputs)
    result = run_skill(args.root, args.skill_id, inputs=inputs)
    code = 0 if result.get("ok") else 1
    human_lines = [
        f"ok: {result.get('ok')}",
        f"code: {result.get('code')}",
        str(result.get("message", "")),
    ]
    return _emit(args, result, human_lines=human_lines, exit_code=code)


def _parse_inputs(items: list[str]) -> dict[str, str]:
    parsed: dict[str, str] = {}
    for item in items:
        if "=" not in item:
            parsed[item] = ""
            continue
        k, v = item.split("=", 1)
        parsed[k] = v
    return parsed


def _emit(args, payload: dict, human_lines: list[str], exit_code: int = 0) -> int:
    if getattr(args, "json", False):
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        print("\n".join(human_lines))
    return exit_code


def _emit_error(args, code: str, message: str, exit_code: int) -> int:
    payload = {"ok": False, "code": code, "message": message}
    if getattr(args, "json", False):
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        print(message, file=sys.stderr)
    return exit_code

