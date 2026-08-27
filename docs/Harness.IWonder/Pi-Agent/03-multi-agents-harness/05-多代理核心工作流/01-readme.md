---
title: 子代理、团队与工作流
tags: [Subagent, Agent-Team, Workflow, DAG, 并行]
note_types : document
created: 2026-08-27
updated: 2026-08-28

---


# 子代理、团队与工作流

> [!abstract]
> 多代理不是单一产品形态：Subagent 适合 Hub-and-Spoke 的有限委派，Agent Team 适合依赖 Task DAG 与 Mailbox 的持续协商，Dynamic Workflow 适合代码预定义阶段和质量门的大规模重复任务；三种模式共享 Role Runtime、Contract、State 与 Governance，但在协调者、通信方式和终止协议上保持独立。

> [!note]
> **上层主题：** [权限、收敛与验收机制](../06-治理验证层/01-权限收敛与验收机制.md)  
> **下层主题：** [子代理软件包设计](../08-软件包工程层/01-子代理软件包设计.md)

## 1. 产品模式总览

| 模式 | 协调者 | 通信 | 适用任务 |
| :-- | :-- | :-- | :-- |
| Subagent | Lead | 主要向 Lead 返回 | 搜索、审查、测试、局部实现 |
| Agent Team | Team Lead + Task Registry | Mailbox 与 Shared Task DAG | 持续协商与动态分工 |
| Dynamic Workflow | 确定性程序 | Stage Input/Output | 迁移、审计、批量验证 |
| Human Agent View | 人类 | 各 Session 向人汇报 | 人工并行管理 |

Worktree 与这些模式正交，只提供文件修改隔离。

## 2. Subagent 模式

### 2.1 拓扑

```text
             ┌─ Scout ────┐
Lead Agent ──┼─ Planner ───┼─→ Lead convergence
             ├─ Worker ────┤
             └─ Reviewer ──┘
```

### 2.2 特征

- Lead 是唯一协调中心；
- Subagent 拥有独立 Context；
- 委派通过完整 Task Contract；
- Subagent 通常不直接彼此通信；
- 结果通过 Verified Context Capsule 与结构化报告返回；
- 下游通过 Handoff ACK 声明确认与缺口；
- 适合单次有限任务。

### 2.3 生命周期

```text
start
  ↓
execute bounded contract
  ↓
finalize report
  ↓
return to lead
  ↓
dispose runtime
```

### 2.4 产品边界

`pi-subagents` 第一阶段只需实现：

- Role Definition；
- Isolated Runtime；
- Start/Status/Control/Collect；
- Structured Terminal Report；
- Budget 与 Scope Policy；
- Lead Milestone Notification；
- Context Capsule Verification；
- Handoff ACK 与 Context Gap Gate；
- Completion Latch。

## 3. Agent Team 模式

### 3.1 拓扑

```text
                    Team Lead
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Teammate A   Teammate B   Teammate C
          │            │            │
          └──── Shared Task DAG ─────┘
          └──────── Mailbox ─────────┘
```

### 3.2 需要新增的系统能力

- Shared Task Registry；
- Claim 与 Lease；
- Dependency Unblocking；
- Peer Mailbox；
- Heartbeat；
- Idle Detection；
- Reassignment；
- File Ownership；
- Team Completion Gate。

### 3.3 Claim 与 Lease

```text
READY
  ↓ claim
CLAIMED
  ↓ start
RUNNING
  ├─ heartbeat renew
  ├─ lease expires → READY
  ├─ blocked → BLOCKED
  └─ completed → VERIFIED
```

Claim 决定 Owner，Lease 防止崩溃 Agent 永久占用 Task。

### 3.4 Mailbox

Mailbox 传递：

- 依赖完成；
- Evidence 发现；
- Blocker；
- Scope 请求；
- Peer Challenge；
- Integration Conflict。

大型内容仍通过 Artifact Reference 传递。

## 4. Dynamic Workflow 模式

### 4.1 拓扑

```text
Stage 1: parallel scouts
  ↓
Stage 2: evidence consolidation
  ↓
Stage 3: parallel workers
  ↓
Stage 4: reviewers
  ↓
Stage 5: verification and integration
```

### 4.2 特征

- 阶段由代码定义；
- 并发数由 Scheduler 定义；
- 每个 Stage 有输入输出 Schema；
- Quality Gate 决定是否推进；
- Retry 与 Failure Policy 确定化；
- Agent 只决定 Stage 内部局部动作。

