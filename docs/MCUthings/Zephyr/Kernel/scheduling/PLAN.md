---
title: Kernel Scheduling Knowledge Base - TODO List
tags: [Zephyr, Kernel, Scheduling, TODO]
desc: 待完成的 Zephyr 调度相关知识库文档清单，按优先级排序。
update: 2026-02-12
---

# Kernel Scheduling Knowledge Base - TODO List

该列表旨在完善 Zephyr 内核调度机制的知识拼图，确保开发者能够全面理解线程管理、中断优先级以及多核调度等核心概念。

## High Priority (核心机制)

- [x] **04-Workqueue机制.md**
    - **目标**: 解析系统工作队列 (System Workqueue) 的工作原理。
    - **内容要点**:
        - 为什么使用工作队列而不是创建新线程？
        - 工作队列本质上是一个高优先级的协作式线程。
        - 如何提交工作项 (`k_work_submit`) 以及延迟工作项 (`k_work_schedule`)。
        - 避免在工作队列中执行阻塞操作的重要性。
    - **关联**: 中断处理、驱动回调、异步任务。

- [x] **05-中断与线程优先级全景.md**
    - **目标**: 梳理从硬件中断到空闲线程的完整优先级阶梯。
    - **内容要点**:
        - `Zero Latency Interrupts` (零延迟中断) vs 常规中断。
        - `MetaIRQ` (元中断线程) 的特殊地位。
        - `Cooperative Threads` (协作式) vs `Preemptive Threads` (抢占式)。
        - `Idle Thread` (空闲线程) 与电源管理的联系。
    - **图表**: 完整的优先级金字塔图。

## Medium Priority (高级特性)

- [x] **06-SMP调度特性.md**
    - **目标**: 理解多核 (SMP) 环境下的调度行为。
    - **内容要点**:
        - CPU 亲和性 (Affinity) 与 `k_thread_cpu_pin`。
        - 调度器如何在多个 CPU 核心之间迁移线程。
        - 跨核同步与锁机制 (Spinlocks)。

- [x] **07-Idle线程与低功耗.md**
    - **目标**: 深入理解空闲线程的作用及其与电源管理的结合。
    - **内容要点**:
        - 当 Ready Queue 为空时，CPU 执行什么？
        - 空闲钩子函数 (`k_thread_idle_entry`)。
        - 如何通过空闲线程触发 Deep Sleep 模式。

## Low Priority (补充知识)

- [ ] **08-自定义调度器.md**
    - **目标**: 探索 Zephyr 调度器的可扩展性。
    - **内容要点**:
        - 如何替换默认调度算法 (如 EDF)。
        - 调度器钩子函数的使用。

---

> [!TIP]
> **执行建议**: 请开发者根据当前项目需求，指示 Agent 逐步完成上述文档。建议优先完成 **High Priority** 部分。
