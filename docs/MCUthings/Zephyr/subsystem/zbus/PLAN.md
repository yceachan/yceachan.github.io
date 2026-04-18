---
title: zbus (Zephyr Bus) 知识库 - TODO List
tags: [Zephyr, Subsystem, zbus, IPC, Publish-Subscribe, TODO]
desc: 待完成的 Zephyr 总线 (zbus) 组件相关知识库文档清单。
update: 2026-02-25
---

# zbus (Zephyr Bus) Knowledge Base - TODO List

该列表旨在系统性梳理和学习 Zephyr 提供的轻量级软件总线机制 `zbus`，掌握其实现点对多/多对多通信与解耦架构的最佳实践。

## Core Concepts (核心概念)

- [x] **01-Overview.md** (`zbus` 概述)
    - **目标**: 宏观理解 `zbus` 的设计哲学、架构拓扑以及它在 Zephyr IPC 中的定位。
    - **关键点**:
        - 通道 (Channels) 与观察者 (Observers) 范式。
        - 虚拟分布式事件调度器 (VDED - Virtual Distributed Event Dispatcher) 概念。
        - 同步 vs 异步通信的结合。
        - 对比传统的 MsgQ, Mailbox 等 IPC 机制的区别与优势。

- [x] **02-Observer_Types_and_Usage.md** (四种观察者模型对比)
    - **目标**: 深入分析 `zbus` 提供的四种订阅机制，并明确其适用场景。
    - **关键点**:
        - **Listeners (监听器)**: 线程/ISR上下文同步执行的回调，极快零拷贝。
        - **Async Listeners (异步监听器)**: 工作队列上下文执行的异步回调，深拷贝缓冲。
        - **Subscribers (订阅者)**: 接收通道引用 (Reference) 的异步通知线程，节省内存但可能丢失中间状态。
        - **Message Subscribers (消息订阅者)**: 接收完整消息副本 (Copy) 的异步线程，典型的 Pub/Sub 模式，依赖内存池。

## Advanced Mechanisms (进阶机制)

- [x] **02-Zbus_Internals.md** (zbus 内部实现深度剖析)
    - **目标**: 深入剖析 Zephyr zbus 消息总线的底层实现：包含宏静态分配、观察者遍历唤醒机制，以及不同类型观察者的源码路径。
    - **关键点**:
        - `ZBUS_CHAN_DEFINE` 宏底层的静态内存分配机制。
        - `zbus_chan_pub` 时的观察者（Observer）遍历与唤醒流程。
        - `Listener` (同步) 与 `Subscriber` (异步) 的上下文区别及源码路径。

- [ ] **03-Channel_State_and_Lifecycle.md** (通道状态与生命周期管理)
    - **目标**: 掌握通道的高级特性与底层操作。
    - **关键点**:
        - `k_msgq` 在 `zbus` 内部的封装。
        - `claim` (独占/声明) 与 `finish` (释放) 机制，如何保证多线程/ISR 读写时的一致性。
        - 动态附加与分离观察者 (Dynamic attachment).

## Implementation & Examples (实战与应用)

- [ ] **04-Best_Practices_and_Pitfalls.md** (最佳实践与常见避坑)
    - **目标**: 在实际架构设计中如何优雅地使用 `zbus`。
    - **关键点**:
        - 避免循环发布 (Cyclic Publishing) 导致系统崩溃。
        - ISR (中断服务程序) 中发布/观察的最佳策略。
        - `zbus` 与电源管理 (Power Management) 的交互。

- [x] **05-Code_Dive_Hello_World.md** (从示例代码剖析 `zbus`)
    - **目标**: 通过代码级走读理解初始化、发布、订阅全过程。
    - **关键点**:
        - 解析 `samples/subsys/zbus/hello_world` 和 `samples/subsys/zbus/msg_subscriber` 示例。
        - 宏定义（如 `ZBUS_CHAN_DEFINE`, `ZBUS_LISTENER_DEFINE` 等）背后的实现。

---

> [!TIP]
> **推荐学习路径**: 建议先从 **01-Overview** 理解宏观架构和 `VDED`，随后重点攻克 **02-Observer_Types_and_Usage**，这是实际开发中使用 `zbus` 编写业务解耦代码的核心。
