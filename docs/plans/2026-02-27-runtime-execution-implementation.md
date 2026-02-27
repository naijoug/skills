# Runtime Execution Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add real runtime execution for `prompt_plus_runtime` skills with both Python module entrypoints and shell commands executed inside a `uv`-managed virtual environment.

**Architecture:** Keep the existing discovery/CLI/MCP surfaces unchanged and upgrade `runtime_exec.run_skill()` to dispatch by runtime type. Implement strict path guards for shell execution so commands can only run under the owning skill directory. Build behavior via unit tests first, then implement minimal code paths to satisfy test coverage.

**Tech Stack:** Python 3 stdlib (`importlib`, `inspect`, `subprocess`, `shlex`, `pathlib`, `unittest.mock`), existing `unittest` suite

---

### Task 1: Add runtime execution tests

**Files:**
- Modify: `tests/test_discovery.py`
- Create: `tests/test_runtime_exec.py`

**Step 1: Write failing tests for runtime type inference and Python module execution**
- Validate `runtime.entrypoint` defaults to Python module mode
- Validate missing skill returns `SKILL_NOT_FOUND`
- Validate prompt-only still returns `PROMPT_ONLY`

**Step 2: Write failing tests for shell mode with uv**
- Validate `uv venv` is called when `.venv/bin/python` missing
- Validate `uv run --python <venv_python>` executes command with templated args
- Validate non-zero exit returns structured failure

**Step 3: Write failing tests for shell safety constraints**
- Reject `runtime.cwd` escaping skill directory
- Reject `runtime.venv` escaping skill directory

**Step 4: Run targeted tests and verify failures**

Run: `python3 -m unittest tests.test_runtime_exec -v`
Expected: FAIL due to unimplemented runtime behavior

### Task 2: Implement runtime dispatch and execution

**Files:**
- Modify: `src/skills_platform/runtime_exec.py`

**Step 1: Implement runtime mode resolution**
- Support explicit `runtime.type` values: `python_module`, `shell_command`
- Preserve compatibility by inferring mode from `entrypoint` or `command`

**Step 2: Implement Python module execution**
- Parse `module:function`
- Dynamically import and invoke callable with sensible input passing
- Return structured success/error payloads

**Step 3: Implement shell execution via uv venv**
- Resolve and guard working directory + venv path under skill root
- Ensure venv exists via `uv venv <path>`
- Execute via `uv run --python <venv_python> -- <command ...>`
- Return stdout/stderr/returncode in `details`

**Step 4: Re-run targeted runtime tests**

Run: `python3 -m unittest tests.test_runtime_exec -v`
Expected: PASS

### Task 3: Regression checks for existing interfaces

**Files:**
- Modify: `tests/test_cli.py`
- Modify: `tests/test_mcp_server.py`

**Step 1: Add/adjust tests proving `run` command and `skills.run` method stay functional**

**Step 2: Run focused command-router tests**

Run: `python3 -m unittest tests.test_cli tests.test_mcp_server -v`
Expected: PASS

### Task 4: Full verification

**Files:**
- No code changes required unless regressions are found

**Step 1: Run full test suite**

Run: `python3 -m unittest -q`
Expected: PASS

**Step 2: Optional smoke checks**

Run:
- `PYTHONPATH=src python3 -m skills_platform run pr-self-review --root skills`
- `PYTHONPATH=src python3 -m skills_platform validate --root skills`

Expected:
- `run` returns structured result (may fail only if runtime module absent)
- validate remains stable
