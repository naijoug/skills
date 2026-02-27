from __future__ import annotations

import importlib
import inspect
from pathlib import Path
import subprocess
from typing import Any

from .discovery import discover_skills, get_skill


def run_skill(root: str | Path, skill_id: str, inputs: dict[str, Any] | None = None) -> dict[str, Any]:
    safe_inputs = inputs or {}
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

    runtime_type = _resolve_runtime_type(skill.runtime)
    if runtime_type == "python_module":
        return _run_python_module(skill_id, skill.runtime, safe_inputs)
    if runtime_type == "shell_command":
        return _run_shell_command(skill_id, skill.root_dir, skill.runtime, safe_inputs)

    return {
        "ok": False,
        "code": "UNSUPPORTED_RUNTIME_TYPE",
        "message": f"Unsupported runtime.type '{runtime_type}' for '{skill_id}'",
        "details": {"skill_id": skill_id, "runtime_type": runtime_type},
    }


def _resolve_runtime_type(runtime: dict[str, Any]) -> str:
    raw = str(runtime.get("type") or "").strip()
    if raw:
        return raw
    if runtime.get("entrypoint"):
        return "python_module"
    if runtime.get("command"):
        return "shell_command"
    return "python_module"


def _run_python_module(skill_id: str, runtime: dict[str, Any], inputs: dict[str, Any]) -> dict[str, Any]:
    entrypoint = str(runtime.get("entrypoint") or "").strip()
    if not entrypoint or ":" not in entrypoint:
        return {
            "ok": False,
            "code": "INVALID_ENTRYPOINT",
            "message": f"Invalid runtime.entrypoint for '{skill_id}'",
            "details": {"skill_id": skill_id, "entrypoint": entrypoint},
        }

    module_name, func_name = entrypoint.split(":", 1)
    try:
        module = importlib.import_module(module_name)
        fn = getattr(module, func_name)
    except Exception as exc:
        return {
            "ok": False,
            "code": "RUNTIME_IMPORT_ERROR",
            "message": f"Failed to import runtime entrypoint '{entrypoint}': {exc}",
            "details": {"skill_id": skill_id, "entrypoint": entrypoint},
        }

    try:
        result = _invoke_runtime_function(fn, inputs)
    except Exception as exc:
        return {
            "ok": False,
            "code": "RUNTIME_EXECUTION_ERROR",
            "message": f"Runtime execution failed for '{skill_id}': {exc}",
            "details": {"skill_id": skill_id, "entrypoint": entrypoint},
        }

    return {
        "ok": True,
        "code": "RUNTIME_EXECUTED",
        "message": f"Runtime executed for '{skill_id}'",
        "details": {
            "skill_id": skill_id,
            "runtime_type": "python_module",
            "entrypoint": entrypoint,
            "result": result,
        },
    }


def _invoke_runtime_function(fn, inputs: dict[str, Any]):
    if not callable(fn):
        raise TypeError("Entry point is not callable")

    signature = inspect.signature(fn)
    parameters = list(signature.parameters.values())
    if not parameters:
        return fn()
    if len(parameters) == 1:
        return fn(inputs)
    return fn(**inputs)


def _run_shell_command(
    skill_id: str,
    skill_root: Path,
    runtime: dict[str, Any],
    inputs: dict[str, Any],
) -> dict[str, Any]:
    command = str(runtime.get("command") or "").strip()
    if not command:
        return {
            "ok": False,
            "code": "INVALID_SHELL_COMMAND",
            "message": f"Missing runtime.command for '{skill_id}'",
            "details": {"skill_id": skill_id},
        }

    args = runtime.get("args") if isinstance(runtime.get("args"), list) else []
    try:
        rendered_args = [_render_template(str(item), inputs) for item in args]
        rendered_command = _render_template(command, inputs)
    except KeyError as exc:
        missing = str(exc).strip("'")
        return {
            "ok": False,
            "code": "MISSING_INPUT",
            "message": f"Missing input '{missing}' for shell command template",
            "details": {"skill_id": skill_id, "missing_input": missing},
        }

    try:
        cwd = _resolve_guarded_path(skill_root, runtime.get("cwd") or ".")
        venv_path = _resolve_guarded_path(skill_root, runtime.get("venv") or ".venv")
    except ValueError as exc:
        return {
            "ok": False,
            "code": "INVALID_RUNTIME_PATH",
            "message": str(exc),
            "details": {"skill_id": skill_id},
        }

    venv_python = venv_path / "bin" / "python"
    if not venv_python.exists():
        create_venv = subprocess.run(
            ["uv", "venv", str(venv_path)],
            cwd=str(skill_root),
            capture_output=True,
            text=True,
            check=False,
        )
        if create_venv.returncode != 0:
            return {
                "ok": False,
                "code": "UV_VENV_FAILED",
                "message": f"Failed to create uv virtual environment for '{skill_id}'",
                "details": {
                    "skill_id": skill_id,
                    "stdout": create_venv.stdout,
                    "stderr": create_venv.stderr,
                    "returncode": create_venv.returncode,
                },
            }

    run_cmd = [
        "uv",
        "run",
        "--python",
        str(venv_python),
        "--",
        rendered_command,
        *rendered_args,
    ]
    proc = subprocess.run(
        run_cmd,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        return {
            "ok": False,
            "code": "SHELL_COMMAND_FAILED",
            "message": f"Shell runtime failed for '{skill_id}'",
            "details": {
                "skill_id": skill_id,
                "command": run_cmd,
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "returncode": proc.returncode,
            },
        }

    return {
        "ok": True,
        "code": "RUNTIME_EXECUTED",
        "message": f"Runtime executed for '{skill_id}'",
        "details": {
            "skill_id": skill_id,
            "runtime_type": "shell_command",
            "command": run_cmd,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "returncode": proc.returncode,
        },
    }


def _render_template(value: str, inputs: dict[str, Any]) -> str:
    safe = {k: str(v) for k, v in inputs.items()}
    return value.format(**safe)


def _resolve_guarded_path(base: Path, raw: str) -> Path:
    base_resolved = base.resolve()
    candidate = (base_resolved / raw).resolve()
    try:
        candidate.relative_to(base_resolved)
    except ValueError as exc:
        raise ValueError(f"Runtime path '{raw}' escapes skill directory") from exc
    return candidate
