from pathlib import Path
import unittest

from tests import _bootstrap  # noqa: F401


FIXTURE_ROOT = Path(__file__).parent / "fixtures" / "sample_skills"


class MCPServerTests(unittest.TestCase):
    def test_handle_known_methods(self):
        from skills_platform.mcp_server import handle_request

        req = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "skills.list",
            "params": {"root": str(FIXTURE_ROOT)},
        }
        res = handle_request(req)
        self.assertEqual(res["id"], 1)
        self.assertIn("result", res)
        self.assertIn("skills", res["result"])

    def test_unknown_method_returns_jsonrpc_error(self):
        from skills_platform.mcp_server import handle_request

        req = {"jsonrpc": "2.0", "id": 2, "method": "skills.nope", "params": {}}
        res = handle_request(req)
        self.assertEqual(res["id"], 2)
        self.assertIn("error", res)
        self.assertEqual(res["error"]["code"], -32601)

    def test_render_and_validate_routes(self):
        from skills_platform.mcp_server import handle_request
        import tempfile

        with tempfile.TemporaryDirectory() as tmpdir:
            render_res = handle_request(
                {
                    "jsonrpc": "2.0",
                    "id": 3,
                    "method": "skills.render",
                    "params": {
                        "root": str(FIXTURE_ROOT),
                        "targets": ["codex"],
                        "output": tmpdir,
                    },
                }
            )
            self.assertIn("result", render_res)
            self.assertTrue((Path(tmpdir) / "codex" / "rules").exists())

        validate_res = handle_request(
            {
                "jsonrpc": "2.0",
                "id": 4,
                "method": "skills.validate",
                "params": {"root": str(FIXTURE_ROOT)},
            }
        )
        self.assertIn("result", validate_res)
        self.assertEqual(validate_res["result"]["error_count"], 0)


if __name__ == "__main__":
    unittest.main()
