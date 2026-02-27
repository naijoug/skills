from pathlib import Path
import tempfile
import unittest

from tests import _bootstrap  # noqa: F401


FIXTURE_ROOT = Path(__file__).parent / "fixtures" / "sample_skills"
TARGETS = ["codex", "claude-code", "amp", "trae", "antigravity", "cursor", "vscode"]


class AdapterExportTests(unittest.TestCase):
    def test_export_writes_rules_config_install_for_each_target(self):
        from skills_platform.exporter import export_targets

        with tempfile.TemporaryDirectory() as tmpdir:
            result = export_targets(FIXTURE_ROOT, Path(tmpdir), targets=TARGETS)

            self.assertEqual(set(result["targets"]), set(TARGETS))
            for target in TARGETS:
                base = Path(tmpdir) / target
                self.assertTrue((base / "rules").is_dir(), target)
                self.assertTrue((base / "config").is_dir(), target)
                self.assertTrue((base / "install").is_dir(), target)
                self.assertTrue((base / "install" / "README.md").exists(), target)
                self.assertTrue((base / "config" / "mcp.json").exists(), target)

            codex_rule = (Path(tmpdir) / "codex" / "rules" / "pr-self-review.md").read_text()
            self.assertIn("PR Self Review", codex_rule)
            self.assertIn("skills run pr-self-review", codex_rule)


if __name__ == "__main__":
    unittest.main()
