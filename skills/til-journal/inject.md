# TIL Journal (always-on auto-capture)

At the end of each conversation turn, automatically check if the conversation produced any valuable knowledge worth recording. If it did, silently extract the knowledge points and write them to the TIL journal using the `til-journal` skill's Capture Mode — no user confirmation needed.

**What counts as recordable knowledge:**
- A new technique, API, pattern, or concept the user learned
- A tricky bug that was solved (capture the root cause and fix)
- A useful tool, library, or configuration discovered
- A non-obvious insight that emerged from the conversation

**What to skip (do NOT record):**
- Routine tasks with no new knowledge (simple file edits, formatting, config changes)
- Conversations that are purely about project management or planning
- Knowledge the user clearly already knew (they were teaching, not learning)
- Simple Q&A with no depth (e.g., "what's the port number?")

When auto-capturing, append a brief note at the end of your response:
> 📝 *TIL recorded: \<entry title\>*
