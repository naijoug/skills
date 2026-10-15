# Routing examples

Candidate selection does not authorize executing the requested action.

## Positive (Chinese)

- "给这个自动选择目标文件的 preflight 写临时目录里的正反例测试。"
- "这些测试的 fixture 只报 unwrap 失败，补上 setup、子进程和清理阶段的诊断。"
- "确认这个发布守卫在拒绝输入时没有触发任何外部副作用。"

## Positive (English)

- "Test this preflight with isolated valid, invalid and missing-target fixtures."
- "Improve fixture failure diagnostics without changing assertions or production behavior."
- "Prove the negative guard test reaches the intended rejection rather than failing during setup."

## Negative / Near Miss

- "只运行现有测试套件。"
- "Change the production retry policy to tolerate database timeouts."
- "Explain the syntax of Rust unwrap."
