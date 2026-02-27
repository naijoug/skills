from contextlib import redirect_stderr, redirect_stdout
import io
from pathlib import Path
import tempfile
import unittest

from tests import _bootstrap  # noqa: F401


FIXTURE_ROOT = Path(__file__).parent / "fixtures" / "sample_skills"


class CLITests(unittest.TestCase):
    def run_cli(self, argv):
        from skills_platform.cli import main

        stdout = io.StringIO()
        stderr = io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            code = main(argv)
        return code, stdout.getvalue(), stderr.getvalue()

    def test_list_show_validate_doctor_commands(self):
        code, out, err = self.run_cli(["list", "--root", str(FIXTURE_ROOT)])
        self.assertEqual(code, 0, err)
        self.assertIn("pr-self-review", out)

        code, out, err = self.run_cli(["show", "pr-self-review", "--root", str(FIXTURE_ROOT)])
        self.assertEqual(code, 0, err)
        self.assertIn("prompt_plus_runtime", out)

        code, out, err = self.run_cli(["validate", "--root", str(FIXTURE_ROOT)])
        self.assertEqual(code, 0, err)
        self.assertIn("warnings", out.lower())

        code, out, err = self.run_cli(["doctor", "--root", str(FIXTURE_ROOT)])
        self.assertEqual(code, 0, err)
        self.assertIn("python", out.lower())

    def test_render_command_generates_output(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            code, out, err = self.run_cli(
                [
                    "render",
                    "--root",
                    str(FIXTURE_ROOT),
                    "--target",
                    "codex",
                    "--target",
                    "cursor",
                    "--output",
                    tmpdir,
                ]
            )
            self.assertEqual(code, 0, err)
            self.assertIn("codex", out)
            self.assertTrue((Path(tmpdir) / "codex" / "rules" / "pr-self-review.md").exists())

    def test_json_output_mode(self):
        code, out, err = self.run_cli(["list", "--root", str(FIXTURE_ROOT), "--json"])
        self.assertEqual(code, 0, err)
        self.assertIn('"skills"', out)
        self.assertIn("pr-self-review", out)

    def test_run_command_executes_runtime_skill(self):
        code, out, err = self.run_cli(
            [
                "run",
                "python-runtime",
                "--root",
                str(FIXTURE_ROOT),
                "--input",
                "text=hello",
                "--json",
            ]
        )
        self.assertEqual(code, 0, err)
        self.assertIn('"code": "RUNTIME_EXECUTED"', out)
        self.assertIn("HELLO", out)


if __name__ == "__main__":
    unittest.main()
