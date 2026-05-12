#!/usr/bin/env python3
"""Entry point for who-am-i local pipeline."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

from analyze_profile import analyze_profile
from common import (
    OUTPUT_DIR,
    ensure_authorization,
    ensure_local_dirs,
    load_config,
    load_state,
    now_iso,
    save_state,
)
from discover_sessions import discover_sessions
from discover_software import discover_software_inventory
from parse_sessions import parse_sessions
from render_markdown import render_markdown
from render_web_native import render_native_web
from render_web_react import render_react_web



def _ts_slug() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")



def _write_json(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")



def _load_profile_for_render_only(state: Dict[str, Any]) -> Dict[str, Any]:
    last_profile = state.get("last_profile_path")
    if not last_profile:
        raise RuntimeError("No previous profile found in state; run full/incremental first.")
    p = Path(last_profile)
    if not p.exists():
        raise RuntimeError(f"Previous profile path missing: {p}")
    return json.loads(p.read_text(encoding="utf-8"))



def _merge_state_patch(state: Dict[str, Any], patch: Dict[str, Any]) -> Dict[str, Any]:
    state["files"] = patch.get("files", {})
    removed = state.get("removed", {})
    removed.update(patch.get("removed", {}))
    state["removed"] = removed
    state["last_scan_at"] = patch.get("last_scan_at", now_iso())
    return state



def run(args: argparse.Namespace) -> Dict[str, Any]:
    ensure_local_dirs()
    cfg = load_config()
    state = load_state()

    profile: Dict[str, Any]
    discovery: Dict[str, Any] = {"meta": {}, "files": [], "included_files": [], "by_source": {}, "errors": [], "state_patch": {}}

    if args.mode in {"full", "incremental"}:
        cfg = ensure_authorization(cfg)
        inventory = discover_software_inventory()
        discovery = discover_sessions(
            cfg=cfg,
            state=state,
            mode=args.mode,
            since=args.since,
            strict_official=bool(args.strict_official),
        )
        parsed = parse_sessions(
            discovery.get("included_files", []),
            redaction_enabled=bool(cfg.get("redaction", {}).get("enabled", True)),
        )
        profile = analyze_profile(
            inventory=inventory,
            discovery=discovery,
            parsed=parsed,
            mode=args.mode,
        )
        state = _merge_state_patch(state, discovery.get("state_patch", {}))
    else:
        profile = _load_profile_for_render_only(state)
        profile.setdefault("meta", {})["mode"] = "render-only"

    ts = _ts_slug()
    out_root = Path(args.output_dir).expanduser().resolve() if args.output_dir else (OUTPUT_DIR / ts)
    data_dir = out_root / "data"
    native_dir = out_root / "native"

    data_dir.mkdir(parents=True, exist_ok=True)
    native_dir.mkdir(parents=True, exist_ok=True)

    profile_json_path = data_dir / "profile.json"
    report_md_path = out_root / "report.md"

    # Fill outputs after rendering paths are known.
    profile.setdefault("outputs", {})

    md = render_markdown(profile)
    report_md_path.write_text(md, encoding="utf-8")

    native_index = render_native_web(profile, native_dir)

    react_result = None
    if not args.no_react:
        react_result = render_react_web(profile, out_root)

    profile["outputs"] = {
        "profile_json": str(profile_json_path),
        "report_markdown": str(report_md_path),
        "native_index": str(native_index),
        "react_index": react_result.get("index_html") if react_result else None,
        "react_build_ok": react_result.get("build_ok") if react_result else None,
        "react_warnings": react_result.get("warnings") if react_result else [],
    }

    _write_json(profile_json_path, profile)

    state["last_output_dir"] = str(out_root)
    state["last_profile_path"] = str(profile_json_path)
    state["last_run_mode"] = args.mode
    state["last_render_at"] = now_iso()
    save_state(state)

    return {
        "ok": True,
        "mode": args.mode,
        "output_dir": str(out_root),
        "profile_json": str(profile_json_path),
        "report_markdown": str(report_md_path),
        "native_index": str(native_index),
        "react": react_result,
        "discovery_meta": discovery.get("meta", {}),
        "discovery_errors": discovery.get("errors", []),
    }



def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="who-am-i local profile generator")
    p.add_argument("--mode", choices=["full", "incremental", "render-only"], default="incremental")
    p.add_argument("--since", default=None, help="ISO8601 timestamp for incremental inclusion")
    p.add_argument("--output-dir", default=None, help="Custom output directory")
    p.add_argument("--no-react", action="store_true", help="Skip react output generation")
    p.add_argument("--strict-official", action="store_true", help="Skip community_candidate session paths")
    return p


if __name__ == "__main__":
    parser = build_parser()
    ns = parser.parse_args()
    result = run(ns)
    print(json.dumps(result, ensure_ascii=False, indent=2))
