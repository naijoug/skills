from pathlib import Path
import unittest

from tests import _bootstrap  # noqa: F401


FIXTURE_ROOT = Path(__file__).parent / "fixtures" / "sample_skills"


class DiscoveryTests(unittest.TestCase):
    def test_discovers_skills_from_skill_md_and_optional_skill_yaml(self):
        from skills_platform.discovery import discover_skills

        skills = discover_skills(FIXTURE_ROOT)
        by_id = {skill.id: skill for skill in skills}

        self.assertIn("pr-self-review", by_id)
        self.assertIn("no-meta-skill", by_id)
        self.assertEqual(by_id["pr-self-review"].title, "PR Self Review")
        self.assertEqual(by_id["pr-self-review"].kind, "prompt_plus_runtime")
        self.assertEqual(by_id["no-meta-skill"].kind, "prompt_only")
        self.assertTrue(by_id["pr-self-review"].tool_overrides)

    def test_validation_reports_no_errors_for_fixture_set(self):
        from skills_platform.discovery import discover_skills
        from skills_platform.validation import validate_skills

        report = validate_skills(discover_skills(FIXTURE_ROOT))
        self.assertEqual(report.error_count, 0)
        self.assertGreaterEqual(report.warning_count, 1)
        self.assertTrue(
            any("skill.yaml" in warning.message for warning in report.warnings),
            "Expected warning for no-meta-skill missing skill.yaml",
        )

    def test_validation_accepts_shell_runtime_when_command_present(self):
        from skills_platform.discovery import discover_skills, get_skill
        from skills_platform.validation import validate_skills

        skills = discover_skills(FIXTURE_ROOT)
        shell_skill = get_skill(skills, "shell-runtime")
        self.assertIsNotNone(shell_skill)
        report = validate_skills([shell_skill])
        self.assertEqual(report.error_count, 0)

    def test_simple_yaml_parser_supports_nested_maps_and_lists(self):
        from skills_platform.simple_yaml import parse_simple_yaml

        text = """
id: demo
tags:
  - review
  - checklist
runtime:
  entrypoint: skills.demo.runtime:run
  timeout: 30
"""
        data = parse_simple_yaml(text)
        self.assertEqual(data["id"], "demo")
        self.assertEqual(data["tags"], ["review", "checklist"])
        self.assertEqual(data["runtime"]["timeout"], 30)


if __name__ == "__main__":
    unittest.main()
