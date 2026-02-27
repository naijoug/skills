# Cross-Tool Skills Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a zero-dependency Python MVP that discovers local skills, exports tool-specific artifacts, and provides a CLI + MCP server skeleton for cross-tool reuse.

**Architecture:** Implement a shared `skills_platform` core for discovery/validation/rendering, a thin CLI wrapper, and a stdio JSON-RPC server that routes generic `skills.*` methods to the same core services. Adapters generate `dist/<tool>` outputs for all requested tools.

**Tech Stack:** Python 3 (stdlib only), `unittest`, filesystem-based templates/rendering

---

### Task 1: Create project scaffolding and tests (TDD harness)

**Files:**
- Create: `pyproject.toml`
- Create: `src/skills_platform/__init__.py`
- Create: `tests/test_discovery.py`
- Create: `tests/test_cli.py`
- Create: `tests/test_adapters.py`
- Create: `tests/test_mcp_server.py`
- Create: `tests/fixtures/sample_skills/...`

**Step 1: Write failing tests**

- Add tests for skill discovery from `SKILL.md` frontmatter and optional `skill.yaml`
- Add tests for `skills list/show/render/validate`
- Add tests for adapter export output layout
- Add tests for MCP JSON-RPC method routing

**Step 2: Run tests to verify failures**

Run: `python3 -m unittest discover -s tests -v`
Expected: FAIL due to missing `skills_platform` modules

**Step 3: Add minimal package scaffolding**

- Add empty package files only as needed for imports

**Step 4: Re-run tests**

Run: `python3 -m unittest discover -s tests -v`
Expected: FAIL with more specific missing symbols (red state improved)

### Task 2: Implement discovery, metadata parsing, and validation

**Files:**
- Create: `src/skills_platform/models.py`
- Create: `src/skills_platform/simple_yaml.py`
- Create: `src/skills_platform/frontmatter.py`
- Create: `src/skills_platform/discovery.py`
- Create: `src/skills_platform/validation.py`
- Modify: `tests/test_discovery.py`

**Step 1: Write/adjust failing tests for parser/validator details**

- Frontmatter parsing
- Simple YAML subset parsing
- Fallback metadata when `skill.yaml` missing
- Validation warnings/errors

**Step 2: Run targeted tests**

Run: `python3 -m unittest tests.test_discovery -v`
Expected: FAIL with assertion/import errors

**Step 3: Implement minimal code**

- Parse frontmatter
- Parse simple YAML subset
- Build `SkillRecord`
- Validate required fields for runtime/export

**Step 4: Re-run targeted tests**

Run: `python3 -m unittest tests.test_discovery -v`
Expected: PASS

### Task 3: Implement adapters and exporter

**Files:**
- Create: `src/skills_platform/adapters/base.py`
- Create: `src/skills_platform/adapters/common.py`
- Create: `src/skills_platform/adapters/registry.py`
- Create: `src/skills_platform/adapters/tool_renderers.py`
- Create: `src/skills_platform/exporter.py`
- Modify: `tests/test_adapters.py`

**Step 1: Write failing adapter/export tests**

- All target tools produce `rules`, `config`, `install` outputs
- Exported rule file contains skill summary and usage cues
- Config contains CLI/MCP invocation hints

**Step 2: Run targeted tests**

Run: `python3 -m unittest tests.test_adapters -v`
Expected: FAIL

**Step 3: Implement minimal adapter registry/renderers**

- Registry of requested tools
- Shared renderer + per-tool config snippets
- Export filesystem writer

**Step 4: Re-run targeted tests**

Run: `python3 -m unittest tests.test_adapters -v`
Expected: PASS

### Task 4: Implement CLI commands

**Files:**
- Create: `src/skills_platform/cli.py`
- Create: `src/skills_platform/__main__.py`
- Modify: `tests/test_cli.py`

**Step 1: Write failing CLI behavior tests**

- `list`, `show`, `validate`, `render`, `doctor`
- Exit codes and JSON output for machine-readable mode

**Step 2: Run targeted tests**

Run: `python3 -m unittest tests.test_cli -v`
Expected: FAIL

**Step 3: Implement CLI**

- `argparse` command tree
- shared service calls
- human and JSON outputs

**Step 4: Re-run targeted tests**

Run: `python3 -m unittest tests.test_cli -v`
Expected: PASS

### Task 5: Implement MCP server skeleton

**Files:**
- Create: `src/skills_platform/mcp_server.py`
- Modify: `tests/test_mcp_server.py`

**Step 1: Write failing MCP routing tests**

- Parse JSON-RPC requests
- Route `skills.list`, `skills.describe`, `skills.validate`, `skills.render`
- Return structured errors for unknown methods

**Step 2: Run targeted tests**

Run: `python3 -m unittest tests.test_mcp_server -v`
Expected: FAIL

**Step 3: Implement minimal stdio server + router**

- Request handler function (pure, testable)
- optional `serve_stdio()` loop

**Step 4: Re-run targeted tests**

Run: `python3 -m unittest tests.test_mcp_server -v`
Expected: PASS

### Task 6: Add sample metadata and docs updates

**Files:**
- Create: `skills/pr-self-review/skill.yaml`
- Modify: `README.md`

**Step 1: Write failing validation/export test expecting metadata to be read**

Run: `python3 -m unittest tests.test_discovery tests.test_adapters -v`
Expected: FAIL (missing metadata file or missing parsed fields)

**Step 2: Add sample `skill.yaml` and docs**

- Add metadata file using simple YAML subset
- Document CLI/export/MCP usage in README

**Step 3: Re-run tests**

Run: `python3 -m unittest discover -s tests -v`
Expected: PASS

### Task 7: Verification and smoke checks

**Files:**
- Modify: `docs/plans/2026-02-26-cross-tool-skills-platform-implementation.md` (optional notes)

**Step 1: Run verification commands**

- `python3 -m unittest discover -s tests -v`
- `PYTHONPATH=src python3 -m skills_platform list --root skills`
- `PYTHONPATH=src python3 -m skills_platform render --root skills --target codex --output dist`
- `PYTHONPATH=src python3 -m skills_platform doctor --root skills`

**Step 2: Capture outputs and residual gaps**

- Note unsupported advanced YAML features without PyYAML
- Note MCP skeleton scope vs full protocol

**Step 3: Commit (optional, user-directed)**

```bash
git add docs/plans pyproject.toml src tests README.md skills/pr-self-review/skill.yaml
git commit -m "feat: add cross-tool skills platform scaffold"
```

