# Monorepo test entrypoint drift

When two commands appear to exercise the same code but disagree, compare their
working directories, package scripts, resolvers, exports, aliases and source vs
built output. Record the intended code and actual resolved entrypoint before
trusting a pass/fail result. Inspect configuration before running expensive probes
when it can answer the question directly.

Use a minimal pair of supported commands, or a before/after dependency build when
the repository intentionally tests dist. Avoid overwriting unrelated generated
work. Fix aliases only for a supported root entrypoint; otherwise document the
package-local command. Rerun the same failing entrypoint after the change.

A green test against stale dist does not verify current source. A command run
from an unsupported cwd does not necessarily justify a toolchain rewrite.
