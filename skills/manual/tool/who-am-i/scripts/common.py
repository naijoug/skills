#!/usr/bin/env python3
"""Common helpers for who-am-i local pipeline."""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

APP_DIR = Path.home() / ".who-am-i"
CONFIG_PATH = APP_DIR / "config.yaml"
STATE_PATH = APP_DIR / "state.json"
OUTPUT_DIR = APP_DIR / "output"

SENSITIVE_DIR_KEYS = ["Desktop", "Downloads", "Library"]

RE_EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
RE_PHONE = re.compile(r"(?:(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4})")
RE_SECRET = re.compile(
    r"(?i)(?:api[_-]?key|token|secret|authorization|password)\s*[:=]\s*['\"]?[A-Za-z0-9_\-\.]{8,}['\"]?"
)
RE_OPENAI_KEY = re.compile(r"sk-[A-Za-z0-9]{10,}")


@dataclass
class Fingerprint:
    mtime: float
    size: int
    sample_hash: str

    def to_dict(self) -> Dict[str, Any]:
        return {"mtime": self.mtime, "size": self.size, "sample_hash": self.sample_hash}



def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()



def ensure_local_dirs() -> None:
    APP_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)



def _default_source_config() -> Dict[str, bool]:
    return {
        "claude_code": True,
        "codex": True,
        "openclaw": True,
        "cursor": True,
        "windsurf": True,
        "antigravity": True,
        "chatgpt_export": True,
    }



def default_config() -> Dict[str, Any]:
    return {
        "version": 1,
        "local_only": True,
        "authorization": {
            "home_scan_authorized": False,
            "sensitive_dirs_authorized": {
                "Desktop": False,
                "Downloads": False,
                "Library": False,
            },
        },
        "scan": {
            "default_mode": "incremental",
            "incremental_lookback_days": 7,
            "strict_official_default": False,
        },
        "sources": _default_source_config(),
        "redaction": {
            "enabled": True,
            "redact_paths": True,
            "redact_emails": True,
            "redact_phone": True,
            "redact_secrets": True,
        },
    }



def _read_json_file(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)



def _write_json_file(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
    tmp.replace(path)



def load_config() -> Dict[str, Any]:
    ensure_local_dirs()
    if not CONFIG_PATH.exists():
        cfg = default_config()
        _write_json_file(CONFIG_PATH, cfg)
        return cfg
    try:
        return _read_json_file(CONFIG_PATH)
    except Exception:
        cfg = default_config()
        _write_json_file(CONFIG_PATH, cfg)
        return cfg



def save_config(cfg: Dict[str, Any]) -> None:
    _write_json_file(CONFIG_PATH, cfg)



def load_state() -> Dict[str, Any]:
    ensure_local_dirs()
    if not STATE_PATH.exists():
        return {
            "version": 1,
            "last_scan_at": None,
            "files": {},
            "removed": {},
        }
    try:
        return _read_json_file(STATE_PATH)
    except Exception:
        return {
            "version": 1,
            "last_scan_at": None,
            "files": {},
            "removed": {},
        }



def save_state(state: Dict[str, Any]) -> None:
    _write_json_file(STATE_PATH, state)



def ask_yes_no(prompt: str, default: bool = False) -> bool:
    if not sys.stdin.isatty():
        return default
    suffix = "[Y/n]" if default else "[y/N]"
    raw = input(f"{prompt} {suffix} ").strip().lower()
    if not raw:
        return default
    return raw in {"y", "yes"}



def ensure_authorization(cfg: Dict[str, Any]) -> Dict[str, Any]:
    auth = cfg.setdefault("authorization", {})
    non_interactive = not sys.stdin.isatty()
    auto_authorize = os.environ.get("WHO_AM_I_AUTO_AUTHORIZE", "1") == "1"
    if not auth.get("home_scan_authorized", False):
        if non_interactive and auto_authorize:
            granted = True
        else:
            granted = ask_yes_no(
                "Authorize read-only scan under your HOME directory? No data will be uploaded.",
                default=False,
            )
        auth["home_scan_authorized"] = granted
        if not granted:
            raise RuntimeError("Authorization denied: HOME scan not permitted.")

    sensitive = auth.setdefault("sensitive_dirs_authorized", {})
    for key in SENSITIVE_DIR_KEYS:
        if key not in sensitive:
            sensitive[key] = False

    missing = [k for k in SENSITIVE_DIR_KEYS if not sensitive.get(k, False)]
    if missing and not non_interactive:
        print("Sensitive directory authorization needed:", ", ".join(missing))
    for key in missing:
        if non_interactive:
            # Preserve existing false default in unattended runs.
            sensitive[key] = bool(sensitive.get(key, False))
        else:
            sensitive[key] = ask_yes_no(f"Authorize read-only access to ~/{key}?", default=False)

    save_config(cfg)
    return cfg



def sample_hash(path: Path, sample_bytes: int = 4096) -> str:
    h = hashlib.sha256()
    try:
        with path.open("rb") as f:
            chunk = f.read(sample_bytes)
            h.update(chunk)
    except OSError:
        return ""
    return h.hexdigest()



def compute_fingerprint(path: Path) -> Optional[Fingerprint]:
    try:
        stat = path.stat()
    except OSError:
        return None
    return Fingerprint(mtime=stat.st_mtime, size=stat.st_size, sample_hash=sample_hash(path))



def short_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]



def run_command(cmd: Iterable[str], timeout: int = 30) -> str:
    try:
        proc = subprocess.run(
            list(cmd),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=timeout,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return (proc.stdout or "").strip()



def redact_text(text: str, home: Optional[Path] = None) -> str:
    out = text
    out = RE_OPENAI_KEY.sub("[REDACTED_SECRET]", out)
    out = RE_SECRET.sub("[REDACTED_SECRET]", out)
    out = RE_EMAIL.sub("[REDACTED_EMAIL]", out)
    out = RE_PHONE.sub("[REDACTED_PHONE]", out)

    h = (home or Path.home()).as_posix()
    if h:
        out = out.replace(h, "~/<redacted_path>")
    out = re.sub(r"/Users/[^/\s]+", "/Users/<user>", out)
    return out



def safe_rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(Path.home()))
    except Exception:
        return str(path)
