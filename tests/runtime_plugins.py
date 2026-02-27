from __future__ import annotations


def run(inputs):
    text = str(inputs.get("text", ""))
    return {"output": text.upper(), "length": len(text)}
