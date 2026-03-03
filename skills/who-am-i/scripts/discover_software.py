#!/usr/bin/env python3
"""Software and tool inventory discovery."""

from __future__ import annotations

import json
import os
import platform
import shutil
from pathlib import Path
from typing import Any, Dict, List

from common import run_command, safe_rel


AI_TOOL_DIRS = {
    "claude_code": ["~/.claude", "~/.config/claude"],
    "codex": ["~/.codex"],
    "openclaw": ["~/.openclaw"],
    "cursor": ["~/.cursor", "~/Library/Application Support/Cursor"],
    "windsurf": ["~/.windsurf", "~/.codeium/windsurf", "~/Library/Application Support/Windsurf"],
    "antigravity": ["~/.gemini/antigravity", "~/Library/Application Support/Antigravity"],
    "chatgpt_export": ["~/Desktop/chatgpt_history", "~/Downloads"],
}


CLI_CANDIDATES = [
    "python3",
    "node",
    "npm",
    "pnpm",
    "yarn",
    "git",
    "docker",
    "kubectl",
    "go",
    "cargo",
    "rustc",
    "brew",
    "pip3",
    "pipx",
    "uv",
]



def _discover_cli_tools() -> Dict[str, Any]:
    tools: List[Dict[str, Any]] = []
    for name in CLI_CANDIDATES:
        path = shutil.which(name)
        if not path:
            continue
        version = run_command([name, "--version"], timeout=8)
        first = version.splitlines()[0] if version else ""
        tools.append({"name": name, "path": path, "version": first})

    return {
        "count": len(tools),
        "tools": tools,
    }



def _discover_package_managers() -> Dict[str, Any]:
    managers: Dict[str, Any] = {}

    if shutil.which("brew"):
        out = run_command(["brew", "list", "--versions"], timeout=45)
        lines = [ln for ln in out.splitlines() if ln.strip()]
        managers["brew"] = {"installed_count": len(lines), "sample": lines[:20]}

    if shutil.which("npm"):
        out = run_command(["npm", "list", "-g", "--depth=0", "--json"], timeout=45)
        try:
            obj = json.loads(out) if out else {}
            deps = obj.get("dependencies", {}) if isinstance(obj, dict) else {}
            managers["npm_global"] = {
                "installed_count": len(deps),
                "sample": sorted(list(deps.keys()))[:20],
            }
        except json.JSONDecodeError:
            managers["npm_global"] = {"installed_count": 0, "sample": []}

    if shutil.which("pip3"):
        out = run_command(["pip3", "list", "--format=json"], timeout=45)
        try:
            pkgs = json.loads(out) if out else []
            names = [p.get("name", "") for p in pkgs if isinstance(p, dict)]
            managers["pip3"] = {"installed_count": len(names), "sample": sorted(names)[:20]}
        except json.JSONDecodeError:
            managers["pip3"] = {"installed_count": 0, "sample": []}

    if shutil.which("cargo"):
        out = run_command(["cargo", "install", "--list"], timeout=45)
        crates = [ln.split(" ")[0] for ln in out.splitlines() if ln and not ln.startswith(" ")]
        managers["cargo"] = {"installed_count": len(crates), "sample": crates[:20]}

    return managers



def _discover_gui_apps() -> Dict[str, Any]:
    sysname = platform.system().lower()
    apps: List[str] = []

    if sysname == "darwin":
        roots = [Path("/Applications"), Path.home() / "Applications"]
        for root in roots:
            if not root.exists():
                continue
            for p in sorted(root.glob("*.app")):
                apps.append(p.stem)
    elif sysname == "linux":
        roots = [Path("/usr/share/applications"), Path.home() / ".local/share/applications"]
        for root in roots:
            if not root.exists():
                continue
            for p in sorted(root.glob("*.desktop")):
                apps.append(p.stem)

    dedup = sorted(set(apps))
    return {
        "count": len(dedup),
        "sample": dedup[:120],
    }



def _discover_ai_tools() -> Dict[str, Any]:
    rows: List[Dict[str, Any]] = []

    for key, dirs in AI_TOOL_DIRS.items():
        expanded = [Path(os.path.expanduser(d)) for d in dirs]
        existing = [p for p in expanded if p.exists()]
        rows.append(
            {
                "name": key,
                "detected": bool(existing),
                "locations": [safe_rel(p) for p in existing],
                "all_candidates": [str(p) for p in expanded],
            }
        )

    detected = [r for r in rows if r["detected"]]
    return {
        "count": len(detected),
        "detected": detected,
        "all": rows,
    }



def discover_software_inventory() -> Dict[str, Any]:
    return {
        "platform": {
            "system": platform.system(),
            "release": platform.release(),
            "machine": platform.machine(),
            "python": platform.python_version(),
        },
        "cli": _discover_cli_tools(),
        "package_managers": _discover_package_managers(),
        "gui": _discover_gui_apps(),
        "ai_tools": _discover_ai_tools(),
    }


if __name__ == "__main__":
    import json as _json

    print(_json.dumps(discover_software_inventory(), ensure_ascii=False, indent=2))
