"""Authorization and evidence contracts, using no personal data or live scans."""

import os
import sys
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch

from support import ROOT

sys.path.insert(0, str(ROOT / "skills/manual/tool/who-am-i/scripts"))
import common
import run_who_am_i as pipeline
from analyze_profile import analyze_profile
from render_markdown import render_markdown
from render_web_native import render_native_web


class ScanAuthorizationTests(unittest.TestCase):
    def setUp(self):
        self.cfg = common.default_config()
        for patcher in (
            patch.dict(os.environ, {}, clear=True),
            patch.object(sys.stdin, "isatty", return_value=False),
            patch.object(common, "save_config"),
        ):
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_noninteractive_scan_requires_consent(self):
        with self.assertRaisesRegex(RuntimeError, "Authorization denied"):
            common.ensure_authorization(self.cfg)
        self.assertFalse(self.cfg["authorization"]["home_scan_authorized"])
        common.save_config.assert_not_called()

    def test_denied_pipeline_never_discovers_or_parses(self):
        with patch.object(pipeline, "ensure_local_dirs"), \
             patch.object(pipeline, "load_config", return_value=self.cfg), \
             patch.object(pipeline, "load_state", return_value={}), \
             patch.object(pipeline, "discover_software_inventory") as inventory, \
             patch.object(pipeline, "discover_sessions") as discovery, \
             patch.object(pipeline, "parse_sessions") as parse:
            with self.assertRaisesRegex(RuntimeError, "Authorization denied"):
                pipeline.run(Namespace(mode="full"))
            inventory.assert_not_called()
            discovery.assert_not_called()
            parse.assert_not_called()

    def test_explicit_opt_in_does_not_grant_sensitive_directories(self):
        with patch.dict(os.environ, {"WHO_AM_I_AUTO_AUTHORIZE": "1"}):
            result = common.ensure_authorization(self.cfg)
        self.assertTrue(result["authorization"]["home_scan_authorized"])
        self.assertFalse(any(result["authorization"]["sensitive_dirs_authorized"].values()))

    def test_existing_consent_does_not_prompt_again(self):
        self.cfg["authorization"]["home_scan_authorized"] = True
        with patch.object(common, "ask_yes_no") as ask:
            result = common.ensure_authorization(self.cfg)
        self.assertTrue(result["authorization"]["home_scan_authorized"])
        ask.assert_not_called()

    def test_interactive_refusal_is_preserved(self):
        with patch.object(sys.stdin, "isatty", return_value=True), \
             patch.object(common, "ask_yes_no", return_value=False):
            with self.assertRaisesRegex(RuntimeError, "Authorization denied"):
                common.ensure_authorization(self.cfg)
        common.save_config.assert_not_called()


class ProfileEvidenceTests(unittest.TestCase):
    def profile(self, messages):
        return analyze_profile(
            {"ai_tools": {"detected": []}},
            {"included_files": [], "files": [], "state_patch": {}},
            {"sessions": [], "messages": messages, "by_source": {},
             "failures": [{"path": "fixture.jsonl", "error": "invalid JSON"}]},
            "full",
        )

    def test_no_usable_messages_produces_no_inferred_assessment(self):
        for messages in ([], [{"text": "  \n"}], [{"text": None}]):
            with self.subTest(messages=messages):
                profile = self.profile(messages)
                self.assertEqual(profile["meta"]["assessment_status"], "insufficient_evidence")
                for field in ("dimensions", "strengths", "skill_radar", "capabilities",
                              "growth_suggestions", "highlights"):
                    self.assertFalse(profile["identity"][field], field)
                self.assertFalse(profile["roastProfile"])
                self.assertFalse(profile["sweetProfile"])
                self.assertFalse(profile["skills"])
                self.assertEqual(len(profile["sessions"]["parse_failures"]), 1)
                self.assertIn("Insufficient evidence", render_markdown(profile))

    def test_empty_profile_can_render_offline(self):
        with tempfile.TemporaryDirectory() as temp:
            index = render_native_web(self.profile([]), Path(temp))
            html = index.read_text()
            self.assertIn("insufficient_evidence", html)
            self.assertNotIn('"grade"', html)
            self.assertNotIn('"score"', html)

    def test_available_messages_keep_assessment_as_heuristic(self):
        profile = self.profile([{"text": "Plan: verify the API with a regression test", "path": "fixture.jsonl"}])
        self.assertEqual(profile["meta"]["assessment_status"], "heuristic")
        self.assertTrue(profile["identity"]["dimensions"])


if __name__ == "__main__":
    unittest.main()
