#!/usr/bin/env python3
"""Session discovery with official-first path policy and incremental detection."""

from __future__ import annotations

import glob
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from common import compute_fingerprint, now_iso


@dataclass
class SourceRule:
    source: str
    evidence_level: str
    doc_url: str
    patterns: List[str]


SOURCE_RULES: List[SourceRule] = [
    SourceRule(
        source="claude_code",
        evidence_level="official_partial",
        doc_url="https://docs.anthropic.com/en/docs/claude-code/cli-reference",
        patterns=[
            "~/.claude/projects/**/*.jsonl",
            "~/.config/claude/projects/**/*.jsonl",
        ],
    ),
    SourceRule(
        source="codex",
        evidence_level="official_explicit",
        doc_url="https://developers.openai.com/codex/app/troubleshooting/",
        patterns=[
            "~/.codex/sessions/**/*.jsonl",
            "~/.codex/archived_sessions/**/*.jsonl",
            "~/.codex/history.jsonl",
        ],
    ),
    SourceRule(
        source="openclaw",
        evidence_level="official_explicit",
        doc_url="https://docs.openclaw.im/getting-started/installation",
        patterns=[
            "~/.openclaw/sessions/**/*.jsonl",
            "~/.openclaw/agents/**/*.jsonl",
            "~/.openclaw/sessions.json",
        ],
    ),
    SourceRule(
        source="cursor",
        evidence_level="official_partial",
        doc_url="https://docs.cursor.com/privacy/data-privacy",
        patterns=[
            "~/.cursor/projects/**/agent-transcripts/**/*.jsonl",
            "~/.cursor/projects/**/agent-transcripts/**/*.txt",
            "~/Library/Application Support/Cursor/**/agent-transcripts/**/*.jsonl",
            "~/Library/Application Support/Cursor/**/agent-transcripts/**/*.txt",
        ],
    ),
    SourceRule(
        source="windsurf",
        evidence_level="official_partial",
        doc_url="https://codeium.com/windsurf",
        patterns=[
            "~/.codeium/windsurf/**/*.jsonl",
            "~/.codeium/windsurf/**/*.json",
            "~/.windsurf/**/*.jsonl",
            "~/.windsurf/**/*.json",
            "~/Library/Application Support/Windsurf/**/*.jsonl",
            "~/Library/Application Support/Windsurf/**/*.json",
            "~/Library/Application Support/Codeium/Windsurf/**/*.jsonl",
            "~/Library/Application Support/Codeium/Windsurf/**/*.json",
        ],
    ),
    SourceRule(
        source="antigravity",
        evidence_level="community_candidate",
        doc_url="https://github.com/google-gemini",
        patterns=[
            "~/Library/Application Support/Antigravity/**/*.json",
            "~/Library/Application Support/Antigravity/**/*.jsonl",
            "~/.gemini/antigravity/**/*.json",
            "~/.gemini/antigravity/**/*.jsonl",
        ],
    ),
    SourceRule(
        source="chatgpt_export",
        evidence_level="official_explicit",
        doc_url="https://help.openai.com/en/articles/7260999-how-do-i-export-my-chatgpt-history-and-data",
        patterns=[
            "~/Desktop/chatgpt_history/**/conversations*.json",
            "~/Downloads/**/conversations*.json",
        ],
    ),
]

EVIDENCE_RANK = {
    "official_explicit": 3,
    "official_partial": 2,
    "community_candidate": 1,
}



def _expand(pattern: str) -> str:
    return os.path.expanduser(pattern)



def _is_sensitive(path: Path) -> Optional[str]:
    p = path.expanduser().resolve()
    home = Path.home().resolve()
    sensitive_roots = {
        "Desktop": home / "Desktop",
        "Downloads": home / "Downloads",
        "Library": home / "Library",
    }
    for key, root in sensitive_roots.items():
        try:
            p.relative_to(root)
            return key
        except Exception:
            continue
    return None



def _allowed_by_auth(path: Path, cfg: Dict[str, Any]) -> bool:
    sensitive = _is_sensitive(path)
    if not sensitive:
        return True
    return bool(
        cfg.get("authorization", {})
        .get("sensitive_dirs_authorized", {})
        .get(sensitive, False)
    )



def _iter_files(pattern: str) -> List[Path]:
    return [Path(p) for p in glob.glob(_expand(pattern), recursive=True) if Path(p).is_file()]



def _parse_iso(value: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc)
    except Exception:
        return None



