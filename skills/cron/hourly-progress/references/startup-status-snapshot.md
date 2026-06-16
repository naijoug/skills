# Startup Status Snapshot

Use this reference at the very beginning of a scheduled progress run, before choosing a target repo or accepting the previous handoff. The goal is to separate what already existed at wake-up time from what this run actually did.

## Minimum snapshot

Record enough state to make later commit and report boundaries auditable:

1. **Clock and cadence**
   - Current host date/time.
   - Whether the run is hourly, quarter-hourly, daily, or another cadence.
2. **Workspace root**
   - Whether the workspace root is itself a git repository.
   - If it is not a repo, say so once; do not treat that as an error if work happens in sub-repos.
3. **Relevant sub-repos**
   - For each likely repo, capture `git status --short`.
   - Include clean repos too when they are candidates; clean status is useful selection evidence.
4. **Previous handoff**
   - Last notebook entry's `Next path`, `Next slice`, and boundary condition.
   - Whether the named paths are clean, dirty, missing, or already implemented.
5. **Pre-existing dirty paths**
   - Paths that were dirty before this run touched anything.
   - A short ownership label when obvious: `known-own`, `previous-agent`, `user-or-unknown`, or `generated/noise`.

## Snapshot shape

Use concise, relative-path wording in the notebook. Avoid absolute paths and avoid pasting huge status output.

```text
Startup snapshot:
- workspace root: not a git repo
- clean candidates: books, skills
- startup-dirty: makemoney/docs/interview-qa-day3-publish-kit.md (user-or-unknown), docs/documents/trending/ai/README.md (user-or-unknown)
- previous handoff: makemoney/docs/interview-qa-day3-publish-kit.md; blocked until ownership can be proven
```

For the final report, compress the same evidence:

```text
未接管边界：makemoney 的 Day 3 发布包相关文件在本轮启动前已 dirty，未能证明归属；docs/loom 等 repo 也有启动前改动，本轮未 stage。
```

## Decision use

After the snapshot, choose the target with these gates:

1. **If the handoff repo is clean**, continue the smallest verifiable next slice.
2. **If the handoff path is dirty but provenance is clear**, adopt or validate it explicitly and report it as adoption.
3. **If the handoff path is dirty and provenance is unclear**, do not edit or stage it; pick a clean repo or an isolated new path.
4. **If all useful repos are dirty**, prefer a notebook-only blocker over inventing low-value work, unless a clean process or writing asset removes a recurring failure mode.

## What not to do

- Do not use a post-edit status as if it were the startup snapshot.
- Do not say a path was "already dirty" unless you captured it before editing.
- Do not let the snapshot become the only output of the run when a safe, valuable task exists.
- Do not paste absolute local paths into summaries or notebooks.
- Do not stage every dirty file just because all of them appear in the final status.
- Do not skip path-limited staging; the snapshot is useful only if commit boundaries stay explicit.

## Checklist

Before planning is finalized:

- [ ] Current date/time was obtained from the host.
- [ ] Workspace root git state is known.
- [ ] Relevant sub-repo statuses were checked before edits.
- [ ] Previous `Next path` / `Next slice` was read.
- [ ] Startup-dirty paths are distinguishable from this run's edits.
- [ ] Unknown dirty handoff paths are either avoided or explicitly adopted with evidence.
- [ ] The notebook and final response will use workspace-relative paths only.
