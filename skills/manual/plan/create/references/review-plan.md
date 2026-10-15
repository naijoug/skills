# Review an existing plan

Locate the plan from the request/context. Verify named paths and symbols, relevant
contracts, dependencies and task prerequisites against the requested code state.
Distinguish HEAD, a supplied revision and uncommitted working-tree changes; a date
alone does not identify a reproducible snapshot.

Check feasibility, missing dependencies, outdated assumptions, overlapping work,
verification gaps and unnecessary steps. Use history on relevant paths if it helps
explain drift. Do not require a full repository map for a narrow plan.

Deliver a verdict (`good-as-is`, `minor-tweaks`, `needs-rework`) and concrete
findings with location in the plan, code evidence, impact and a suggested change.
Use blocker/major for feasibility or correctness issues and minor for limited gaps;
do not elevate stylistic preferences. State unverified claims and the evidence
needed. Do not edit the plan or implement it for a review-only request.
