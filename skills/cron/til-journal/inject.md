# TIL Journal (cron automation prompt)

When this skill is run by a recurring automation, check whether the recent conversation window produced valuable knowledge worth recording. If it did, write it directly to the daily file.

**What counts as recordable knowledge:**
- A new technique, API, pattern, or concept the user learned
- A tricky bug solved (root cause + fix)
- A useful tool, library, or configuration discovered
- A non-obvious insight from the conversation

**What to skip (do NOT record):**
- Routine tasks (simple edits, formatting, config changes)
- Pure project management or planning conversations
- Knowledge the user clearly already knew
- Simple Q&A with no depth (e.g., "what's the port number?")

**How to run the scheduled capture:**

1. Assess: did the recent capture window produce recordable knowledge? If no → stop.
2. Determine storage path: read `~/.til-journal/config.yaml` for `storage_path`, default to `~/.til-journal/`.
3. Determine today's file: `<storage_path>/daily/<YYYY>/<MM>/<YYYY-MM-DD>.md`
4. If the file doesn't exist, create it with header:
   ```
   # TIL — <YYYY-MM-DD>

   ## Entries
   ```
5. Append an entry in this format:
   ```
   ### <N>. <Concise Title>
   - **Tags**: #tag1 #tag2
   - **Summary**: <2-3 sentence explanation>
   - **Captured**: <HH:MM>
   ```
   (Add a `**Code**:` block only if a code snippet is essential.)
6. If this is an interactive run, append a brief note at the end of your response:
   > 📝 *TIL recorded: <entry title>*
