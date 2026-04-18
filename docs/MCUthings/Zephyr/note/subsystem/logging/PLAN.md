---
title: Logging (日志子系统) 深度剖析 - TODO List
tags: [Zephyr, Subsystem, Logging, UART, Data Passing, TODO]
desc: 规划对 Zephyr 日志子系统底层实现机制的深度走读与源码级剖析。
update: 2026-02-25
---

# Logging Subsystem Deep Dive - TODO List

该列表旨在指引对 Zephyr Logging 子系统的源码级剖析，核心聚焦于应用层日志是如何一步步穿透 OS 层，最终通过 UART 硬件发送出去的完整生命周期。

## 剖析路线图 (Deep Dive Plan)

- [ ] **01-Log_Data_Passing.md** (App 层 Log 到 UART TX 的数据流转)
    - **目标**: 追踪 `LOG_INF()` 宏调用后的完整数据通路 (Data Passing)。
    - **关键点**:
        - `LOG_INF()` 宏展开后的前端 (Frontend) 实现 (`log_msg` 结构)。
        - 延迟模式 (Deferred Mode) 下的 Ring Buffer / Message Queue 机制。
        - 后端 (Backend) 接口：`log_backend_uart` 的注册与挂载。
        - 格式化 (Formatting)：字符串处理与时间戳插入发生的时机。

- [x] **02-UART_Device_Model_and_DTS.md** (串口设备的 DTS 驱动与设备模型)
    - **目标**: 解析日志底层依赖的 UART 设备是如何被 Zephyr 设备模型初始化的。
    - **关键点**:
        - `chosen` 节点中的 `zephyr,console` 是如何与具体的 UART 节点绑定的。
        - UART 驱动实例的宏展开 (`DEVICE_DT_DEFINE`) 与初始化优先级 (`INIT_LEVEL`)。
        - `uart_poll_out()` 或中断驱动 TX 的底层驱动实现接口 (`uart_driver_api`)。
        - 从 Log Backend 调用到底层 UART API 的边界点。

- [x] **03-Log_Thread_Internals.md** (Log 线程的调度与内部细节)
    - **目标**: 深入研究负责异步日志处理的后台专职线程。
    - **关键点**:
        - `log_thread` 的创建：优先级、栈大小配置 (`CONFIG_LOG_THREAD_PRIO` / `CONFIG_LOG_THREAD_STACK_SIZE`)。
        - 线程的核心循环：如何被唤醒 (Wakeup)？(例如 `k_sem_take` 结合 `k_poll`)。
        - 批量处理与流控策略：当日志产生的速度大于 UART 吞吐量时，如何处理 Drop (丢弃) 逻辑。
        - Idle 线程在 Log 机制中的特殊作用（在某些配置下）。

---

> [!TIP]
> **后续行动**:
> 这三篇文档将构成一个完整的从上到下 (Top-Down) 的系统级视野。我们可以先从 **01-Log_Data_Passing.md** 开始，利用 `grep_search` 追踪 `$ZEPHYR_BASE/subsys/logging/` 和 `log_core.c` 中的关键函数。
