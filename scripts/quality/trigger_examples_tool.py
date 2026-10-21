#!/usr/bin/env python3
"""Export blind routing inputs and score predictions against local skill examples.

This checks capability routing among explicitly offered candidates, not whether
an explicit-only skill is automatically invoked by a particular host.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKILLS_DIR = ROOT / "skills"
SECTION_MAP = {
    "Positive (Chinese)": ("positive", "zh"),
    "Positive (English)": ("positive", "en"),
    "Negative / Near Miss": ("negative", "mixed"),
    "Narrow first": ("clarify", "mixed"),
}


@dataclass
class Case:
    id: str
    skill: str
    prompt: str
    polarity: str
    language: str
    source: str
    route: str
    expected_skills: list[str]


@dataclass
class Prediction:
    skills: list[str]
    decision: str


def iter_skill_dirs(skills_dir: Path):
    for path in sorted(skills_dir.rglob("SKILL.md")):
        yield path.parent


def read_top_level_scalar(path: Path, key: str) -> str | None:
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    if path.name == "SKILL.md":
        if not text.startswith("---\n") or "\n---" not in text[4:]:
            return None
        text = text.split("---", 2)[1]
    match = re.search(rf"^{re.escape(key)}:[ \t]*([^\n]*)$", text, re.MULTILINE)
    return match.group(1).strip().strip('\"\'') if match else None


def skill_id(path: Path) -> str:
    identity = read_top_level_scalar(path / "skill.yaml", "id")
    name = read_top_level_scalar(path / "SKILL.md", "name")
    value = identity or name
    if not value or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
        raise ValueError(f"{path}: missing or invalid skill id/name")
    if identity and name and identity != name:
        raise ValueError(f"{path}: skill id and frontmatter name differ")
    return value


def skill_category(path: Path, skills_dir: Path = SKILLS_DIR) -> str:
    relative = path.relative_to(skills_dir).parts
    if relative and relative[0] in {"global", "cron", "auto", "manual"}:
        return relative[0]
    category = read_top_level_scalar(path / "skill.yaml", "category")
    activation = read_top_level_scalar(path / "skill.yaml", "activation")
    return category or {"always_on": "auto", "scheduled": "cron"}.get(activation, activation or "manual")


def parse_prompt(value: str) -> tuple[str, dict]:
    """Separate a real user prompt from author notes and optional gold metadata."""
    metadata = {}
    annotation = re.search(r"\s*<!-- eval: (.*?) -->\s*$", value)
    if "<!-- eval:" in value and annotation is None:
        raise ValueError("Malformed eval annotation")
    if annotation:
        metadata = json.loads(annotation.group(1))
        if not isinstance(metadata, dict) or set(metadata) - {"route", "skills"}:
            raise ValueError("eval annotation supports only route and skills")
        value = value[:annotation.start()]
    quoted = re.match(r'^["“](.*)["”](?:\s*(?:\(|→|—).*)?$', value)
    if quoted:
        prompt = quoted.group(1)
    else:
        prompt = re.sub(r"\s+\([^()]*\)\s*$", "", value)
    if not prompt.strip():
        raise ValueError("Empty routing prompt")
    return prompt.strip(), metadata


def parse_trigger_examples(skill_dir: Path) -> list[Case]:
    ref = skill_dir / "references/trigger-examples.md"
    if not ref.exists():
        return []
    name = skill_id(skill_dir)
    try:
        source = str(ref.relative_to(ROOT))
    except ValueError:
        source = str(ref)
    cases = []
    section = None
    for number, line in enumerate(ref.read_text(encoding="utf-8").splitlines(), 1):
        if line.startswith("## "):
            section = SECTION_MAP.get(line[3:].strip())
        if section is None or not line.startswith("- "):
            continue
        polarity, language = section
        prompt, metadata = parse_prompt(line[2:].strip())
        route = metadata.get("route", {"positive": "select", "negative": "not_this_skill", "clarify": "clarify"}[polarity])
        expected = metadata.get("skills", [name] if route == "select" else [])
        if not isinstance(route, str) or route not in {"select", "not_this_skill", "none", "clarify"}:
            raise ValueError(f"{ref}:{number}: invalid route: {route}")
        if not isinstance(expected, list) or any(not isinstance(v, str) or not v for v in expected):
            raise ValueError(f"{ref}:{number}: skills must be a list of skill IDs")
        if bool(expected) != (route == "select") or len(expected) != len(set(expected)):
            raise ValueError(f"{ref}:{number}: only select routes require a nonempty, unique skills list")
        # Opaque IDs carry no skill name, language, polarity or answer label.
        digest = hashlib.sha256(f"{name}\0{language}\0{prompt}".encode()).hexdigest()[:20]
        cases.append(Case(digest, name, prompt, polarity, language, source, route, expected))
    return cases


def load_all_cases(skills_dir: Path, *, include_non_manual: bool = False):
    all_cases, skipped, missing = [], [], []
    identities = set()
    for directory in iter_skill_dirs(skills_dir):
        identity = skill_id(directory)
        if identity in identities:
            raise ValueError(f"Duplicate skill id: {identity}")
        identities.add(identity)
        category = skill_category(directory, skills_dir)
        if not include_non_manual and category != "manual":
            skipped.append(f"{identity}({category})")
            continue
        cases = parse_trigger_examples(directory)
        if not cases:
            missing.append(identity)
        all_cases.extend(cases)
    ids = [case.id for case in all_cases]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate routing prompt within a skill/language")
    for case in all_cases:
        if set(case.expected_skills) - identities:
            raise ValueError(f"{case.source}: unknown expected skill IDs: {case.expected_skills}")
    return all_cases, skipped, missing


def cases_for(args):
    cases, skipped, missing = load_all_cases(Path(args.skills_dir), include_non_manual=args.include_non_manual or args.include_always_on)
    if skipped:
        print(f"Note: skipped {len(skipped)} non-manual skills", file=sys.stderr)
    if missing:
        print("Warning: no routing cases for: " + ", ".join(missing), file=sys.stderr)
        if args.require_coverage:
            raise ValueError("Routing coverage is required for every selected skill")
    if not cases:
        raise ValueError("No trigger example cases found")
    return cases


def write_jsonl(records: list[dict], destination: str | None):
    text = "".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records)
    if destination:
        path = Path(destination)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        print(f"Wrote {len(records)} records to {path}")
    else:
        print(text, end="")


def cmd_summary(args):
    cases = cases_for(args)
    counts = {}
    for case in cases:
        counts.setdefault(case.skill, Counter())[case.route] += 1
    print("skill\tselect\tnot_this_skill\tnone\tclarify\ttotal")
    for name, count in sorted(counts.items()):
        print(name, *(count[route] for route in ("select", "not_this_skill", "none", "clarify")), sum(count.values()), sep="\t")
    print(f"\nTotal cases: {len(cases)}")
    return 0


def cmd_export(args):
    cases = cases_for(args)
    records = [asdict(case) if args.with_labels else {"id": case.id, "prompt": case.prompt} for case in cases]
    write_jsonl(records, args.out)
    return 0


def cmd_catalog(args):
    # Include potential redirect targets even when only manual cases are scored.
    records = [{"id": skill_id(path), "description": read_top_level_scalar(path / "SKILL.md", "description")}
               for path in iter_skill_dirs(Path(args.skills_dir))]
    write_jsonl(records, args.out)
    return 0


def load_predictions(path: Path) -> dict[str, Prediction]:
    predictions = {}
    for number, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        row = json.loads(raw)
        if not isinstance(row, dict) or not isinstance(row.get("id"), str) or not row["id"].strip():
            raise ValueError(f"{path}:{number}: missing string id")
        identity = row["id"].strip()
        if identity in predictions:
            raise ValueError(f"{path}:{number}: duplicate prediction: {identity}")
        selected = row.get("predicted", row.get("predicted_skills"))
        if isinstance(selected, str):
            selected = [selected] if selected.strip() else []
        if not isinstance(selected, list) or any(not isinstance(v, str) or not v.strip() for v in selected):
            raise ValueError(f"{path}:{number}: predicted must be a string or string list")
        selected = [v.strip() for v in selected]
        if len(selected) != len(set(selected)):
            raise ValueError(f"{path}:{number}: duplicate predicted skill ID")
        decision = row.get("decision", "select" if selected else "none")
        if not isinstance(decision, str) or decision not in {"select", "none", "clarify"} or bool(selected) != (decision == "select"):
            raise ValueError(f"{path}:{number}: inconsistent prediction decision")
        predictions[identity] = Prediction(selected, decision)
    return predictions


def matches(case: Case, prediction: Prediction) -> bool:
    if case.route == "select":
        return prediction.decision == "select" and set(prediction.skills) == set(case.expected_skills)
    if case.route == "not_this_skill":
        return case.skill not in prediction.skills
    return prediction.decision == case.route and not prediction.skills


def write_csv(path: Path, fields: list[str], rows: list[dict]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def cmd_score(args):
    cases = cases_for(args)
    predictions = load_predictions(Path(args.predictions))
    extra_ids = predictions.keys() - {case.id for case in cases}
    if extra_ids:
        raise ValueError(f"Unknown case IDs: {sorted(extra_ids)[:3]}; re-export inputs after editing examples")
    known_skills = {skill_id(path) for path in iter_skill_dirs(Path(args.skills_dir))}
    unknown = {name for pred in predictions.values() for name in pred.skills} - known_skills
    if unknown:
        raise ValueError(f"Unknown predicted skill IDs: {sorted(unknown)}; use catalog IDs")
    totals = Counter({key: 0 for key in (
        "positive_total", "positive_hit", "positive_miss", "negative_total", "negative_correct_reject",
        "negative_false_trigger", "negative_false_trigger_self", "positive_extra_skill_predictions",
        "clarify_total", "clarify_hit", "missing_predictions", "case_total", "case_pass", "case_fail")})
    by_skill, details = {}, []
    pos_miss, pos_extra, neg_false = Counter(), Counter(), Counter()
    for case in cases:
        stats = by_skill.setdefault(case.skill, Counter())
        prediction = predictions.get(case.id)
        passed = prediction is not None and matches(case, prediction)
        totals["case_total"] += 1
        totals["case_pass" if passed else "case_fail"] += 1
        if prediction is None:
            totals["missing_predictions"] += 1
            stats["missing_predictions"] += 1
        predicted = prediction.skills if prediction else []
        if case.route == "select":
            # Includes explicit redirects; recall and exact task success remain separate.
            hit = prediction is not None and set(case.expected_skills) <= set(predicted)
            totals["positive_total"] += 1
            totals["positive_hit" if hit else "positive_miss"] += 1
            stats["positive_total"] += 1
            stats["positive_hit"] += int(hit)
            extra = set(predicted) - set(case.expected_skills)
            totals["positive_extra_skill_predictions"] += bool(extra)
            for name in extra:
                pos_extra[(case.skill, name)] += 1
                if not hit:
                    pos_miss[(case.skill, name)] += 1
        elif case.route == "clarify":
            totals["clarify_total"] += 1
            totals["clarify_hit"] += passed
            stats["clarify_total"] += 1
            stats["clarify_hit"] += passed
        else:
            totals["negative_total"] += 1
            totals["negative_correct_reject" if passed else "negative_false_trigger"] += 1
            totals["negative_false_trigger_self"] += case.skill in predicted
            stats["negative_total"] += 1
            stats["negative_false_trigger"] += not passed
            stats["negative_false_trigger_self"] += case.skill in predicted
            if not passed:
                for name in predicted:
                    neg_false[(case.skill, name)] += 1
        if not passed:
            kind = "MISSING" if prediction is None else "CLARIFY" if case.route == "clarify" else "MISS" if case.route == "select" else "FALSE_TRIGGER"
            if prediction is not None and case.route == "select" and set(case.expected_skills) <= set(predicted):
                kind = "EXTRA"
            details.append(dict(kind=kind, id=case.id, skill=case.skill, polarity=case.polarity,
                                route=case.route, expected_skills=",".join(case.expected_skills),
                                decision=prediction.decision if prediction else "missing",
                                predicted_skills=",".join(predicted), prompt=case.prompt, source=case.source))
    rates = {"positive_recall": totals["positive_hit"] / totals["positive_total"] if totals["positive_total"] else 0,
             "negative_reject_rate": totals["negative_correct_reject"] / totals["negative_total"] if totals["negative_total"] else 0,
             "clarify_accuracy": totals["clarify_hit"] / totals["clarify_total"] if totals["clarify_total"] else 0,
             "case_accuracy": totals["case_pass"] / totals["case_total"]}
    print("Routing score (capability selection; not host activation or end-to-end task quality)")
    for key, value in totals.items():
        print(f"- {key}: {value}")
    for key, value in rates.items():
        print(f"- {key}: {value:.3f}")
    if args.details:
        for row in details:
            print(f"{row['kind']}\t{row['id']}\t{row['route']}\t{row['prompt']}")
    pairs = [("positive_miss_confusions", pos_miss, "expected", "predicted"),
             ("positive_cotriggers", pos_extra, "expected", "extra"),
             ("negative_false_trigger_confusions", neg_false, "near_miss_for", "predicted")]
    if args.confusion:
        for title, counts, left, right in pairs:
            print(title)
            for (a, b), value in counts.most_common(args.top):
                print(f"{a}\t{b}\t{value}")
    if args.csv_out:
        directory = Path(args.csv_out)
        write_csv(directory / "overall.csv", ["metric", "value"], [{"metric": k, "value": v} for k, v in {**totals, **rates}.items()])
        fields = ["skill", "positive_total", "positive_hit", "negative_total", "negative_false_trigger",
                  "negative_false_trigger_self", "clarify_total", "clarify_hit", "missing_predictions"]
        write_csv(directory / "per_skill.csv", fields, [{"skill": name, **{key: stats[key] for key in fields[1:]}} for name, stats in sorted(by_skill.items())])
        write_csv(directory / "details.csv", ["kind", "id", "skill", "polarity", "route", "expected_skills", "decision", "predicted_skills", "prompt", "source"], details)
        for title, counts, left, right in pairs:
            write_csv(directory / f"{title}.csv", [left, right, "count"], [{left: a, right: b, "count": value} for (a, b), value in counts.most_common()])
    return 2 if args.fail_on_miss and totals["case_fail"] else 0


def build_parser():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skills-dir", default=str(SKILLS_DIR))
    parser.add_argument("--include-non-manual", action="store_true")
    parser.add_argument("--include-always-on", action="store_true", help=argparse.SUPPRESS)
    parser.add_argument("--require-coverage", action="store_true", help="Fail when a selected skill has no routing cases")
    sub = parser.add_subparsers(dest="command", required=True)
    summary = sub.add_parser("summary", help="Report routing cases and missing coverage")
    summary.set_defaults(func=cmd_summary)
    export = sub.add_parser("export", help="Export blind id/prompt inputs by default")
    export.add_argument("--out")
    export.add_argument("--with-labels", action="store_true", help="Gold/scorer debugging only; never send labels to a model")
    export.set_defaults(func=cmd_export)
    catalog = sub.add_parser("catalog", help="Export candidate IDs and descriptions without answers")
    catalog.add_argument("--out")
    catalog.set_defaults(func=cmd_catalog)
    score = sub.add_parser("score")
    score.add_argument("--predictions", required=True)
    score.add_argument("--details", action="store_true")
    score.add_argument("--confusion", action="store_true")
    score.add_argument("--top", type=int, default=20)
    score.add_argument("--csv-out")
    score.add_argument("--fail-on-miss", action="store_true", help="Fail on any wrong, extra, or missing decision")
    score.set_defaults(func=cmd_score)
    return parser


def main():
    args = build_parser().parse_args()
    try:
        return args.func(args)
    except (OSError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
