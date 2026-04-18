---
title: Interrupt Model (中断模型)
tags: [Zephyr, Kernel, ISR, Interrupts, Context]
desc: 详解 Zephyr 内核的中断处理机制、上下文管理与最佳实践
update: 2026-02-13
---

# Zephyr Kernel Interrupt Model

> [!note]
> **Ref:** [Interrupts](docs/kernel/services/interrupts.rst)

在 Zephyr 中，中断服务程序 (ISR) 是以极低开销响应硬件或软件事件的核心机制。ISR 异步执行，通常会抢占当前运行的线程。

## 1. 核心概念 (Core Concepts)

### ISR (Interrupt Service Routine)
- **异步性**: 响应硬件/软件中断信号。
- **抢占性**: 除非系统处于锁中断状态，ISR 会打断当前线程的执行。
- **上下文**: ISR 运行在专用的 **Interrupt Context** (中断上下文) 中，拥有独立的栈空间 (ISR Stack)。
  - **限制**: ISR 中 **严禁** 执行任何可能导致睡眠 (Sleep) 或阻塞 (Block) 的操作 (例如 `k_sleep`, `k_mutex_lock`, `k_sem_take` 带超时)。
  - **检测**: 使用 `k_is_in_isr()` API 可判断当前是否处于中断上下文。

### 优先级与嵌套 (Priority & Nesting)
- **优先级**: 硬件相关的优先级级别。
- **嵌套**: 支持中断嵌套。高优先级中断可以打断低优先级 ISR 的执行。
- **恢复**: 只有当所有 ISR 处理完毕，且无更高优先级线程就绪时，被中断的线程才会恢复执行 (可能会触发重新调度)。

## 2. 中断定义与注册 (Definition & Registration)

Zephyr 提供了多种方式来注册中断，以适应不同的性能和灵活性需求。

### 静态注册 (Static - `IRQ_CONNECT`)
最常用的方式，所有参数在**编译期**确定，开销最小。

```c
#define MY_DEV_IRQ  24
#define MY_DEV_PRIO  2
/* 参数必须在编译期已知 */
IRQ_CONNECT(MY_DEV_IRQ, MY_DEV_PRIO, my_isr, MY_ISR_ARG, 0);
irq_enable(MY_DEV_IRQ);
```

### 动态注册 (Dynamic - `irq_connect_dynamic`)
允许在**运行时**注册中断，适用于驱动程序需要根据配置动态分配中断号的场景。
- **依赖**: 需开启 `CONFIG_DYNAMIC_INTERRUPTS`。
- **开销**: 比静态注册稍大，且生成的代码量略增。

### 直接中断 (Direct ISR - `IRQ_DIRECT_CONNECT`)
为极低延迟需求设计 (Zero Latency)。
- **特点**: 跳过部分内核管理开销 (如软件 ISR 表查找)。
- **限制**: 
  - 必须使用 `ISR_DIRECT_DECLARE` 声明。
  - **不能** 调用大部分内核 API (除了极少数如 `k_busy_wait`)。
  - 亦常用于 **Zero Latency Interrupts** (`CONFIG_ZERO_LATENCY_IRQS`)，此类中断甚至无法被 `irq_lock()` 屏蔽。

## 3. 中断控制 (Control)

### 锁定中断 (Locking Interrupts)
线程可以使用 `irq_lock()` 暂时禁止所有中断 (Zero Latency 除外)，以保护临界区。
- **Key**: `irq_lock()` 返回一个 `unsigned int` key，用于 `irq_unlock()`。
- **Thread-Aware**: 锁是线程特有的。如果持有锁的线程被切换 (Suspend/Swap out)，新运行的线程如果不持有锁，中断会自动重新开启。当原线程切回时，中断会再次被锁定。

### 禁用特定中断 (Disabling Specific IRQ)
- `irq_disable(irq)` / `irq_enable(irq)`: 针对特定中断线进行屏蔽。

## 4. 中断卸载 (Offloading)

**原则**: ISR 应尽可能简短。
如果处理耗时较长，应将工作 "卸载" (Offload) 到线程上下文中执行，以保持系统响应性。

**常用机制**:
1.  **Signal Helper Thread**: ISR 释放信号量 (`k_sem_give`) 或写入数据到 FIFO/LIFO，唤醒一个专用的高优先级配合线程来处理数据。
2.  **System Workqueue**: ISR 提交一个工作项 (`k_work_submit`) 到系统工作队列。由系统工作队列线程 (System Workqueue Thread) 在后续调度中执行。

## 5. 多级中断 (Multi-level Interrupts)

支持级联中断控制器 (Nested Interrupt Controllers)。
通过 32 位中断号编码层级信息 (Level 1, Level 2, Level 3)，内核宏自动解析路由。需配置 `CONFIG_MULTI_LEVEL_INTERRUPTS`。

## 总结

| 特性 | 说明 |
| :--- | :--- |
| **上下文** | 独立栈，不可睡眠 |
| **注册** | 推荐 `IRQ_CONNECT` (静态)，特殊需求用 `IRQ_DIRECT_CONNECT` |
| **同步** | ISR 与线程间通信只能用非阻塞 API (如 `k_sem_give`, `k_msgq_put`) |
| **保护** | 线程可用 `irq_lock()` 保护临界区，ISR 可用 `k_spin_lock()` |
