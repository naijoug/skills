from __future__ import annotations

from .tool_renderers import GenericToolAdapter

SUPPORTED_TARGETS = (
    "codex",
    "claude-code",
    "amp",
    "trae",
    "antigravity",
    "cursor",
    "vscode",
)


def get_adapter(target: str):
    normalized = target.strip().lower()
    if normalized not in SUPPORTED_TARGETS:
        raise ValueError(f"Unsupported target: {target}")
    return GenericToolAdapter(normalized)


def list_supported_targets() -> list[str]:
    return list(SUPPORTED_TARGETS)

