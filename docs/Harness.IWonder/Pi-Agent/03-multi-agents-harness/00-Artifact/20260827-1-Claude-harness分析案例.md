> gen by sol high

# Q1 Claude Code 的代理协作 Harnes

可以把 Claude Code 的代理协作 Harness 理解为：

> 包裹在模型外部、负责组织任务、装配上下文、分配权限、隔离执行、同步状态、验证结果和处理失败的一整套运行时。

它不是“多个 Claude 互相聊天”，而是一个受控的分布式任务执行系统。

# 1. 总体架构

```
┌──────────────────── 用户意图 ────────────────────┐
                         │
                         ▼
┌──────────────────── Control Plane ───────────────┐
│ Lead Agent / Workflow                            │
│                                                 │
│ 任务分析 → 并行度判断 → DAG 分解 → 调度 → 收敛    │
└───────────────┬───────────────────┬──────────────┘
                │ Task Contract     │ Control Event
                ▼                   ▼
┌──────────────────── Execution Plane ─────────────┐
│ Subagent A     Subagent B       Teammate C       │
│ 独立上下文      独立上下文         独立会话          │
│ 独立工具集      独立权限           可直接通信          │
└───────────────┬───────────────────┬──────────────┘
                │                   │
                ▼                   ▼
┌──────────────────── State Plane ─────────────────┐
│ Shared Task List / Mailbox / Artifacts / Git     │
│ Task DAG       消息队列     文件成果    Worktree  │
└──────────────────────┬───────────────────────────┘
                       ▼
┌──────────────── Governance & Verification ───────┐
│ Permissions │ Hooks │ Tests │ Review │ Telemetry │
└──────────────────────┬───────────────────────────┘
                       ▼
                 Verified Result
```

这里有四个相互独立的平面：

| 平面   | 解决的问题               | 核心原则                 |
| ------ | ------------------------ | ------------------------ |
| 控制面 | 谁做什么、何时开始和停止 | 集中规划，显式预算       |
| 执行面 | Agent 如何完成具体工作   | 上下文、工具、权限隔离   |
| 状态面 | Agent 如何共享事实和进度 | 文件与任务账本是事实源   |
| 治理面 | 如何保证安全与质量       | 确定性规则约束概率性行为 |

------

# 2. Claude Code 提供的四种协作模式