def discover_sessions(
    cfg: Dict[str, Any],
    state: Dict[str, Any],
    mode: str,
    since: Optional[str],
    strict_official: bool,
) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    lookback_days = int(cfg.get("scan", {}).get("incremental_lookback_days", 7))
    lookback_threshold = now - timedelta(days=lookback_days)
    since_dt = _parse_iso(since) if since else None

    previous_files: Dict[str, Any] = state.get("files", {})
    discovered_by_path: Dict[str, Dict[str, Any]] = {}
    errors: List[str] = []

    enabled = cfg.get("sources", {})

    for rule in SOURCE_RULES:
        if not enabled.get(rule.source, True):
            continue
        if strict_official and rule.evidence_level == "community_candidate":
            continue

        try:
            files: List[Path] = []
            for pattern in rule.patterns:
                files.extend(_iter_files(pattern))
        except Exception as exc:
            errors.append(f"{rule.source}: discovery error: {exc}")
            continue

        for path in files:
            if not _allowed_by_auth(path, cfg):
                continue
            fp = compute_fingerprint(path)
            if fp is None:
                continue

            key = str(path)
            candidate = {
                "path": key,
                "source": rule.source,
                "evidence_level": rule.evidence_level,
                "doc_url": rule.doc_url,
                "size": fp.size,
                "mtime": fp.mtime,
                "fingerprint": fp.to_dict(),
            }

            existing = discovered_by_path.get(key)
            if not existing:
                discovered_by_path[key] = candidate
            else:
                if EVIDENCE_RANK[candidate["evidence_level"]] > EVIDENCE_RANK[existing["evidence_level"]]:
                    discovered_by_path[key] = candidate

    discovered: List[Dict[str, Any]] = []
    next_files_state: Dict[str, Any] = {}

    for path_key, row in discovered_by_path.items():
        prev = previous_files.get(path_key)
        status = "unchanged"
        if not prev:
            status = "new"
        else:
            prev_fp = prev.get("fingerprint", {})
            curr_fp = row["fingerprint"]
            if (
                prev_fp.get("mtime") != curr_fp.get("mtime")
                or prev_fp.get("size") != curr_fp.get("size")
                or prev_fp.get("sample_hash") != curr_fp.get("sample_hash")
            ):
                status = "changed"

        include = True
        mtime_dt = datetime.fromtimestamp(row["mtime"], tz=timezone.utc)

        if mode == "incremental":
            include = status in {"new", "changed"}
            if not include and mtime_dt >= lookback_threshold:
                include = True
            if since_dt and mtime_dt >= since_dt:
                include = True

        row["status"] = status
        row["included"] = include
        discovered.append(row)

        next_files_state[path_key] = {
            "source": row["source"],
            "evidence_level": row["evidence_level"],
            "fingerprint": row["fingerprint"],
            "last_seen": now_iso(),
        }

    removed: Dict[str, Any] = {}
    current_paths = set(discovered_by_path.keys())
    for prev_path, prev_info in previous_files.items():
        if prev_path not in current_paths:
            removed[prev_path] = {
                "source": prev_info.get("source", "unknown"),
                "removed_at": now_iso(),
            }

    included_files = [d for d in discovered if d.get("included")]

    by_source: Dict[str, Dict[str, Any]] = {}
    for row in discovered:
        src = row["source"]
        grp = by_source.setdefault(
            src,
            {
                "total": 0,
                "included": 0,
                "new": 0,
                "changed": 0,
                "evidence_levels": {},
            },
        )
        grp["total"] += 1
        if row["included"]:
            grp["included"] += 1
        if row["status"] == "new":
            grp["new"] += 1
        if row["status"] == "changed":
            grp["changed"] += 1
        lvl = row["evidence_level"]
        grp["evidence_levels"][lvl] = grp["evidence_levels"].get(lvl, 0) + 1

    return {
        "meta": {
            "scanned_at": now_iso(),
            "mode": mode,
            "strict_official": strict_official,
            "since": since,
            "lookback_days": lookback_days,
        },
        "files": discovered,
        "included_files": included_files,
        "by_source": by_source,
        "errors": errors,
        "state_patch": {
            "files": next_files_state,
            "removed": removed,
            "last_scan_at": now_iso(),
        },
    }


if __name__ == "__main__":
    import json
    from common import load_config, load_state

    cfg = load_config()
    state = load_state()
    out = discover_sessions(cfg, state, mode="incremental", since=None, strict_official=False)
    print(json.dumps(out["meta"], ensure_ascii=False, indent=2))
    print(f"included_files={len(out['included_files'])}")
