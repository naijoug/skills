from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from .discovery import discover_skills, get_skill
from .exporter import export_targets
from .runtime_exec import run_skill
from .validation import validate_skills

JSONRPC_VERSION = "2.0"


def handle_request(request: dict[str, Any]) -> dict[str, Any]:
    req_id = request.get("id")
    try:
        if request.get("jsonrpc") != JSONRPC_VERSION:
            return _error(req_id, -32600, "Invalid JSON-RPC version")
        method = request.get("method")
        if not isinstance(method, str):
            return _error(req_id, -32600, "Missing or invalid method")
        params = request.get("params") or {}
        if not isinstance(params, dict):
            return _error(req_id, -32602, "params must be an object")
        return _dispatch(req_id, method, params)
    except ValueError as exc:
        return _error(req_id, -32602, str(exc))
    except Exception as exc:  # pragma: no cover - defensive wrapper
        return _error(req_id, -32000, f"Internal error: {exc}")


def _dispatch(req_id: Any, method: str, params: dict[str, Any]) -> dict[str, Any]:
    if method == "skills.list":
        root = params.get("root", "skills")
        skills = discover_skills(root)
        return _result(req_id, {"skills": [s.to_dict() for s in skills], "count": len(skills)})

    if method == "skills.describe":
        root = params.get("root", "skills")
        skill_id = params.get("skill_id")
        if not skill_id:
            raise ValueError("skill_id is required")
        skill = get_skill(discover_skills(root), str(skill_id))
        if skill is None:
            return _error(req_id, -32004, f"Skill not found: {skill_id}")
        return _result(req_id, {"skill": skill.to_dict()})

    if method == "skills.validate":
        root = params.get("root", "skills")
        report = validate_skills(discover_skills(root))
        return _result(req_id, report.to_dict())

    if method == "skills.render":
        root = params.get("root", "skills")
        output = params.get("output")
        targets = params.get("targets")
        if not output:
            raise ValueError("output is required")
        if not isinstance(targets, list) or not targets:
            raise ValueError("targets must be a non-empty list")
        result = export_targets(root, output, [str(t) for t in targets])
        return _result(req_id, result)

    if method == "skills.run":
        root = params.get("root", "skills")
        skill_id = params.get("skill_id")
        if not skill_id:
            raise ValueError("skill_id is required")
        inputs = params.get("inputs", {})
        if not isinstance(inputs, dict):
            raise ValueError("inputs must be an object")
        result = run_skill(root, str(skill_id), inputs=inputs)
        return _result(req_id, result)

    return _error(req_id, -32601, f"Method not found: {method}")


def serve_stdio(default_root: str | Path = "skills") -> int:
    for raw in sys.stdin:
        line = raw.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
        except json.JSONDecodeError as exc:
            response = _error(None, -32700, f"Parse error: {exc.msg}")
        else:
            if isinstance(request, dict) and "params" in request and isinstance(request["params"], dict):
                request.setdefault("params", {})
                request["params"].setdefault("root", str(default_root))
            response = handle_request(request if isinstance(request, dict) else {})
        sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
        sys.stdout.flush()
    return 0


def _result(req_id: Any, result: dict[str, Any]) -> dict[str, Any]:
    return {"jsonrpc": JSONRPC_VERSION, "id": req_id, "result": result}


def _error(req_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": JSONRPC_VERSION, "id": req_id, "error": {"code": code, "message": message}}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="skills_platform JSON-RPC/MCP skeleton server")
    parser.add_argument("--root", default="skills", help="Default skills root")
    parser.add_argument("--once", help="Handle one JSON request payload and print response")
    args = parser.parse_args(argv)
    if args.once:
        request = json.loads(args.once)
        response = handle_request(request)
        print(json.dumps(response, indent=2, ensure_ascii=False))
        return 0
    return serve_stdio(default_root=args.root)


if __name__ == "__main__":
    raise SystemExit(main())

