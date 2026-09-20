import tempfile
import unittest
from pathlib import Path

from support import load_checker, make_skill

checker = load_checker()


class SkillMetadataTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.skill = make_skill(self.root)

    def problems(self):
        return checker.check_metadata(self.root, None)

    def test_complete_skill_passes(self):
        self.assertEqual(self.problems(), [])

    def test_policy_must_be_boolean_under_policy(self):
        invalid = [
            "# allow_implicit_invocation: false\n",
            "interface:\n  allow_implicit_invocation: false\n",
            "policy:\n  allow_implicit_invocation: true # allow_implicit_invocation: false\n",
            'policy:\n  allow_implicit_invocation: "false"\n',
            "policy:\n  allow_implicit_invocation: false\n  allow_implicit_invocation: true\n",
            "policy:\n  allow_implicit_invocation: false\npolicy:\n  allow_implicit_invocation: true\n",
        ]
        for content in invalid:
            with self.subTest(content=content):
                (self.skill / "agents/openai.yaml").write_text(content)
                self.assertTrue(checker.validate_openai_policy(self.skill, "manual"))

    def test_policy_accepts_comment_after_boolean(self):
        (self.skill / "agents/openai.yaml").write_text("policy:\n  allow_implicit_invocation: false # manual\n")
        self.assertEqual(self.problems(), [])

    def test_nested_list_cannot_borrow_another_sections_keywords(self):
        path = self.skill / "skill.yaml"
        path.write_text(path.read_text().replace("triggers:\n  keywords:", "triggers:\nother:\n  keywords:"))
        self.assertTrue(any("triggers.keywords" in problem.message for problem in self.problems()))

    def test_identity_mismatch_and_duplicate_ids_fail(self):
        path = self.skill / "SKILL.md"
        path.write_text(path.read_text().replace("ng-plan-demo", "wrong-id"))
        self.assertTrue(any("differ" in problem.message for problem in self.problems()))
        make_skill(self.root, "manual/other/demo")
        self.assertTrue(any("duplicate" in problem.message for problem in self.problems()))

    def test_empty_description_does_not_consume_next_field(self):
        path = self.skill / "SKILL.md"
        path.write_text("---\nname: ng-plan-demo\ndescription:\nmetadata: present\n---\n")
        self.assertTrue(any("description" in problem.message for problem in self.problems()))

    def test_bundled_link_check_ignores_example_commands(self):
        path = self.skill / "SKILL.md"
        original = path.read_text()
        path.write_text(original + "\n```bash\npython3 scripts/example.py\n```\n")
        self.assertEqual(self.problems(), [])
        path.write_text(original + "\n[Examples](references/missing.md)\n")
        self.assertTrue(any("broken bundled link" in problem.message for problem in self.problems()))

    def test_missing_root_is_not_a_passing_audit(self):
        self.assertTrue(checker.check_metadata(self.root / "absent", None))
