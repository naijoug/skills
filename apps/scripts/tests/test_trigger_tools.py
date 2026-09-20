import contextlib
import io
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from support import TUI, make_skill
import trigger_examples_tool as routing
import trigger_eval_report as report


class RoutingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "skills"
        self.skill = make_skill(self.root)
        make_skill(self.root, "manual/review/demo", "ng-review-demo")
        (self.skill / "references").mkdir()
        self.examples = self.skill / "references/trigger-examples.md"
        self.examples.write_text('## Positive (English)\n\n- "Draft the release plan" (author note)\n\n'
                                 '## Negative / Near Miss\n\n- "Review this plan" <!-- eval: {"route":"select","skills":["ng-review-demo"]} -->\n'
                                 '- "Fix a typo" <!-- eval: {"route":"none"} -->\n'
                                 '- "Debug this failure"\n\n## Narrow first\n\n- "Plan something" → ask what kind.\n')

    def cases(self):
        return routing.load_all_cases(self.root)[0]

    def score(self, predictions):
        path = Path(self.temp.name) / "predictions.jsonl"
        path.write_text("".join(json.dumps(row) + "\n" for row in predictions))
        args = routing.build_parser().parse_args(["--skills-dir", str(self.root), "score", "--predictions", str(path), "--fail-on-miss", "--csv-out", str(Path(self.temp.name) / "csv")])
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return args.func(args)

    def perfect(self):
        return [dict(id=case.id, predicted=case.expected_skills,
                     decision="select" if case.expected_skills else "clarify" if case.route == "clarify" else "none") for case in self.cases()]

    def test_ids_come_from_metadata_not_duplicate_directory_names(self):
        cases = self.cases()
        self.assertEqual(len(cases), 5)
        self.assertEqual(cases[1].expected_skills, ["ng-review-demo"])
        self.assertTrue(all(case.skill == "ng-plan-demo" for case in cases))

    def test_blind_inputs_strip_notes_and_labels(self):
        args = routing.build_parser().parse_args(["--skills-dir", str(self.root), "export"])
        output = io.StringIO()
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(io.StringIO()):
            args.func(args)
        rows = [json.loads(line) for line in output.getvalue().splitlines()]
        self.assertTrue(all(set(row) == {"id", "prompt"} for row in rows))
        self.assertEqual(rows[0]["prompt"], "Draft the release plan")
        self.assertEqual(rows[-1]["prompt"], "Plan something")
        self.assertNotIn("ng-plan-demo", rows[0]["id"])

    def test_empty_scalar_is_not_next_field(self):
        path = self.skill / "SKILL.md"
        path.write_text("---\nname: ng-plan-demo\ndescription:\nmetadata: nope\n---\n")
        self.assertFalse(routing.read_top_level_scalar(path, "description"))

    def test_redirect_none_and_clarification_are_distinct(self):
        self.assertEqual(self.score(self.perfect()), 0)
        for index in (1, 2, 4):
            rows = self.perfect()
            rows[index].update(predicted=["ng-plan-demo"], decision="select")
            self.assertEqual(self.score(rows), 2)

    def test_missing_negative_prediction_is_not_a_correct_reject(self):
        rows = self.perfect()
        rows.pop(3)
        self.assertEqual(self.score(rows), 2)

    def test_near_miss_allows_other_skill_but_select_rejects_extras(self):
        rows = self.perfect()
        rows[3].update(predicted=["ng-review-demo"], decision="select")
        self.assertEqual(self.score(rows), 0)
        rows[0]["predicted"].append("ng-review-demo")
        self.assertEqual(self.score(rows), 2)
        details = (Path(self.temp.name) / "csv/details.csv").read_text()
        self.assertIn("EXTRA", details)

    def test_duplicate_unknown_and_malformed_predictions_fail(self):
        valid = self.perfect()
        variants = [valid + [valid[0]], [{"id": "unknown", "predicted": []}],
                    [{**valid[0], "predicted": ["unknown-skill"]}],
                    [{**valid[0], "decision": []}],
                    [{**valid[0], "predicted": ["ng-plan-demo", "ng-plan-demo"]}]]
        for rows in variants:
            with self.subTest(rows=rows), self.assertRaises(ValueError):
                self.score(rows)

    def test_failed_runner_keeps_report_and_returns_failure(self):
        output = Path(self.temp.name) / "report.html"
        result = subprocess.run([str(TUI / "run_trigger_eval.sh"), "--skills-dir", str(self.root), "--mode", "noop", "--no-details", "--fail-on-miss", "--html-report", str(output)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 2, result.stderr)
        self.assertIn("Clarification", output.read_text())

    def test_report_exposes_clarification_and_exact_success(self):
        cards = report.summary_cards([{"metric": "case_accuracy", "value": "0.5"}, {"metric": "clarify_accuracy", "value": "0.25"}])
        self.assertIn("0.500", cards)
        self.assertIn("0.250", cards)
