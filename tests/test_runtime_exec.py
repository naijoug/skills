from __future__ import annotations

from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

from tests import _bootstrap  # noqa: F401

FIXTURE_ROOT = Path(__file__).parent / "fixtures" / "sample_skills"
REPO_SKILLS_ROOT = Path(__file__).resolve().parents[1] / "skills"


class RuntimeExecTests(unittest.TestCase):
    def test_run_skill_python_module_executes_entrypoint(self):
        from skills_platform.runtime_exec import run_skill

        result = run_skill(FIXTURE_ROOT, "python-runtime", {"text": "hello"})
        self.assertTrue(result["ok"])
        self.assertEqual(result["code"], "RUNTIME_EXECUTED")
        self.assertEqual(result["details"]["result"]["output"], "HELLO")

    def test_run_skill_shell_command_uses_uv_venv_and_formats_args(self):
        from skills_platform.runtime_exec import run_skill

        calls = []

        def fake_run(cmd, **kwargs):
            calls.append((cmd, kwargs))
            if cmd[:2] == ["uv", "venv"]:
                return subprocess.CompletedProcess(cmd, 0, "", "")
            return subprocess.CompletedProcess(cmd, 0, "hello Ada\n", "")

        with patch("skills_platform.runtime_exec.subprocess.run", side_effect=fake_run):
            result = run_skill(FIXTURE_ROOT, "shell-runtime", {"name": "Ada"})

        self.assertTrue(result["ok"])
        self.assertEqual(result["code"], "RUNTIME_EXECUTED")
        self.assertEqual(calls[0][0][:2], ["uv", "venv"])
        self.assertEqual(calls[1][0][:4], ["uv", "run", "--python", calls[1][0][3]])
        self.assertIn("echo", calls[1][0])
        self.assertIn("Ada", calls[1][0])

    def test_run_skill_shell_command_nonzero_returns_error(self):
        from skills_platform.runtime_exec import run_skill

        def fake_run(cmd, **kwargs):
            if cmd[:2] == ["uv", "venv"]:
                return subprocess.CompletedProcess(cmd, 0, "", "")
            return subprocess.CompletedProcess(cmd, 9, "", "boom")

        with patch("skills_platform.runtime_exec.subprocess.run", side_effect=fake_run):
            result = run_skill(FIXTURE_ROOT, "shell-runtime", {"name": "Ada"})

        self.assertFalse(result["ok"])
        self.assertEqual(result["code"], "SHELL_COMMAND_FAILED")

    def test_run_skill_shell_command_rejects_cwd_escape(self):
        from skills_platform.runtime_exec import run_skill

        result = run_skill(FIXTURE_ROOT, "shell-bad-cwd", {})
        self.assertFalse(result["ok"])
        self.assertEqual(result["code"], "INVALID_RUNTIME_PATH")

    def test_run_skill_shell_command_rejects_venv_escape(self):
        from skills_platform.runtime_exec import run_skill

        result = run_skill(FIXTURE_ROOT, "shell-bad-venv", {})
        self.assertFalse(result["ok"])
        self.assertEqual(result["code"], "INVALID_RUNTIME_PATH")

    def test_run_real_pr_self_review_runtime_module(self):
        from skills_platform.runtime_exec import run_skill

        result = run_skill(
            REPO_SKILLS_ROOT,
            "pr-self-review",
            {
                "change_goal": "Reduce API latency",
                "risk_areas": "Caching and timeout defaults",
            },
        )
        self.assertTrue(result["ok"])
        self.assertEqual(result["code"], "RUNTIME_EXECUTED")
        self.assertIn("PR Self Review Checklist", result["details"]["result"]["checklist_markdown"])


if __name__ == "__main__":
    unittest.main()
