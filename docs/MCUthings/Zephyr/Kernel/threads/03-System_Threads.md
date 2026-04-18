---
title: System Threads
tags: [Zephyr, Kernel, Threads, System]
desc: Abstract of Zephyr System Threads documentation
update: 2026-02-13
---

# System Threads

> [!note]
> **Ref:** [System Threads](https://docs.zephyrproject.org/latest/kernel/services/threads/system_threads.html)

## 核心系统线程

### 1. Main Thread (主线程)
- **功能**: 执行内核初始化，随后调用应用程序提供的 `main()` 函数。
- **优先级**:
  - 默认配置下，为最高优先级的 **Preemptible** 线程 (优先级 0)。
  - 若不支持抢占式线程，则为最低优先级的 **Cooperative** 线程 (优先级 -1)。
- **特性**: 是所谓的 "Essential" 线程。如果 `main()` 函数异常中止 (abort)，内核将触发致命系统错误 (Fatal System Error)。

### 2. Idle Thread (空闲线程)
- **功能**: 当系统内没有其他就绪线程时运行。
- **任务**: 
  - 负责处理空闲状态，通常用于触发系统的电源管理 (Power Management) 机制以节省能耗。
  - 仅在被中断 (Interrupt) 或外部事件唤醒时让出 CPU。
- **优先级**: 始终为系统配置的最低优先级。
- **特性**: 同样是 "Essential" 线程，异常中止会导致致命系统错误。

## 其他系统线程

根据内核和板级配置，系统可能还会生成其他线程，例如：
- **System Workqueue Thread**: 用于处理系统级的工作队列任务。

## 总结

| 线程类型 | 关键职责 | 优先级特征 | 异常后果 |
| :--- | :--- | :--- | :--- |
| **Main** | 初始化 & `main()` | 默认最高可抢占 (0) | Fatal Error |
| **Idle** | 空闲处理 & 低功耗 | 始终最低 | Fatal Error |

这些线程是 Zephyr 运行时的基石，确保了从启动到空闲循环的完整生命周期管理。
