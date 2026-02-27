#!/usr/bin/env python3
"""
Template adapter for skill trigger evaluation.

Reads exported cases JSONL from `trigger_examples_tool.py export`
and writes predictions JSONL consumable by `trigger_examples_tool.py score`.

Usage:
  python3 scripts/predictor_adapter_template.py \
    --input /tmp/cases.jsonl \
    --output /tmp/predictions.jsonl

Integration point:
  Replace `predict_case()` with a call into your real trigger engine.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def predict_case(case: dict, mode: str = "keyword-demo") -> list[str]:
    """
    Return predicted skill names for one case.

    Replace this function with your actual trigger logic.
    """
    prompt = str(case.get("prompt", ""))

    if mode == "none":
        return []

    if mode != "keyword-demo":
        raise ValueError(f"Unsupported mode: {mode}")

    p = prompt.lower()
    out: list[str] = []

    # Minimal keyword demo rules (intentionally simple; replace in real usage)
    if any(k in p for k in ["flaky", "intermittent", "root cause", "排查", "复现"]):
        out.append("bug-investigation-coach")
    if any(k in p for k in ["test matrix", "测试用例", "边界", "regression test"]):
        out.append("test-case-designer")
    if any(k in p for k in ["codebase", "读代码", "调用链", "request flow"]):
        out.append("code-reading-accelerator")
    if any(k in p for k in ["refactor", "重构", "behavior-preserving"]):
        out.append("refactor-safely")
    if any(k in p for k in ["self-review", "自检", "reviewer comments", "pr "]):
        out.append("pr-self-review")
    if any(k in p for k in ["api contract", "接口设计", "idempotency", "幂等"]):
        out.append("api-design-review")
    if any(k in p for k in ["performance", "latency", "p95", "性能"]):
        out.append("performance-thinking-coach")
    if any(k in p for k in ["retro", "复盘", "this week", "weekly"]):
        out.append("weekly-coding-retro")
    if any(k in p for k in ["leetcode", "algorithm problem", "刷题", "hints only", "kata"]):
        out.append("algorithm-kata-coach")
    if any(k in p for k in ["debugging kata", "incident practice", "调试练习", "drill"]):
        out.append("debugging-kata-generator")
    if any(k in p for k in ["design pattern", "strategy vs state", "设计模式", "overengineering"]):
        out.append("design-pattern-application-coach")

    # stable de-dup preserving order
    seen = set()
    deduped = []
    for skill in out:
        if skill not in seen:
            seen.add(skill)
            deduped.append(skill)
    return deduped


def main() -> int:
    parser = argparse.ArgumentParser(description="Template adapter for skill trigger evaluation.")
    parser.add_argument("--input", required=True, help="Input cases JSONL path")
    parser.add_argument("--output", required=True, help="Output predictions JSONL path")
    parser.add_argument(
        "--mode",
        default="keyword-demo",
        choices=["keyword-demo", "none"],
        help="Demo prediction mode (default: keyword-demo)",
    )
    args = parser.parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    count = 0
    with in_path.open("r", encoding="utf-8") as src, out_path.open("w", encoding="utf-8") as dst:
        for lineno, raw in enumerate(src, start=1):
            line = raw.strip()
            if not line:
                continue
            try:
                case = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{in_path}:{lineno}: invalid JSON: {exc}") from exc
            if not isinstance(case, dict):
                raise ValueError(f"{in_path}:{lineno}: row must be a JSON object")
            case_id = case.get("id")
            if not isinstance(case_id, str) or not case_id.strip():
                raise ValueError(f"{in_path}:{lineno}: missing string field 'id'")

            predicted = predict_case(case, mode=args.mode)
            dst.write(
                json.dumps({"id": case_id, "predicted": predicted}, ensure_ascii=False) + "\n"
            )
            count += 1

    print(f"Wrote {count} predictions to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