### 4.3 适用任务

- 大规模文件迁移；
- 全仓安全审计；
- 多方案交叉评审；
- 批量修复与逐单元验证；
- 可重复发布流程。

### 4.4 Failure Salvage

Workflow 的顶层失败必须保留 Completed Artifacts、Verified Artifacts、Interrupted Runs、Missing Deliverables、Integration State 与 Recovery Actions；单一 `failed` 状态不能抹平局部成果。

## 5. 模式选择

### 5.1 Subagent 选择条件

- 工作方向独立；
- 只需要最终结果；
- 不需要持续 Peer 协商；
- Lead 可以完成集中收敛。

### 5.2 Team 选择条件

- Agent 需要交换发现；
- Task 执行中动态产生新 Task；
- 依赖关系频繁变化；
- Peer Challenge 能显著提升结果。

### 5.3 Workflow 选择条件

- 阶段稳定；
- 重复次数高；
- 失败代价高；
- 验证方式确定；
- 希望减少模型调度自由度。

> [!revision]
> **2026-08-28 · 经验修订**
>
> 基于 [失败轨迹](../00-Artifact/20260828-2-多代理协作能力研究札记——一次失败经历的复盘.md) 与 [经验验证](../09-经验验证层/01-失败轨迹与知识修订.md)，原并行价值公式补入 Context Reacquisition、Artifact Conversion、重复验证与集成成本，通信工具不再被视为完整 Harness。

## 6. Parallelism Gate

```text
Parallelism Value
  = Independent Tasks
  × Work per Task
  + Independent Perspective Value
  - Context Reacquisition Cost
  - Artifact Conversion Cost
  - Coordination Cost
  - Duplicate Verification Cost
  - File Conflict Risk
  - Integration Cost
```

Gate 输出：

```ts
interface ParallelismDecision {
  recommended: boolean;
  mode: "single" | "subagent" | "team" | "workflow";
  reasons: string[];
  estimatedAgents: number;
  conflictRisk: "low" | "medium" | "high";
}
```

## 7. 文件并行策略

### 7.1 Read-only Parallelism

多个 Scout 可共享工作区并行读取。

### 7.2 Ownership Parallelism

不同 Worker 按目录或 Artifact 划分所有权。

### 7.3 Worktree Parallelism

多个 Worker 修改重叠范围时使用独立 Worktree，并通过 Commit、Cherry-pick 或 Merge 集成。

### 7.4 Integration Gate

- Commit 可定位；
- Tests 已通过；
- Conflict 已解决；
- Reviewer 已确认；
- Ownership 已释放。

## 8. Shared Core 与模式特有能力

### 8.1 Shared Core

- Role Runtime；
- Task Contract；
- Run Lifecycle；
- Evidence、Artifact 与 Verified Context Capsule；
- Handoff ACK 与 Context Gap；
- Completion Latch；
- Scope 与 Budget Policy；
- Verification；
- Audit Event。

### 8.2 Subagent 特有

- Hub-and-Spoke Dispatch；
- Direct Result Return；
- Lead-only Control。

### 8.3 Team 特有

- Shared DAG；
- Claim 与 Lease；
- Peer Mailbox；
- Team Completion。

### 8.4 Workflow 特有

- Stage Definition；
- Deterministic Scheduler；
- Stage Gate；
- Batch Retry。

## 9. 产品演进顺序

```text
Phase 1
  Bounded Scout Subagent

Phase 2
  Planner / Worker / Reviewer Roles

Phase 3
  Async Multi-Run Supervisor

Phase 4
  Task DAG + Claim + Mailbox

Phase 5
  Deterministic Workflow Engine

Phase 6
  Worktree Integration and Recovery
```

## 10. 产品原则

- 不把所有协作模式塞入一个 Tool。
- 不让 Subagent 模式承担 Team 协议。
- 不让 Agent Team 替代确定性 Workflow。
- 不因可并行而默认并行。
- 不在 Message 中搬运大型 Artifact。
- 不把 IPC、RPC 或 Intercom 误认为完整 Harness。
- 不在下游未 ACK 上游 Artifact 时假定上下文已经复用。
- 不让 Workflow Failure 丢弃可恢复成果。
- 不在共享工作区无所有权并行修改。
- 共享基础原语，分离产品语义。
