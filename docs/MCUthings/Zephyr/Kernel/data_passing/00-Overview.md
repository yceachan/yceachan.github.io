---
title: Data Passing Overview (数据传递全景)
tags: [Zephyr, Kernel, IPC, Data Passing, Synchronization]
desc: Zephyr 内核数据传递机制的横向对比与选型指南
update: 2026-02-13
---

# Data Passing Overview (数据传递全景)

> [!note]
> **Ref:** [Zephyr Kernel Services - Data Passing](https://docs.zephyrproject.org/latest/kernel/services/data_passing/index.html)

Zephyr 提供了丰富的 **IPC (Inter-Process Communication)** 机制，用于在线程 (Thread) 与线程之间、ISR 与线程之间安全地传递数据。选择合适的机制对于系统的性能（内存占用、上下文切换开销）和实时性至关重要。

## 1. 机制对比矩阵 (Comparison Matrix)

| 机制 (Mechanism) | 数据类型 (Data Type) | 内存模型 (Memory Model) | ISR 安全性 | 多对多支持 | 典型用途 (Typical Use Case) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FIFO / LIFO** | `void *` (指针) | **Zero-Copy** (传递指针) | ✅ Put/Get | ✅ | 任务队列、简单的对象传递 |
| **Message Queue** | 固定大小数据块 | **Copy-by-Value** (值拷贝) | ✅ Put/Get | ✅ | 传感器数据、事件消息、ISR 到线程的缓冲 |
| **Stack** | `uintptr_t` (整型) | **Copy-by-Value** | ✅ Push/Pop | ✅ | 简单的 LIFO 数据存储 |
| **Pipe** | 字节流 (Byte Stream) | **Copy-by-Value** | ✅ Put/Get | ❌ (1-to-1) | 串口数据流、变长数据包 |
| **Mailbox** | 消息结构体 | **Zero-Copy** (指针交换) | ✅ Send | ✅ | 线程间复杂的同步数据交换 |

## 2. 选型指南 (Selection Guide)

### 2.1 简单数据传输 (Simple Data Transfer)
*   **ISR -> Thread (缓冲)**: 首选 **Message Queue (`k_msgq`)**。
    *   *理由*: 能够缓冲突发数据（例如 ADC 采样），避免数据丢失。ISR 可以非阻塞地写入，线程阻塞读取。
    *   *注意*: 数据块应较小（如 `struct sensor_data`），避免在 ISR 中进行大量内存拷贝。

*   **Thread -> Thread (指针传递)**: 首选 **FIFO (`k_fifo`)**。
    *   *理由*: 零拷贝，效率极高。发送方只需将数据对象的指针放入队列。
    *   *注意*: 需要自行管理数据对象的内存生命周期（通常配合 Memory Slab 使用）。

### 2.2 流式数据 (Stream Data)
*   **UART/Network Stream**: 首选 **Pipe (`k_pipe`)**。
    *   *理由*: 允许读写任意长度的字节，内核自动处理环形缓冲。
    *   *场景*: 解析不定长的协议帧。

### 2.3 复杂同步 (Complex Synchronization)
*   **握手与交换**: 使用 **Mailbox (`k_mbox`)**。
    *   *理由*: 支持同步发送（发送方等待接收方确认）。虽然开销较大，但提供了可靠的线程间同步点。

## 3. 核心机制详解

### 3.1 FIFO / LIFO
最基础的队列，仅传输 4 字节（32位系统）或 8 字节（64位系统）的指针。
- **优点**: 极简，无内存拷贝开销。
- **缺点**: 无法传输具体数据内容，接收方需知道指针指向的数据结构。
- **数据结构要求**: 被传输的数据结构必须预留前 4/8 字节用于内核链表节点 (`sys_snode_t`)，这被称为 **Intrusive Data Structure (侵入式数据结构)**。

### 3.2 Message Queue (`k_msgq`)
环形缓冲区 (Ring Buffer)，传输定长数据。
- **优点**: 
    - **非侵入式**: 不需要修改数据结构。
    - **缓冲**: 发送方和接收方解耦，适合突发流量。
    - **Copy**: 数据被复制到内核管理的缓冲区，发送方随后可以修改原数据而无副作用。
- **缺点**: 内存拷贝消耗 CPU 周期，且在拷贝期间会关中断。

### 3.3 Pipe (`k_pipe`)
字节流管道。
- **特性**: 
    - 类似于 Unix 的 Pipe。
    - 支持全满写/全空读，也支持部分读写。
    - 只能有一个读取者和一个写入者（Point-to-Point）。

## 4. 高级模式：配合 `k_poll`

所有上述机制（除了 Stack）都支持 **Polling API (`k_poll`)**。
这意味着一个线程可以同时等待：
1.  Message Queue 有数据。
2.  FIFO 有数据。
3.  Semaphore 被释放。
4.  Signal 被触发。

这种 **Event-Driven (事件驱动)** 的模式是构建复杂、高响应性 Zephyr 应用的核心。

## 总结
*   **通用推荐**: 从 **Message Queue** 开始。它最直观，易于使用，且覆盖了 80% 的嵌入式通信需求。
*   **性能优化**: 当数据量大且频繁时，切换到 **FIFO + Memory Slab** (零拷贝) 模式。
