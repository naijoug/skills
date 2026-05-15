# Notebook Template

Use this template for each hourly entry. Keep all paths relative to the workspace.

```markdown
## HH:mm

### 规划与取舍
- 上一段/当前状态：
- 候选工作：
- 本轮选择：
- 选择理由：
- 下一段计划：

### 执行记录
- 实际推进：
- 变更文件：
  - `relative/path`
- 验证方式：
- 后续接力：下一次优先从 `relative/path` 的具体小块继续；决策门是……；若出现……边界条件，则改选……；验证用……。
```

If there are no changed project files, write `无` under `变更文件`. If a repo already had unrelated dirty changes, explicitly say they were observed and avoided.

For `后续接力`, do not write a vague theme such as “continue improving tests” or “keep working on docs”. Include four handoff details:

1. **Next path:** the first file, directory, command, or decision surface the next run should inspect.
2. **Next slice:** the smallest concrete change that should be attempted first.
3. **Decision gate:** the condition that determines whether to proceed, simplify, or switch targets.
4. **Boundary condition:** the dirty-worktree, verification, scope, or product signal that should make the next run choose a different candidate.
