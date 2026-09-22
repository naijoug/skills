# Routing examples

These are candidate-selection fixtures, not authorization to deploy or announce.

## Positive (Chinese)

- "预览 URL 已经能打开了，帮我审核这份‘可以公开上线’的结论是否有足够证据。"
- "只批准了内部灰度，交接却写成 public GO；请核对部署状态、验证结果和发布范围。"

## Positive (English)

- "Review whether this deployment receipt and rollback note actually support our public launch GO claim."
- "Public launch was already approved for this version. Assess whether the current deployment checks justify that launch status."

## Negative / Near Miss

- "帮我给这个服务新增 Dockerfile 和 health 路由。"
- "Deploy this approved change to the staging environment."
- "根据 Golden Tasks、工具权限、trace 和回滚证据评审这个 Agent 版本能否灰度。" <!-- eval: {"route":"select","skills":["ng-review-agent-release-gate"]} -->
- "Rewrite this sentence to be shorter without changing its meaning." <!-- eval: {"route":"none"} -->

## Workflow checks (not routing cases)

- A preview URL returns 200, but only internal access was approved and the main user flow was not checked. Report reachability and the limited scope; do not claim public readiness or announce a launch.
- Public launch for the exact version and audience is already authorized, and the project's required checks pass. Accept that authority without requesting a second approval or an invented signoff file.
- A review has no launch authority. Finish the evidence assessment and identify the missing authority for the external action; do not stop independent local verification.
- Checks passed for an older release in staging. Do not use them to claim the current production release was verified.
