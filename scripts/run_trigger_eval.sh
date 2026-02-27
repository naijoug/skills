#!/usr/bin/env bash
set -euo pipefail

# End-to-end helper for skill trigger evaluation:
# 1) export trigger example cases
# 2) run a predictor (perfect/noop/custom command)
# 3) score predictions
#
# Usage examples:
#   ./scripts/run_trigger_eval.sh --mode perfect
#   ./scripts/run_trigger_eval.sh --mode noop
#   ./scripts/run_trigger_eval.sh \
#     --mode custom \
#     --predict-cmd 'python3 /path/to/predict.py --input "$CASES_FILE" --output "$PREDS_FILE"'
#
# Custom command placeholders (environment variables made available):
#   CASES_FILE  : exported JSONL cases path
#   PREDS_FILE  : path your predictor must write predictions JSONL to
#   ROOT_DIR    : repo root
#   SKILLS_DIR  : skills directory

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOL="$ROOT_DIR/scripts/trigger_examples_tool.py"
SKILLS_DIR="$ROOT_DIR/skills"
WORK_DIR="${TMPDIR:-/tmp}/skill-trigger-eval"

MODE="custom"
PREDICT_CMD=""
DETAILS=1
CONFUSION=0
CONFUSION_TOP=20
CSV_OUT=""
HTML_REPORT=""
AUTO_CSV_OUT=0
FAIL_ON_MISS=0
KEEP_ARTIFACTS=0

usage() {
  cat <<'EOF'
Usage: run_trigger_eval.sh [options]

Options:
  --mode <perfect|noop|custom>   Predictor mode (default: custom)
  --predict-cmd <command>        Custom predictor command (required for mode=custom)
  --work-dir <dir>               Working directory for generated files
  --skills-dir <dir>             Skills directory to evaluate (default: repo ./skills)
  --no-details                   Do not print score details
  --confusion                    Print confusion summaries from scorer
  --top <n>                      Max rows per confusion table (default: 20)
  --csv-out <dir>                Write score CSV exports to directory
  --html-report <file>           Generate HTML report file from CSV exports
  --fail-on-miss                 Exit non-zero if any positive miss or false trigger
  --keep-artifacts               Keep exported cases/predictions files
  -h, --help                     Show help

Custom predictor contract:
  The command must write JSONL predictions to $PREDS_FILE.
  Each row must include:
    - "id": case id
    - "predicted": "skill-name" OR ["skill-name", ...]
  (The scorer also accepts "predicted_skills".)

Examples:
  ./scripts/run_trigger_eval.sh --mode perfect
  ./scripts/run_trigger_eval.sh --mode noop
  ./scripts/run_trigger_eval.sh \
    --mode custom \
    --predict-cmd 'python3 /path/to/predict.py --input "$CASES_FILE" --output "$PREDS_FILE"'
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-}"; shift 2 ;;
    --predict-cmd)
      PREDICT_CMD="${2:-}"; shift 2 ;;
    --work-dir)
      WORK_DIR="${2:-}"; shift 2 ;;
    --skills-dir)
      SKILLS_DIR="${2:-}"; shift 2 ;;
    --no-details)
      DETAILS=0; shift ;;
    --confusion)
      CONFUSION=1; shift ;;
    --top)
      CONFUSION_TOP="${2:-}"; shift 2 ;;
    --csv-out)
      CSV_OUT="${2:-}"; shift 2 ;;
    --html-report)
      HTML_REPORT="${2:-}"; shift 2 ;;
    --fail-on-miss)
      FAIL_ON_MISS=1; shift ;;
    --keep-artifacts)
      KEEP_ARTIFACTS=1; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1 ;;
  esac
done

if [[ ! -f "$TOOL" ]]; then
  echo "Missing tool: $TOOL" >&2
  exit 1
fi

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "Skills directory not found: $SKILLS_DIR" >&2
  exit 1
fi

