# Change ownership and scoped commits

Read the relevant status and diff before editing an already-dirty target. Track
which paths or hunks existed before this task, including staged work. Timestamps
and diff size alone do not establish ownership.

For local work, preserve unrelated changes and verify the requested slice. A dirty
repository is not itself a reason to stop. If the requested change overlaps
unknown edits, inspect the overlap and ask only when the decision cannot be inferred.

When committing is already authorized:

1. Stage explicit owned paths, or isolate owned hunks when a file also contains
   earlier work. Do not stage an entire mixed file merely because its path is owned.
2. Inspect both `git diff --cached --name-only` and the staged diff. Existing staged
   changes must not enter the commit accidentally; preserve them rather than resetting
   the index indiscriminately.
3. Verify the intended commit content, commit only that content, and read back its
   actual hash. Report remaining unrelated changes without calling them a failure.

When committing is not part of the task, deliver the verified local change. Do not
introduce a permission question just to complete a handoff.