Claude Code 当前把并行工作分成 subagents、agent view、agent teams 和 dynamic workflows；worktree 是与这些模式正交的文件隔离机制。[官方并行代理说明](https://code.claude.com/docs/en/agents)

| 模式              | 协调者                 | Agent 间通信                                  | 适用场景                     |
| ----------------- | ---------------------- | --------------------------------------------- | ---------------------------- |
| Subagents         | 主 Agent               | 主要向调用者返回结果，也可给命名 Agent 发消息 | 搜索、审查、测试等独立支线   |
| Agent Teams       | Team Lead + 共享任务表 | Teammate 可直接通信                           | 需要持续协商的复杂项目       |
| Agent View        | 人类                   | 各会话主要向人汇报                            | 人同时管理多个独立任务       |
| Dynamic Workflows | 确定性脚本             | 由工作流控制数据传递                          | 大规模迁移、审计、多阶段验证 |
| Worktrees         | 不负责协调             | 不提供通信                                    | 隔离并行文件修改             |

## 2.1 Subagent：Hub-and-Spoke

```
             ┌─ Subagent A ─┐
Main Agent ──┼─ Subagent B ─┼─→ 汇总
             └─ Subagent C ─┘
```

特点：

- 每个子 Agent 有独立上下文；
- 可以配置专用 system prompt、模型、工具和权限；
- 完成后将结果返回主 Agent；
- 适合“只关心结果、不关心探索过程”的任务；
- 主 Agent 是唯一的协调中心。

普通子 Agent 不会继承完整对话历史。Harness 必须生成一份完整的 delegation packet，告诉它任务、范围、约束与完成标准。Forked subagent 则会继承父会话上下文，适合任务与当前讨论高度耦合的情况。[官方 Subagent 文档](https://code.claude.com/docs/en/sub-agents)

## 2.2 Agent Team：共享任务表与消息系统

```
                    Team Lead
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Teammate A   Teammate B   Teammate C
          │            │            │
          └────── Shared Task DAG ──┘
          └──────── Mailbox ────────┘
```

Team 由四个组件构成：

- Team Lead；
- 独立 Claude Code 会话形式的 Teammates；
- Shared Task List；
- Agent Mailbox。

Teammate 可以领取任务、更新状态、发送消息；任务依赖满足后，Harness 会自动解除下游任务的阻塞。当前实现将团队运行信息、任务和 mailbox 保存在本机状态目录中。[官方 Agent Teams 架构](https://code.claude.com/docs/en/agent-teams)

它适合：

- 不同 Agent 需要交换发现；
- 需要互相挑战假设；
- 任务在执行中会产生新的任务；
- 不能只靠一次性的最终摘要完成协作。

但 Agent Teams 目前仍是实验能力，默认关闭；而且 teammate 默认不通过独立 worktree 隔离，所以必须明确文件所有权，避免多人同时编辑同一个文件。

## 2.3 Dynamic Workflow：脚本成为协调者

```
Phase 1: 3 个 Agent 独立分析
                  ↓
Phase 2: 2 个 Agent 交叉验证
                  ↓
Phase 3: 1 个 Agent 综合方案
                  ↓
Phase 4: 测试与验收
```

它和 Agent Team 的关键区别是：

- Agent Team：模型动态决定如何协调；
- Dynamic Workflow：代码预先规定阶段、并发数和质量门。

重复性高、规模大、失败代价高的工作更适合 workflow。比如：

- 500 个文件的迁移；
- 全仓库安全审计；
- 多个实现方案的交叉评审；
- 每个修改单元都必须单独验证和提交。

------

# 3. Harness 的核心数据结构：Task Contract

代理协作失败，通常不是 Agent 不够聪明，而是委派消息不完整。

每个任务应当是一份结构化合同：

```
task_id: auth-review
objective: 找出认证模块中的权限绕过风险

scope:
  read:
    - src/auth/**
    - tests/auth/**
  write:
    - outputs/auth-review.md
  prohibited:
    - 修改生产代码
    - 访问真实凭据

dependencies:
  - architecture-map

tools:
  allow:
    - Read
    - Grep
    - Bash(test *)
  deny:
    - Bash(git push *)
    - Write(src/**)

deliverables:
  - 风险清单
  - 对应文件和行号
  - 可复现步骤
  - 修复建议

acceptance:
  - 每个结论必须有代码证据
  - 区分已确认问题和推测
  - 至少运行指定测试

budget:
  max_turns: 20
  timeout_minutes: 15

escalation:
  - 范围不足时通知 lead
  - 需要生产凭据时立即停止
```

一份合格的 Task Contract 至少回答七个问题：

1. 做什么？
2. 为什么做？
3. 可以读取和修改什么？
4. 不允许做什么？
5. 依赖什么？
6. 交付什么？
7. 怎样才算完成？

------

# 4. 状态模型

## 4.1 Task 状态机

```
proposed
   ↓
ready ←──────────── dependency completed
   ↓
claimed
   ↓
running
   ├─→ blocked ──→ running
   ├─→ failed  ──→ retry / reassign
   └─→ completed
             ↓
          verified
             ↓
           merged
```

必须区分：

- `completed`：Agent 认为自己做完了；
- `verified`：测试或审查证明交付物满足标准；
- `merged`：成果已经安全进入主工作区。

不要让“Agent 宣布完成”等价于“系统接受结果”。

## 4.2 Agent 状态机

```
spawned → working → waiting
              ↑         │
              └─────────┘
                 │
        idle / blocked / stopped / failed
```

Harness 应关注的是可观测状态，而不是 Agent 内部“在想什么”：

- 当前任务；
- 最近工具调用；
- 修改过的文件；
- 等待的依赖；
- 权限请求；
- 最后一次有效进展；
- token、时间与工具预算。

------

# 5. 上下文装配

每个 Agent 实际接收的上下文可以表达为：

```
Agent Context
  = Role Prompt
  + Task Contract
  + Project Instructions
  + Dependency Artifacts
  + Relevant Repository Slice
  + Tool Definitions
  + Permission Policy
```

关键原则是最小充分上下文：

- 太少：Agent 无法理解任务；
- 太多：成本增加，注意力被稀释；
- 把整个主对话复制过去：容易携带无关假设；
- 只发一句任务描述：容易遗漏关键约束。

Claude Code 的普通 subagent 使用独立上下文，通过委派消息接收任务；项目级 `CLAUDE.md`、部分项目状态和预加载 Skill 可以进入其初始上下文，但主对话里的临时推理和已经读取的文件不会自动全部继承。[官方上下文规则](https://code.claude.com/docs/en/sub-agents)

因此：

> `CLAUDE.md` 应保存稳定规则，Task Contract 保存本次任务事实，artifact 保存大型中间成果，消息只负责通知与协调。

------

# 6. 共享状态设计

不要把 Agent 聊天记录当作系统状态。

推荐将状态分成四类：

| 状态     | 载体         | 示例                     |
| -------- | ------------ | ------------------------ |
| 协调状态 | Task List    | owner、依赖、状态、预算  |
| 通信状态 | Mailbox      | 阻塞通知、发现、请求     |
| 工作成果 | Artifact     | 代码、报告、测试结果     |
| 版本状态 | Git/Worktree | diff、commit、merge 状态 |

一个 Agent 不应把几千行代码或日志通过消息转发给另一个 Agent，而应：

```
Agent A
  → 写入 artifacts/auth-analysis.md
  → 消息发送路径 + 摘要 + 关键结论
  → Agent B 按需读取原始成果
```

这可以减少：

- 上下文膨胀；
- 多次摘要造成的信息损失；
- lead 成为数据传输瓶颈；
- “传话游戏”式失真。

------

# 7. 文件隔离与所有权

代理协作中最大的工程风险之一，是多个 Agent 同时修改相同文件。

建议采用两种模型之一。

## 模型 A：静态文件所有权

```
frontend-agent:
  owns: apps/web/**

backend-agent:
  owns: services/api/**

test-agent:
  owns: tests/**
```

适合 Agent Team，因为 teammate 默认共享工作目录。

## 模型 B：Worktree 隔离

```
main
├─ worktree-agent-a
├─ worktree-agent-b
└─ worktree-agent-c
```

每个 Agent 在独立 checkout 中工作，最后通过 commit、PR 或 cherry-pick 集成。

适合：

- 多个 Agent 都可能修改公共代码；
- 大规模重构；
- 实验多个实现方案；
- 需要独立回滚。

官方也把 worktree 定位为并行会话的文件隔离层，而不是协调层。[官方并行模式对比](https://code.claude.com/docs/en/agents)

------

# 8. 权限与质量门

模型负责判断“下一步做什么”，Harness 负责决定“这一步是否允许发生”。

```
Agent proposes tool call
          ↓
Permission Policy
          ↓
PreToolUse Hook
   ├─ allow
   ├─ deny
   └─ request human approval
          ↓
Tool executes
          ↓
PostToolUse Hook
          ↓
Tests / Audit / Telemetry
```

适合交给确定性机制的事情：

- 禁止读取 `.env`；
- 禁止直接推送主分支；
- 修改后自动格式化；
- 完成前必须运行测试；
- 禁止修改其他 Agent 所有的文件；
- 记录工具调用和成本；
- 敏感操作要求人工批准。

Claude Code 的权限规则按 `deny → ask → allow` 求值；deny 优先级最高。Agent 之间也不能通过转发消息代替用户批准，或让另一个 Agent 绕过已经被拒绝的操作。[官方权限说明](https://code.claude.com/docs/en/permissions)

Hooks 则是 Harness 的生命周期拦截器。除了常规的 `PreToolUse`、`PostToolUse` 和 `Stop`，Agent Team 还可针对 `TeammateIdle`、`TaskCreated`、`TaskCompleted` 建立质量门。例如测试未通过时，阻止任务被标记完成。[官方 Hooks 指南](https://code.claude.com/docs/en/hooks-guide)

------

# 9. 完整执行生命周期

一个成熟的 Claude Code 协作 Harness 应执行以下过程：

```
1. Intake
   理解用户目标与风险

2. Parallelism Gate
   判断任务是否值得多 Agent 化

3. Planning
   建立任务 DAG、文件边界和验收标准

4. Context Packaging
   为每个 Agent 生成最小充分上下文

5. Scheduling
   根据依赖、优先级和预算启动 Agent

6. Execution
   Agent 在工具—观察—行动循环中工作

7. Coordination
   通过任务表、mailbox 和 artifact 同步

8. Verification
   测试、静态检查、独立 reviewer、质量 Hook

9. Integration
   合并无冲突成果，处理跨任务不一致

10. Completion
    检查用户目标，而不是只检查任务是否全部打勾

11. Cleanup
    停止 Agent、清理临时 worktree、保留审计记录
```

------

# 10. 什么时候不应该启用多 Agent

可以使用一个简单的并行度判断：

```
Parallelism Value
  = 独立子任务数量
  × 单任务工作量
  × 上下文隔离收益
  − 协调成本
  − 文件冲突风险
  − 验证成本
```

适合多 Agent：

- 至少有两个真正独立的工作方向；
- 每个方向都有足够工作量；
- 可以清晰划分文件或产物；
- 并行结果能被客观验证。

不适合：

- 下一步高度依赖上一步结果；
- 多个 Agent 必须修改相同核心文件；
- 任务很小；
- 需要持续共享完整上下文；
- 没有明确的验收方式。

------

# 11. 最终设计原则

可以把 Claude Code 的 Harness Design 浓缩成六条：

1. **Lead 管意图与收敛，Worker 管局部执行。**
2. **Task Contract 是协作 API，不是自然语言备注。**
3. **Task List 管进度，Artifact 管事实，消息只管协调。**
4. **并行修改必须使用文件所有权或 worktree 隔离。**
5. **Agent 的“完成”必须经过测试或独立验证。**
6. **用模型处理判断，用 Hook 和权限处理不可违反的规则。**

最终目标不是让 Agent 尽量自主，而是：

> 让自主性发生在明确的任务边界、状态协议、权限范围和验收机制之内。



---

# Q2 CLAUDE 约束子代理发散性思考

先明确一个关键判断：

> Harness 不能靠提示词要求 Agent“不要发散”，而要把收敛变成可验证、可限额、可进入终态的协议。

这里把 `scout` 理解为侦察/探索代理，把 `review` 理解为审查代理。两者过度发散，通常源于角色目标没有边界：

- Scout 把“找到足够证据”理解成“继续寻找所有可能信息”。
- Reviewer 把“检查是否满足验收标准”理解成“持续提出一切可能的改进”。
- Lead 又把子代理的意见当成待办事项，因此无法宣布完成。

# 一、重新定义两个代理的权限

| 代理     | 应该负责                         | 不应该负责                   | 可声明的终态            |
| -------- | -------------------------------- | ---------------------------- | ----------------------- |
| Scout    | 搜索事实、定位代码、收集证据     | 设计完整方案、扩大产品范围   | `EVIDENCE_READY`        |
| Reviewer | 对照既定标准验收成果             | 重新定义目标、无限提出优化项 | `PASS / FAIL / BLOCKED` |
| Lead     | 设定边界、决定重做、接受剩余风险 | 亲自重复所有探索             | `GOAL_ACHIEVED`         |

最重要的约束是：

> Scout 不能宣告全局完成；Reviewer 不能修改验收标准；只有 Lead 能宣告目标达成。

------

# 二、将开放式目标改为封闭式 Task Contract

不要给 Scout 这样的任务：

```
彻底研究认证模块，找出所有问题。
```

应改成：

```
task_id: scout-auth

objective:
  定位本次登录超时问题可能涉及的代码路径

scope:
  include:
    - src/auth/**
    - tests/auth/**
  exclude:
    - UI 样式
    - 密码策略重构
    - 与登录超时无关的历史缺陷

questions:
  - 超时值在哪里定义？
  - 哪些路径会刷新 session？
  - 是否存在不一致的默认值？

deliverables:
  - 相关文件和行号
  - 调用链
  - 有证据支持的候选原因
  - 未确认项

budget:
  max_tool_calls: 12
  max_files: 20
  max_minutes: 10

stop_when:
  - 三个问题都有证据或明确标记为 unknown
  - 连续两次搜索没有产生新的高价值证据
  - 任一预算耗尽

terminal_status:
  - EVIDENCE_READY
  - BUDGET_EXHAUSTED
  - BLOCKED
```

这样 Scout 的目标不再是“找到世界上所有信息”，而是：

```
在预算内回答有限问题，并明确剩余未知项。
```

`unknown` 也必须被视为合法结果。否则 Agent 会为了消灭所有不确定性无限搜索。

------

# 三、给 Scout 加入边际收益停止条件

Scout 的循环不应该是：

```
搜索 → 发现新线索 → 继续搜索
```

而应该是：

```
搜索
  ↓
新证据是否回答 Contract 中的问题？
  ├─ 是 → 更新 Evidence Table
  └─ 否 → 记录一次低收益搜索
                    ↓
          连续两次低收益？
             ├─ 是 → 停止
             └─ 否 → 继续
```

建议维护一张 Evidence Table：

| Question             | Status   | Evidence               | Confidence |
| -------------------- | -------- | ---------------------- | ---------- |
| 超时在哪里定义       | answered | `config/session.ts:42` | 1.0        |
| 哪些路径刷新 session | answered | 3 个调用点             | 0.8        |
| 默认值是否一致       | unknown  | 未发现第二套默认值     | 0.5        |

收敛判定可以是：

```
coverage =
  已回答问题数 / Contract 问题总数

停止条件 =
  coverage ≥ 目标阈值
  OR 连续 N 次没有新证据
  OR 达到预算
  OR 遇到外部阻塞
```

预算耗尽不等于失败，而是：

```
BUDGET_EXHAUSTED
+ 当前最佳结论
+ 未知项
+ 是否值得追加预算
```

追加预算必须由 Lead 决定，不能由 Scout 自己无限续杯。

------

# 四、把 Reviewer 从“建议生成器”改成“判定器”

Reviewer 最容易发散，因为任何代码永远都可以继续优化。

所以 Reviewer 的输入必须冻结：

```
review_scope:
  artifact: implementation.diff
  acceptance_contract: acceptance.yaml

allowed_checks:
  - 正确性
  - 回归风险
  - 安全性
  - 测试覆盖
  - 是否超出任务范围

forbidden_behavior:
  - 提议无关重构
  - 引入新的产品需求
  - 把代码风格偏好升级为阻塞项
  - 因“还可以更优雅”而拒绝验收

severity:
  blocking:
    - P0
    - P1
  advisory:
    - P2
    - P3

verdict:
  enum:
    - PASS
    - FAIL
    - BLOCKED
```

Reviewer 每条阻塞意见必须携带：

```
finding:
  criterion: "AUTH-03"
  severity: "P1"
  evidence: "src/auth/session.ts:42"
  reproduction: "运行 tests/auth/session-timeout.test.ts"
  expected: "30 分钟后失效"
  actual: "5 分钟后失效"
  required_fix: "统一读取 SESSION_TIMEOUT"
```

如果一条意见不能对应验收条款，又没有可验证的高严重度风险，就只能归类为 `advisory`，不能阻止完成。

因此：

> Reviewer 可以发现新问题，但不能随意把新问题升级成当前任务的完成条件。

------

# 五、冻结验收标准

最危险的循环是：

```
实现 → Review 提出新标准 → 修改
    → Review 又提出新标准 → 修改……
```

解决方法是设置 Acceptance Freeze：

```
执行开始前
    ↓
冻结 Acceptance Contract
    ↓
Reviewer 只能根据冻结标准验收
```

执行过程中只有三种情况允许改变验收标准：

1. 发现明确的 P0/P1 安全或数据风险；
2. 原标准内部矛盾，无法同时满足；
3. 用户明确改变目标。

任何变更都必须创建一条独立的 scope-change 记录，由 Lead 批准：

```
scope_change:
  reason: 新发现权限绕过
  evidence: auth-review.md#finding-3
  impact: 增加一个验收项
  approved_by: lead
```

这能防止 Reviewer 在每轮审查中悄悄移动终点。

------

# 六、区分“完成”和“验收”

建议使用以下状态机：

```
READY
  ↓
SCOUTING
  ↓
EVIDENCE_READY
  ↓
IMPLEMENTING
  ↓
IMPLEMENTED
  ↓
REVIEWING
  ├─ PASS ─────────→ VERIFIED
  ├─ FAIL ─→ REWORK ─┐
  └─ BLOCKED         │
                     └─ 最多返回 N 次
```

全局完成条件：

```
GOAL_ACHIEVED =
  所有必需任务均为 VERIFIED
  AND 所有自动化质量门通过
  AND 没有未处理的 P0/P1
  AND 必需 artifact 已集成
  AND 用户要求均有对应交付物
```

不要求：

- 所有 P2/P3 都修复；
- 所有未知项都消失；
- Reviewer 没有任何建议；
- 代码达到理论最优；
- Scout 穷尽所有搜索路径。

------

# 七、限制 Review—Rework 循环

即使有验收标准，也需要硬性循环上限：

```
convergence_policy:
  max_scout_rounds: 2
  max_review_rounds: 2
  max_rework_rounds: 2

  after_limit:
    - lead_arbitration
    - accept_with_known_risk
    - split_followup_task
    - declare_blocked
```

第二轮 Review 应只检查：

- 上一轮阻塞项是否解决；
- 修改是否引入新的 P0/P1；
- 原验收条件是否仍然满足。

不允许第二轮重新做一次无限制的全仓库审计。

```
Review 1：完整范围审查
Review 2：阻塞项复验 + 回归检查
Review 3：禁止自动进入，必须由 Lead 批准
```

------

# 八、使用 Harness 强制执行，而不是仅靠 Prompt

Claude Code 的 Hooks 可以在生命周期节点执行确定性检查：

- `SubagentStop`：Scout 停止时检查是否提交 Evidence Table；
- `TaskCompleted`：阻止缺少交付物的任务被标记完成；
- `TeammateIdle`：任务未结束却准备空闲时，返回明确剩余项；
- `Stop`：主 Agent 停止前检查全局验收条件。

Claude Code 的 prompt hook 可以返回 `ok: false` 和原因，让 Agent 继续处理；对于永远无法满足的条件，还能用 `impossible: true` 结束循环。[官方 Hooks 机制](https://code.claude.com/docs/en/hooks-guide)

示意逻辑：

```
function canComplete(task) {
  if (!task.deliverablesExist()) {
    return {
      ok: false,
      reason: "缺少 evidence-table.json"
    };
  }

  if (task.reviewRounds > 2) {
    return {
      ok: true,
      warning: "达到审查上限，交由 Lead 仲裁"
    };
  }

  if (task.hasOpenBlockingFindings()) {
    return {
      ok: false,
      reason: "仍有未解决的 P1 finding"
    };
  }

  return { ok: true };
}
```

但 Hook 不能只会说“继续工作”，否则 Harness 本身会制造无限循环。每个阻止完成的 Hook 都应同时提供：

- 具体未满足项；
- 允许的下一步；
- 最大重试次数；
- `BLOCKED` 或 `impossible` 逃生路径。

------

# 九、Lead 的收敛算法

Lead 不应该问：

```
大家还有没有别的建议？
```

因为答案永远是“有”。

它应该执行一个封闭决策：

```
1. Contract 中的必需问题是否已回答？
2. 必需 deliverable 是否存在？
3. Tests 和确定性检查是否通过？
4. Reviewer 是否存在有证据的 P0/P1？
5. Review/Rework 是否超过预算？
6. 剩余问题是阻塞项、已接受风险，还是后续任务？
```

然后只能选择一个终态：

```
GOAL_ACHIEVED
GOAL_ACHIEVED_WITH_KNOWN_RISKS
BLOCKED
FAILED
```

其中“已知风险”需要结构化记录：

```
known_risks:
  - issue: 高并发下 session 刷新尚未压力测试
    severity: P2
    reason_accepted: 不属于本次登录超时修复范围
    followup: perf-test-session-refresh
```

这让系统可以在承认不完美的同时，仍然明确完成当前目标。

# 最核心的收敛原则

```
Scout 对问题集负责，不对无限知识负责。
Reviewer 对验收标准负责，不对理论最优负责。
Lead 对目标完成负责，不对消灭所有未知负责。
Harness 对预算、状态和终止协议负责。
```

最终不是让代理“自行意识到应该停”，而是让系统具备三个明确条件：

> 有限问题、有限预算、有限验收轮次。

这样发散探索会被转换成带边界的证据收集，开放式 Review 会被转换成枚举式判定，整个系统才具备稳定宣告目标达成的能力。