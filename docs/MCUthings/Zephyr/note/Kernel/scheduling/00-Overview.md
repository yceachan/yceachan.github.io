---
title: Zephyr 线程调度机制概览
tags: [Zephyr, Kernel, Scheduling, Overview]
desc: 介绍 Zephyr 内核的优先级调度、时间片、就绪队列实现及相关 API。
update: 2026-02-12
---

# Zephyr 线程调度机制概览

> [!note]
> **Ref:** `$ZEPHYR_BASE/doc/kernel/services/scheduling/index.rst`

Zephyr 内核采用基于优先级的调度器，允许应用程序线程共享 CPU 资源。

## 1. 核心概念

### 当前线程 (Current Thread)
在任何给定时间点，调度器允许执行的线程被称为“当前线程”。

### 重新调度点 (Reschedule Points)
调度器有机会更换当前线程的时机，称为“重新调度点”。常见的调度点包括：
*   **状态转换**：线程从运行态进入挂起或等待态（如调用 `k_sem_take` 或 `k_sleep`）。
*   **就绪触发**：新线程进入就绪态（如调用 `k_sem_give` 或 `k_thread_start`）。
*   **中断返回**：处理完中断后返回线程上下文。
*   **主动让出**：运行线程调用 `k_yield`。

## 2. 调度算法 (Scheduling Algorithm)

调度器总是选择 **优先级最高** 的就绪线程。当存在多个同优先级线程时，遵循 **FIFO (先进先出)** 原则，即选择等待时间最长的线程。

### 截止时间优先 (EDF)
如果启用了 `CONFIG_SCHED_DEADLINE`，且两个线程静态优先级相同，则 **截止时间 (Deadline)** 更早的线程具有更高优先级。可以使用 `k_thread_deadline_set` API 设置。

### 就绪队列 (Ready Queue) 实现
内核提供三种后端数据结构，通过 Kconfig 配置：
1.  **简单链表 (`CONFIG_SCHED_SIMPLE`)**：代码体积最小，适用于线程极少（≤ 3个）的系统。
2.  **红黑树 (`CONFIG_SCHED_SCALABLE`)**：具有良好的可扩展性，适用于拥有成百上千个线程的复杂系统。
3.  **传统多级队列 (`CONFIG_SCHED_MULTIQ`)**：每个优先级一个链表，O(1) 时间复杂度，但 RAM 占用较大，不支持 EDF。

## 3. 协作式与抢占式时间片

### 协作式时间片 (Cooperative Time Slicing)
*   **线程类型**：优先级为负值的线程。
*   **行为**：一旦运行，除非主动让出（`k_yield`, `k_sleep`）或进入阻塞态，否则将一直独占 CPU。

### 抢占式时间片 (Preemptive Time Slicing)
*   **线程类型**：优先级为非负值 (≥ 0) 的线程。
*   **行为**：会被更高优先级的线程抢占。
*   **时间片轮转 (`CONFIG_TIMESLICING`)**：通过系统 Tick 测量，当时间片耗尽且存在同优先级就绪线程时，内核隐式执行 `k_yield` 实现轮转。

## 4. 关键 API 概览

| API | 功能类型 | 描述 |
| :--- | :--- | :--- |
| `k_yield()` | 调度控制 | 主动放弃 CPU，移至就绪队列末尾。 |
| `k_sched_lock()` | 调度控制 | 锁定调度器，禁止其他线程抢占（不影响 ISR）。 |
| `k_sched_unlock()` | 调度控制 | 解锁调度器，恢复正常抢占。 |
| `k_sleep(timeout)` | 线程状态 | 释放 CPU 并睡眠指定时间。 |
| `k_wakeup(thread)` | 线程状态 | 提前唤醒处于睡眠状态的线程。 |
| `k_busy_wait(usec)` | 计时延迟 | **不释放 CPU**，通过空循环实现微秒级延迟。 |
| `k_cpu_idle()` | 电源管理 | 使 CPU 进入低功耗空闲态，直到下个中断。 |
| `k_cpu_atomic_idle()` | 电源管理 | 原子地锁定中断并进入空闲态，防止竞争条件。 |

## 5. 设计建议
*   **协作式线程**：建议用于设备驱动程序和其他性能关键型任务，或实现简单的互斥访问。
*   **抢占式线程**：建议用于处理时间敏感度不同的多任务流。
*   **忙等待**：仅用于延迟极短（不足以覆盖上下文切换开销）的场景。
