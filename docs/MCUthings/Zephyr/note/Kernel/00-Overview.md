---
title: Kernel Services Overview
tags: [Zephyr, Kernel, Overview]
update: 2026-02-10
---

# Kernel Services (内核服务)

Zephyr 内核 (Kernel) 是整个应用的核心，提供了一个低内存占用、高性能、多线程的执行环境。Zephyr 的其他部分（如驱动、网络协议栈、应用代码）都依赖内核功能来构建完整的应用。

Zephyr 内核高度可配置，支持从资源受限的简单传感器节点（小至 2KB 内存）到复杂的物联网网关（数百 KB 内存、Wi-Fi/蓝牙、复杂多线程）等各种应用场景。

主要服务包括以下几大类：

## 1. 调度、中断与同步 (Scheduling, Interrupts, and Synchronization)

这一部分涵盖了内核的基础服务，用于管理代码的执行顺序和并发控制。

*   **Threads (线程)**: 内核调度的基本单元。支持协作式 (Cooperative) 和抢占式 (Preemptive) 线程。
*   **Scheduling (调度)**: 决定哪个线程在何时运行。
*   **Interrupts (中断)**: 响应硬件事件的机制，具有比线程更高的优先级。
*   **Polling (轮询)**: 等待多个内核对象（如信号量、FIFO）变为就绪状态的机制。
*   **Synchronization (同步原语)**:
    *   **Semaphores (信号量)**: 用于控制对资源的访问或线程间的同步。
    *   **Mutexes (互斥锁)**: 用于保护共享资源，防止并发访问冲突，支持优先级继承。
    *   **Condition Variables (条件变量)**: 允许线程等待特定条件满足。
    *   **Events (事件)**: 用于线程间的信号通知。

## 2. 数据传递 (Data Passing)

内核提供了多种对象，用于在线程之间以及线程与中断服务程序 (ISR) 之间传递数据。

| 对象 (Object) | 描述 | ISR 可用性 |
| :--- | :--- | :--- |
| **FIFO** | 先进先出队列 (First In, First Out)。 | 发送: Yes, 接收: Yes (仅限非阻塞) |
| **LIFO** | 后进先出队列 (Last In, First Out)。 | 发送: Yes, 接收: Yes (仅限非阻塞) |
| **Stack** | 栈。 | 发送: Yes, 接收: Yes (仅限非阻塞) |
| **Message Queue** | 消息队列。基于环形缓冲区，支持固定大小的数据项。 | 发送: Yes, 接收: Yes (仅限非阻塞) |
| **Mailbox** | 邮箱。支持双向数据交换。 | 发送: No, 接收: No |
| **Pipe** | 管道。基于环形缓冲区，支持任意大小的数据流。 | 发送/接收: Yes (仅限非阻塞) |

## 3. 定时服务 (Timing)

*   **Clocks (时钟)**: 提供系统运行时间、正常运行时间 (Uptime) 和 硬件周期计数。
*   **Timers (定时器)**: 提供基于时间的事件通知，支持单次触发和周期性触发。

## 4. 内存管理 (Memory Management)

Zephyr 提供了一套内存管理 API，支持动态内存分配、内存池等机制，以适应不同内存需求的应用。

## 5. 其他服务 (Other)

*   **Atomic Operations (原子操作)**: 保证操作的不可分割性，用于多核或中断环境下的数据安全。
*   **Floating Point (浮点运算)**: 对浮点单元 (FPU) 的支持和上下文管理。
*   **Fatal Error Handling (致命错误处理)**: 系统异常或崩溃时的处理机制。
*   **Thread Local Storage (线程局部存储)**: 允许线程拥有独立的全局变量副本。

---
*参考文档: [`sdk/source/zephyr/doc/kernel/services/index.rst`](../../sdk/source/zephyr/doc/kernel/services/index.rst)*
