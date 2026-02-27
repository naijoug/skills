from __future__ import annotations

from dataclasses import dataclass

from .simple_yaml import parse_simple_yaml


@dataclass(frozen=True)
class FrontmatterDocument:
    frontmatter: dict
    body: str


def parse_markdown_frontmatter(text: str) -> FrontmatterDocument:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return FrontmatterDocument(frontmatter={}, body=text)

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return FrontmatterDocument(frontmatter={}, body=text)

    frontmatter_text = "\n".join(lines[1:end_idx])
    body = "\n".join(lines[end_idx + 1 :]).lstrip("\n")
    parsed = parse_simple_yaml(frontmatter_text) if frontmatter_text.strip() else {}
    if not isinstance(parsed, dict):
        parsed = {}
    return FrontmatterDocument(frontmatter=parsed, body=body)


def extract_markdown_title(body: str) -> str | None:
    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
    return None


def extract_summary_line(body: str) -> str | None:
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        return stripped
    return None

