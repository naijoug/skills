#!/usr/bin/env python3
"""Session parsing for multi-source transcript formats."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

from common import redact_text


USER_ROLE_HINTS = {"user", "human", "owner"}



def _safe_read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""



def _collect_text(obj: Any) -> List[str]:
    out: List[str] = []
    if isinstance(obj, str):
        if obj.strip():
            out.append(obj)
    elif isinstance(obj, list):
        for item in obj:
            out.extend(_collect_text(item))
    elif isinstance(obj, dict):
        for key, value in obj.items():
            if key in {"content", "text", "parts", "message", "input", "body"}:
                out.extend(_collect_text(value))
    return out



def _looks_user_message(obj: Dict[str, Any]) -> bool:
    role = str(obj.get("role", "")).lower()
    if role in USER_ROLE_HINTS:
        return True

    author = obj.get("author")
    if isinstance(author, dict):
        if str(author.get("role", "")).lower() in USER_ROLE_HINTS:
            return True

    speaker = str(obj.get("speaker", "")).lower()
    if speaker in USER_ROLE_HINTS:
        return True

    typ = str(obj.get("type", "")).lower()
    if typ in {"user", "user_message", "input"}:
        return True

    payload = obj.get("payload")
    if isinstance(payload, dict):
        role2 = str(payload.get("role", "")).lower()
        if role2 in USER_ROLE_HINTS:
            return True

    return False



def _extract_claude_usage_tokens(line_obj: Dict[str, Any]) -> int:
    if line_obj.get("type") != "assistant":
        return 0
    msg = line_obj.get("message")
    if not isinstance(msg, dict):
        return 0
    usage = msg.get("usage")
    if not isinstance(usage, dict):
        return 0
    return int(usage.get("input_tokens", 0)) + int(usage.get("output_tokens", 0)) + int(
        usage.get("cache_creation_input_tokens", 0)
    ) + int(usage.get("cache_read_input_tokens", 0))



def _parse_jsonl(path: Path, source: str) -> Tuple[List[str], int, int]:
    user_msgs: List[str] = []
    parsed_lines = 0
    claude_tokens = 0

    try:
        with path.open("r", encoding="utf-8", errors="replace") as f:
            for raw in f:
                line = raw.strip()
                if not line:
                    continue
                parsed_lines += 1
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue

                if source == "claude_code":
                    claude_tokens += _extract_claude_usage_tokens(obj)

                if path.name == "history.jsonl" and isinstance(obj, dict):
                    text = obj.get("text")
                    if isinstance(text, str) and text.strip():
                        user_msgs.append(text)
                    continue

                if isinstance(obj, dict) and _looks_user_message(obj):
                    chunks = _collect_text(obj)
                    if chunks:
                        user_msgs.append("\n".join(chunks))

    except OSError:
        return [], 0, 0

    return user_msgs, parsed_lines, claude_tokens



def _parse_cursor_txt(path: Path) -> List[str]:
    text = _safe_read_text(path)
    if not text:
        return []

    msgs: List[str] = []
    for m in re.finditer(r"(?:^|\n)user:\s*(.*?)(?=(?:\nassistant:|\nuser:|\Z))", text, re.S | re.I):
        block = m.group(1).strip()
        query_tags = re.findall(r"<user_query>(.*?)</user_query>", block, flags=re.S | re.I)
        if query_tags:
            for q in query_tags:
                q = q.strip()
                if q:
                    msgs.append(q)
        elif block:
            msgs.append(block)
    return msgs



def _parse_chatgpt_export(path: Path) -> List[str]:
    raw = _safe_read_text(path)
    if not raw:
        return []

    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        return []

    convs: Iterable[Any]
    if isinstance(obj, list):
        convs = obj
    elif isinstance(obj, dict):
        convs = [obj]
    else:
        return []

    out: List[Tuple[float, str]] = []
    for conv in convs:
        if not isinstance(conv, dict):
            continue
        mapping = conv.get("mapping")
        if not isinstance(mapping, dict):
            continue

        for node in mapping.values():
            if not isinstance(node, dict):
                continue
            msg = node.get("message")
            if not isinstance(msg, dict):
                continue
            author = msg.get("author")
            role = ""
            if isinstance(author, dict):
                role = str(author.get("role", "")).lower()
            if role != "user":
                continue
            content = msg.get("content")
            parts = []
            if isinstance(content, dict):
                parts = content.get("parts") or []
            text_parts = [p for p in parts if isinstance(p, str) and p.strip()]
            if not text_parts:
                continue
            ts = node.get("create_time") or msg.get("create_time") or 0
            try:
                tsf = float(ts)
            except Exception:
                tsf = 0
            out.append((tsf, "\n".join(text_parts)))

    out.sort(key=lambda x: x[0])
    return [t for _, t in out]



def _token_estimate(source: str, size: int, claude_tokens: int) -> int:
    if source == "claude_code" and claude_tokens > 0:
        return claude_tokens
    return max(0, size // 3)



def parse_sessions(file_rows: List[Dict[str, Any]], redaction_enabled: bool = True) -> Dict[str, Any]:
    sessions: List[Dict[str, Any]] = []
    all_messages: List[Dict[str, Any]] = []
    failures: List[str] = []

    for row in file_rows:
        p = Path(row["path"])
        source = row["source"]
        size = int(row.get("size", 0))

        user_msgs: List[str] = []
        parsed_lines = 0
        claude_tokens = 0

        try:
            if p.suffix == ".jsonl":
                user_msgs, parsed_lines, claude_tokens = _parse_jsonl(p, source)
            elif p.suffix == ".txt":
                user_msgs = _parse_cursor_txt(p)
            elif p.suffix == ".json" and "conversations" in p.name.lower():
                user_msgs = _parse_chatgpt_export(p)
            elif p.suffix == ".json":
                content = _safe_read_text(p)
                if content:
                    try:
                        obj = json.loads(content)
                        if isinstance(obj, dict) and _looks_user_message(obj):
                            user_msgs = _collect_text(obj)
                    except json.JSONDecodeError:
                        pass
        except Exception as exc:
            failures.append(f"{p}: parse exception: {exc}")

        if redaction_enabled:
            user_msgs = [redact_text(m) for m in user_msgs]

        snippets = [m.strip().replace("\n", " ")[:240] for m in user_msgs if m.strip()][:3]

        sess = {
            "path": str(p),
            "source": source,
            "evidence_level": row.get("evidence_level"),
            "doc_url": row.get("doc_url"),
            "size": size,
            "mtime": row.get("mtime"),
            "status": row.get("status"),
            "parsed_lines": parsed_lines,
            "user_message_count": len(user_msgs),
            "token_estimate": _token_estimate(source, size, claude_tokens),
            "snippets": snippets,
            "parse_ok": True,
        }

        if not user_msgs and p.suffix in {".jsonl", ".txt", ".json"}:
            # Keep as a soft failure signal; source may not expose user content.
            sess["parse_ok"] = False

        sessions.append(sess)

        for msg in user_msgs:
            all_messages.append(
                {
                    "source": source,
                    "path": str(p),
                    "mtime": row.get("mtime"),
                    "text": msg,
                    "length": len(msg),
                }
            )

    by_source: Dict[str, Dict[str, Any]] = {}
    for s in sessions:
        src = s["source"]
        grp = by_source.setdefault(
            src,
            {
                "sessions": 0,
                "parsed_ok": 0,
                "messages": 0,
                "tokens": 0,
                "date_min": None,
                "date_max": None,
            },
        )
        grp["sessions"] += 1
        if s["parse_ok"]:
            grp["parsed_ok"] += 1
        grp["messages"] += int(s["user_message_count"])
        grp["tokens"] += int(s["token_estimate"])

        try:
            ts = float(s["mtime"])
            dt = datetime.fromtimestamp(ts, tz=timezone.utc).date().isoformat()
            if not grp["date_min"] or dt < grp["date_min"]:
                grp["date_min"] = dt
            if not grp["date_max"] or dt > grp["date_max"]:
                grp["date_max"] = dt
        except Exception:
            pass

    parse_success = 0.0
    if sessions:
        parse_success = round(sum(1 for s in sessions if s["parse_ok"]) / len(sessions), 4)

    evidence: List[Dict[str, Any]] = []
    for s in sessions:
        for snip in s["snippets"]:
            evidence.append(
                {
                    "source": s["source"],
                    "path": s["path"],
                    "snippet": snip,
                }
            )
    evidence = evidence[:100]

    return {
        "sessions": sessions,
        "messages": all_messages,
        "by_source": by_source,
        "parse_success": parse_success,
        "failures": failures,
        "evidence": evidence,
    }


if __name__ == "__main__":
    import json as _json

    sample = []
    print(_json.dumps(parse_sessions(sample), ensure_ascii=False, indent=2))
