from __future__ import annotations


class SimpleYAMLError(ValueError):
    pass


def parse_simple_yaml(text: str):
    """Parse a small YAML subset (mappings/lists/scalars) using indentation.

    Supported:
    - mappings: `key: value` or `key:`
    - lists: `- value`
    - quoted/unquoted scalars, ints, floats, booleans, null
    Unsupported:
    - anchors, multiline strings, inline collections, complex list-of-maps syntax
    """

    raw_lines = text.splitlines()
    tokens: list[tuple[int, str, int]] = []
    for line_no, raw in enumerate(raw_lines, start=1):
        stripped = raw.strip()
        if not stripped or stripped.startswith("#"):
            continue
        indent = len(raw) - len(raw.lstrip(" "))
        if indent % 2 != 0:
            raise SimpleYAMLError(f"Invalid indentation at line {line_no}: {raw!r}")
        tokens.append((indent, raw[indent:], line_no))

    if not tokens:
        return {}

    value, next_idx = _parse_block(tokens, 0, tokens[0][0])
    if next_idx != len(tokens):
        line_no = tokens[next_idx][2]
        raise SimpleYAMLError(f"Unexpected trailing content near line {line_no}")
    return value


def _parse_block(tokens, index: int, indent: int):
    if index >= len(tokens):
        return {}, index
    _, content, _ = tokens[index]
    if content.startswith("- "):
        return _parse_list(tokens, index, indent)
    return _parse_map(tokens, index, indent)


def _parse_list(tokens, index: int, indent: int):
    items = []
    while index < len(tokens):
        cur_indent, content, line_no = tokens[index]
        if cur_indent < indent:
            break
        if cur_indent > indent:
            raise SimpleYAMLError(f"Unexpected indentation at line {line_no}")
        if not content.startswith("- "):
            break
        item_text = content[2:].strip()
        index += 1
        if item_text == "":
            if index >= len(tokens) or tokens[index][0] <= indent:
                items.append(None)
            else:
                child, index = _parse_block(tokens, index, tokens[index][0])
                items.append(child)
            continue
        items.append(_parse_scalar(item_text))
    return items, index


def _parse_map(tokens, index: int, indent: int):
    data = {}
    while index < len(tokens):
        cur_indent, content, line_no = tokens[index]
        if cur_indent < indent:
            break
        if cur_indent > indent:
            raise SimpleYAMLError(f"Unexpected indentation at line {line_no}")
        if content.startswith("- "):
            break
        if ":" not in content:
            raise SimpleYAMLError(f"Expected mapping entry at line {line_no}")
        key, raw_value = content.split(":", 1)
        key = key.strip()
        raw_value = raw_value.strip()
        if not key:
            raise SimpleYAMLError(f"Empty key at line {line_no}")
        index += 1
        if raw_value == "":
            if index < len(tokens) and tokens[index][0] > cur_indent:
                child, index = _parse_block(tokens, index, tokens[index][0])
                data[key] = child
            else:
                data[key] = None
            continue
        data[key] = _parse_scalar(raw_value)
    return data, index


def _parse_scalar(raw: str):
    if len(raw) >= 2 and raw[0] == raw[-1] and raw[0] in {"'", '"'}:
        return raw[1:-1]

    lower = raw.lower()
    if lower == "true":
        return True
    if lower == "false":
        return False
    if lower in {"null", "none", "~"}:
        return None

    if raw.isdigit() or (raw.startswith("-") and raw[1:].isdigit()):
        try:
            return int(raw)
        except ValueError:
            pass
    try:
        if "." in raw:
            return float(raw)
    except ValueError:
        pass
    return raw