case "$MODE" in
  perfect|noop|custom) ;;
  *)
    echo "Invalid --mode: $MODE" >&2
    exit 1 ;;
esac

if [[ "$MODE" == "custom" && -z "$PREDICT_CMD" ]]; then
  echo "--predict-cmd is required when --mode custom" >&2
  exit 1
fi

mkdir -p "$WORK_DIR"
CASES_FILE="$WORK_DIR/cases.jsonl"
PREDS_FILE="$WORK_DIR/predictions.jsonl"
if [[ -n "$HTML_REPORT" && -z "$CSV_OUT" ]]; then
  CSV_OUT="$WORK_DIR/score-csv"
  AUTO_CSV_OUT=1
fi

cleanup() {
  if [[ "$KEEP_ARTIFACTS" -eq 0 ]]; then
    rm -f "$CASES_FILE" "$PREDS_FILE"
    if [[ "$AUTO_CSV_OUT" -eq 1 ]]; then
      rm -rf "$CSV_OUT"
    fi
  fi
}
trap cleanup EXIT

echo "[1/3] Exporting trigger examples..."
python3 "$TOOL" --skills-dir "$SKILLS_DIR" export --out "$CASES_FILE"

echo "[2/3] Running predictor (mode=$MODE)..."
case "$MODE" in
  perfect)
    python3 - "$CASES_FILE" "$PREDS_FILE" <<'PY'
import json, sys
src, dst = sys.argv[1], sys.argv[2]
with open(src, encoding="utf-8") as f, open(dst, "w", encoding="utf-8") as w:
    for line in f:
        row = json.loads(line)
        predicted = [row["skill"]] if row.get("expected_trigger") else []
        w.write(json.dumps({"id": row["id"], "predicted": predicted}, ensure_ascii=False) + "\n")
PY
    ;;
  noop)
    python3 - "$CASES_FILE" "$PREDS_FILE" <<'PY'
import json, sys
src, dst = sys.argv[1], sys.argv[2]
with open(src, encoding="utf-8") as f, open(dst, "w", encoding="utf-8") as w:
    for line in f:
        row = json.loads(line)
        w.write(json.dumps({"id": row["id"], "predicted": []}, ensure_ascii=False) + "\n")
PY
    ;;
  custom)
    export CASES_FILE PREDS_FILE ROOT_DIR SKILLS_DIR
    # Intentional use of eval to allow quoted placeholders in user-provided command.
    eval "$PREDICT_CMD"
    ;;
esac

if [[ ! -f "$PREDS_FILE" ]]; then
  echo "Predictor did not create predictions file: $PREDS_FILE" >&2
  exit 1
fi

echo "[3/3] Scoring predictions..."
SCORE_ARGS=(--skills-dir "$SKILLS_DIR" score --predictions "$PREDS_FILE")
if [[ "$DETAILS" -eq 1 ]]; then
  SCORE_ARGS+=(--details)
fi
if [[ "$CONFUSION" -eq 1 ]]; then
  SCORE_ARGS+=(--confusion --top "$CONFUSION_TOP")
fi
if [[ -n "$CSV_OUT" ]]; then
  SCORE_ARGS+=(--csv-out "$CSV_OUT")
fi
if [[ "$FAIL_ON_MISS" -eq 1 ]]; then
  SCORE_ARGS+=(--fail-on-miss)
fi

python3 "$TOOL" "${SCORE_ARGS[@]}"

if [[ -n "$HTML_REPORT" ]]; then
  echo "[4/4] Generating HTML report..."
  python3 "$ROOT_DIR/scripts/trigger_eval_report.py" \
    --csv-dir "$CSV_OUT" \
    --out "$HTML_REPORT"
fi

if [[ "$KEEP_ARTIFACTS" -eq 1 ]]; then
  echo "Artifacts kept:"
  echo "- $CASES_FILE"
  echo "- $PREDS_FILE"
  if [[ -n "$CSV_OUT" ]]; then
    echo "- $CSV_OUT"
  fi
fi
