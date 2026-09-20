#!/usr/bin/env python3
"""Synchronize one linker-owned instruction block without rewriting user rules."""

from __future__ import annotations

import argparse
import os
import re
import stat
import sys
import tempfile
from pathlib import Path


def read_text(path: Path) -> str:
    with path.open(encoding="utf-8", newline="") as stream:
        return stream.read()


def block_span(text: str, skill_id: str) -> tuple[int, int] | None:
    begin = f"<!-- skills-linker:{skill_id}:begin -->"
    end = f"<!-- skills-linker:{skill_id}:end -->"
    starts = list(re.finditer(rf"(?m)^{re.escape(begin)}\r?$", text))
    ends = list(re.finditer(rf"(?m)^{re.escape(end)}\r?$", text))
    if not starts and not ends:
        return None
    if len(starts) != 1 or len(ends) != 1 or starts[0].end() >= ends[0].start():
        raise ValueError(f"Malformed or duplicate managed block for {skill_id}; file left unchanged")
    if "<!-- skills-linker:" in text[starts[0].end():ends[0].start()]:
        raise ValueError(f"Nested managed block for {skill_id}; file left unchanged")
    stop = ends[0].end()
    if text[stop:stop + 1] == "\n":
        stop += 1
    return starts[0].start(), stop


def expected_block(source: Path, skill_id: str, newline: str) -> str:
    content = read_text(source).replace("\r\n", "\n").rstrip("\n")
    if "<!-- skills-linker:" in content:
        raise ValueError("inject.md must not contain managed block markers")
    return newline.join((f"<!-- skills-linker:{skill_id}:begin -->", content.replace("\n", newline),
                         f"<!-- skills-linker:{skill_id}:end -->", ""))


def atomic_write(path: Path, text: str) -> None:
    # Resolve an existing symlink rather than replacing the symlink itself.
    path = path.resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = stat.S_IMODE(path.stat().st_mode) if path.exists() else 0o600
    fd, filename = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as stream:
            stream.write(text)
        os.chmod(filename, mode)
        os.replace(filename, path)
    finally:
        if os.path.exists(filename):
            os.unlink(filename)


def synchronize(action: str, target: Path, skill_id: str, source: Path | None = None) -> str:
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", skill_id):
        raise ValueError(f"Invalid skill id: {skill_id}")
    text = read_text(target) if target.exists() else ""
    span = block_span(text, skill_id)
    if action == "remove":
        if span is None:
            return "absent"
        updated = text[:span[0]] + text[span[1]:]
        if updated:
            atomic_write(target, updated)
        else:
            target.resolve().unlink()
        return "removed"
    if source is None:
        raise ValueError("--source is required for sync/status")
    block = expected_block(source, skill_id, "\r\n" if "\r\n" in text else "\n")
    state = "missing" if span is None else "current" if text[span[0]:span[1]] == block else "stale"
    if action == "status" or state == "current":
        return state
    if span is None:
        updated = text + ("\n" if text and not text.endswith("\n") else "") + block
    else:
        updated = text[:span[0]] + block + text[span[1]:]
    atomic_write(target, updated)
    return "added" if state == "missing" else "updated"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("sync", "remove", "status"))
    parser.add_argument("--target", type=Path, required=True)
    parser.add_argument("--skill-id", required=True)
    parser.add_argument("--source", type=Path)
    args = parser.parse_args()
    try:
        print(synchronize(args.action, args.target, args.skill_id, args.source))
    except (OSError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
