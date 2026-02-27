#!/usr/bin/env python3
"""
Utilities for exporting and scoring skill trigger examples.

This script reads `skills/*/references/trigger-examples.md` and can:
- summarize example coverage
- export cases to JSONL for trigger testing
- score predictions from an external trigger runner

No external dependencies required.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
SKILLS_DIR = ROOT / "skills"

SECTION_MAP = {
    "Positive (Chinese)": ("positive", "zh"),
    "Positive (English)": ("positive", "en"),
    "Negative / Near Miss": ("negative", "mixed"),
}


@dataclass
class Case:
    id: str
    skill: str
    prompt: str
    polarity: str  # positive | negative
    language: str  # zh | en | mixed
    source: str


def iter_skill_dirs(skills_dir: Path) -> Iterable[Path]:
    for child in sorted(skills_dir.iterdir()):
        if child.is_dir() and (child / "SKILL.md").exists():
            yield child.resolve()


def parse_trigger_examples(skill_dir: Path) -> list[Case]:
    skill_name = skill_dir.name
    ref_path = skill_dir / "references" / "trigger-examples.md"
    if not ref_path.exists():
        return []
    ref_path = ref_path.resolve()

    try:
        source_path = str(ref_path.relative_to(ROOT))
    except ValueError:
        source_path = str(ref_path)

    lines = ref_path.read_text(encoding="utf-8").splitlines()
    current_section = None
    counters: dict[tuple[str, str], int] = {}
    cases: list[Case] = []

    for raw in lines:
        line = raw.rstrip()
        if line.startswith("## "):
            title = line[3:].strip()
            current_section = SECTION_MAP.get(title)
            continue

        if not current_section or not line.startswith("- "):
            continue

        polarity, language = current_section
        key = (polarity, language)
        counters[key] = counters.get(key, 0) + 1
        idx = counters[key]
        case_id = f"{skill_name}:{polarity}:{language}:{idx}"

        cases.append(
            Case(
                id=case_id,
                skill=skill_name,
                prompt=line[2:].strip(),
                polarity=polarity,
                language=language,
                source=source_path,
            )
        )

    return cases


def load_all_cases(skills_dir: Path) -> list[Case]:
    all_cases: list[Case] = []
    for skill_dir in iter_skill_dirs(skills_dir):
        all_cases.extend(parse_trigger_examples(skill_dir))
    return all_cases


def cmd_summary(args: argparse.Namespace) -> int:
    cases = load_all_cases(Path(args.skills_dir))
    if not cases:
        print("No trigger example cases found.")
        return 1

    by_skill: dict[str, dict[str, int]] = {}
    for case in cases:
        bucket = by_skill.setdefault(case.skill, {"positive": 0, "negative": 0, "total": 0})
        bucket[case.polarity] += 1
        bucket["total"] += 1

    print("skill\tpositive\tnegative\ttotal")
    for skill in sorted(by_skill):
        row = by_skill[skill]
        print(f"{skill}\t{row['positive']}\t{row['negative']}\t{row['total']}")

    print(f"\nTotal cases: {len(cases)}")
    return 0


def cmd_export(args: argparse.Namespace) -> int:
    cases = load_all_cases(Path(args.skills_dir))
    if not cases:
        print("No trigger example cases found.", file=sys.stderr)
        return 1

    out_path = Path(args.out) if args.out else None
    records = []
    for c in cases:
        rec = asdict(c)
        rec["expected_trigger"] = c.polarity == "positive"
        rec["expected_skill"] = c.skill
        records.append(rec)

    if out_path:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with out_path.open("w", encoding="utf-8") as f:
            for rec in records:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        print(f"Wrote {len(records)} cases to {out_path}")
    else:
        for rec in records:
            print(json.dumps(rec, ensure_ascii=False))

    return 0


def _normalize_predicted(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value] if value.strip() else []
    if isinstance(value, list):
        out = []
        for item in value:
            if isinstance(item, str) and item.strip():
                out.append(item.strip())
        return out
    return []


def load_predictions(pred_path: Path) -> dict[str, list[str]]:
    preds: dict[str, list[str]] = {}
    with pred_path.open("r", encoding="utf-8") as f:
        for lineno, raw in enumerate(f, start=1):
            line = raw.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{pred_path}:{lineno}: invalid JSON: {exc}") from exc

            if not isinstance(obj, dict):
                raise ValueError(f"{pred_path}:{lineno}: JSONL row must be an object")

            case_id = obj.get("id")
            if not isinstance(case_id, str) or not case_id.strip():
                raise ValueError(f"{pred_path}:{lineno}: missing string field 'id'")

            predicted = obj.get("predicted")
            if predicted is None and "predicted_skills" in obj:
                predicted = obj.get("predicted_skills")

            preds[case_id.strip()] = _normalize_predicted(predicted)

    return preds


def _write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})


def cmd_score(args: argparse.Namespace) -> int:
    cases = load_all_cases(Path(args.skills_dir))
    if not cases:
        print("No trigger example cases found.", file=sys.stderr)
        return 1

    pred_path = Path(args.predictions)
    predictions = load_predictions(pred_path)

    totals = {
        "positive_total": 0,
        "positive_hit": 0,
        "positive_miss": 0,
        "negative_total": 0,
        "negative_correct_reject": 0,
        "negative_false_trigger": 0,  # any predicted skill on a negative case
        "negative_false_trigger_self": 0,  # predicted the source skill on its own near-miss case
        "positive_extra_skill_predictions": 0,
        "missing_predictions": 0,
    }

    by_skill: dict[str, dict[str, int]] = {}
    details: list[str] = []
    detail_rows: list[dict[str, str]] = []
    pos_confusions: dict[tuple[str, str], int] = {}
    pos_cotriggers: dict[tuple[str, str], int] = {}
    neg_false_confusions: dict[tuple[str, str], int] = {}

    for case in cases:
        skill_stats = by_skill.setdefault(
            case.skill,
            {
                "positive_total": 0,
                "positive_hit": 0,
                "negative_total": 0,
                "negative_false_trigger": 0,  # any
                "negative_false_trigger_self": 0,
                "missing_predictions": 0,
            },
        )
        predicted = predictions.get(case.id)
        if predicted is None:
            predicted = []
            totals["missing_predictions"] += 1
            skill_stats["missing_predictions"] += 1

        predicted_set = {p.strip() for p in predicted if p.strip()}
        expected = case.skill

        if case.polarity == "positive":
            totals["positive_total"] += 1
            skill_stats["positive_total"] += 1
            if expected in predicted_set:
                totals["positive_hit"] += 1
                skill_stats["positive_hit"] += 1
            else:
                totals["positive_miss"] += 1
                details.append(f"MISS\t{case.id}\t{case.prompt}")
                detail_rows.append(
                    {
                        "kind": "MISS",
                        "id": case.id,
                        "skill": case.skill,
                        "polarity": case.polarity,
                        "prompt": case.prompt,
                        "predicted_skills": ",".join(sorted(predicted_set)),
                        "source": case.source,
                    }
                )
                for wrong in sorted(predicted_set):
                    pos_confusions[(expected, wrong)] = pos_confusions.get((expected, wrong), 0) + 1
            extra = predicted_set - {expected}
            if extra:
                totals["positive_extra_skill_predictions"] += 1
                for wrong in sorted(extra):
                    pos_cotriggers[(expected, wrong)] = pos_cotriggers.get((expected, wrong), 0) + 1
                details.append(
                    f"EXTRA\t{case.id}\t{','.join(sorted(extra))}\t{case.prompt}"
                )
                detail_rows.append(
                    {
                        "kind": "EXTRA",
                        "id": case.id,
                        "skill": case.skill,
                        "polarity": case.polarity,
                        "prompt": case.prompt,
                        "predicted_skills": ",".join(sorted(extra)),
                        "source": case.source,
                    }
                )
        else:
            totals["negative_total"] += 1
            skill_stats["negative_total"] += 1
            if predicted_set:
                totals["negative_false_trigger"] += 1
                skill_stats["negative_false_trigger"] += 1
                for wrong in sorted(predicted_set):
                    neg_false_confusions[(expected, wrong)] = (
                        neg_false_confusions.get((expected, wrong), 0) + 1
                    )
                details.append(
                    f"FALSE_TRIGGER\t{case.id}\t{','.join(sorted(predicted_set))}\t{case.prompt}"
                )
                detail_rows.append(
                    {
                        "kind": "FALSE_TRIGGER",
                        "id": case.id,
                        "skill": case.skill,
                        "polarity": case.polarity,
                        "prompt": case.prompt,
                        "predicted_skills": ",".join(sorted(predicted_set)),
                        "source": case.source,
                    }
                )
                if expected in predicted_set:
                    totals["negative_false_trigger_self"] += 1
                    skill_stats["negative_false_trigger_self"] += 1
            else:
                totals["negative_correct_reject"] += 1

    positive_recall = (
        totals["positive_hit"] / totals["positive_total"] if totals["positive_total"] else 0.0
    )
    negative_reject_rate = (
        totals["negative_correct_reject"] / totals["negative_total"]
        if totals["negative_total"]
        else 0.0
    )

    print("Overall")
    print(f"- Positive cases: {totals['positive_total']}")
    print(f"- Positive hits: {totals['positive_hit']}")
    print(f"- Positive misses: {totals['positive_miss']}")
    print(f"- Positive recall: {positive_recall:.3f}")
    print(f"- Negative cases: {totals['negative_total']}")
    print(f"- Correct rejects: {totals['negative_correct_reject']}")
    print(f"- False triggers: {totals['negative_false_trigger']}")
    print(f"- False triggers (same skill near-miss): {totals['negative_false_trigger_self']}")
    print(f"- Negative reject rate: {negative_reject_rate:.3f}")
    print(f"- Missing predictions: {totals['missing_predictions']}")
    print(
        f"- Positive cases with extra skill predictions: {totals['positive_extra_skill_predictions']}"
    )

    print("\nPer skill")
    print("skill\tpos_hit/pos_total\tneg_false_any/neg_total\tneg_false_self/neg_total\tmissing_preds")
    for skill in sorted(by_skill):
        s = by_skill[skill]
        print(
            f"{skill}\t{s['positive_hit']}/{s['positive_total']}\t"
            f"{s['negative_false_trigger']}/{s['negative_total']}\t"
            f"{s['negative_false_trigger_self']}/{s['negative_total']}\t{s['missing_predictions']}"
        )

    if args.fail_on_miss and (totals["positive_miss"] > 0 or totals["negative_false_trigger"] > 0):
        exit_code = 2
    else:
        exit_code = 0

    if args.details:
        print("\nDetails")
        for line in details:
            print(line)

    if args.confusion:
        def _print_pairs(title: str, pairs: dict[tuple[str, str], int], left: str, right: str) -> None:
            print(f"\n{title}")
            if not pairs:
                print("- none")
                return
            print(f"{left}\t{right}\tcount")
            for (a, b), count in sorted(pairs.items(), key=lambda kv: (-kv[1], kv[0][0], kv[0][1]))[: args.top]:
                print(f"{a}\t{b}\t{count}")

        _print_pairs(
            "Positive Miss Confusions (expected -> predicted wrong skill)",
            pos_confusions,
            "expected",
            "predicted",
        )
        _print_pairs(
            "Positive Co-Trigger Confusions (expected + extra predicted skill)",
            pos_cotriggers,
            "expected",
            "extra",
        )
        _print_pairs(
            "Negative False Trigger Confusions (near-miss source -> predicted skill)",
            neg_false_confusions,
            "near_miss_for",
            "predicted",
        )

    if args.csv_out:
        out_dir = Path(args.csv_out)

        overall_rows = [
            {"metric": "positive_total", "value": totals["positive_total"]},
            {"metric": "positive_hit", "value": totals["positive_hit"]},
            {"metric": "positive_miss", "value": totals["positive_miss"]},
            {"metric": "positive_recall", "value": f"{positive_recall:.6f}"},
            {"metric": "negative_total", "value": totals["negative_total"]},
            {"metric": "negative_correct_reject", "value": totals["negative_correct_reject"]},
            {"metric": "negative_false_trigger", "value": totals["negative_false_trigger"]},
            {
                "metric": "negative_false_trigger_self",
                "value": totals["negative_false_trigger_self"],
            },
            {"metric": "negative_reject_rate", "value": f"{negative_reject_rate:.6f}"},
            {"metric": "missing_predictions", "value": totals["missing_predictions"]},
            {
                "metric": "positive_extra_skill_predictions",
                "value": totals["positive_extra_skill_predictions"],
            },
        ]

        per_skill_rows = []
        for skill in sorted(by_skill):
            s = by_skill[skill]
            per_skill_rows.append(
                {
                    "skill": skill,
                    "positive_total": s["positive_total"],
                    "positive_hit": s["positive_hit"],
                    "negative_total": s["negative_total"],
                    "negative_false_trigger": s["negative_false_trigger"],
                    "negative_false_trigger_self": s["negative_false_trigger_self"],
                    "missing_predictions": s["missing_predictions"],
                }
            )

        def _pair_rows(pairs: dict[tuple[str, str], int], left: str, right: str) -> list[dict[str, str | int]]:
            rows: list[dict[str, str | int]] = []
            for (a, b), count in sorted(
                pairs.items(), key=lambda kv: (-kv[1], kv[0][0], kv[0][1])
            ):
                rows.append({left: a, right: b, "count": count})
            return rows

        _write_csv(out_dir / "overall.csv", ["metric", "value"], overall_rows)
        _write_csv(
            out_dir / "per_skill.csv",
            [
                "skill",
                "positive_total",
                "positive_hit",
                "negative_total",
                "negative_false_trigger",
                "negative_false_trigger_self",
                "missing_predictions",
            ],
            per_skill_rows,
        )
        _write_csv(
            out_dir / "details.csv",
            ["kind", "id", "skill", "polarity", "predicted_skills", "prompt", "source"],
            detail_rows,
        )
        _write_csv(
            out_dir / "positive_miss_confusions.csv",
            ["expected", "predicted", "count"],
            _pair_rows(pos_confusions, "expected", "predicted"),
        )
        _write_csv(
            out_dir / "positive_cotriggers.csv",
            ["expected", "extra", "count"],
            _pair_rows(pos_cotriggers, "expected", "extra"),
        )
        _write_csv(
            out_dir / "negative_false_trigger_confusions.csv",
            ["near_miss_for", "predicted", "count"],
            _pair_rows(neg_false_confusions, "near_miss_for", "predicted"),
        )
        print(f"\nCSV exports written to {out_dir}")

    return exit_code


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Export and score skill trigger example cases.")
    parser.add_argument(
        "--skills-dir",
        default=str(SKILLS_DIR),
        help="Path to skills directory (default: ./skills)",
    )

    sub = parser.add_subparsers(dest="command", required=True)

    p_summary = sub.add_parser("summary", help="Summarize trigger example coverage")
    p_summary.set_defaults(func=cmd_summary)

    p_export = sub.add_parser("export", help="Export trigger examples as JSONL")
    p_export.add_argument("--out", help="Output JSONL path (prints to stdout if omitted)")
    p_export.set_defaults(func=cmd_export)

    p_score = sub.add_parser("score", help="Score predictions JSONL against exported cases")
    p_score.add_argument(
        "--predictions",
        required=True,
        help="Predictions JSONL with fields: id and predicted (string or string[])",
    )
    p_score.add_argument(
        "--details",
        action="store_true",
        help="Print miss/false-trigger details",
    )
    p_score.add_argument(
        "--confusion",
        action="store_true",
        help="Print confusion summaries for wrong/extra predictions",
    )
    p_score.add_argument(
        "--top",
        type=int,
        default=20,
        help="Max rows per confusion table (default: 20)",
    )
    p_score.add_argument(
        "--csv-out",
        help="Directory to write CSV exports (overall, per-skill, details, confusions)",
    )
    p_score.add_argument(
        "--fail-on-miss",
        action="store_true",
        help="Exit non-zero when there is any positive miss or false trigger",
    )
    p_score.set_defaults(func=cmd_score)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
