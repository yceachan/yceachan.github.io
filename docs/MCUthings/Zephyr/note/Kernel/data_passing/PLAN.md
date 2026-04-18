---
title: Kernel Data Passing Knowledge Base - TODO List
tags: [Zephyr, Kernel, IPC, Data Passing, TODO]
desc: 待完成的 Zephyr 数据传递相关知识库文档清单。
update: 2026-02-13
---

# Kernel Data Passing Knowledge Base - TODO List

该列表旨在完善 Zephyr 内核数据传递机制的知识体系，填补中断处理后的通信空白。

## High Priority (核心机制)

- [x] **02-Message_Queue.md** (`k_msgq`)
    - **目标**: 解析消息队列的工作原理与最佳实践。
    - **重要性**: 最常用的 IPC 机制，适用于线程间传值、ISR 向线程发送数据。
    - **关键点**:
        - 异步读写特性 (`k_msgq_put`, `k_msgq_get`)。
        - 内存管理 (Copy-by-Value vs Zero-Copy)。
        - 阻塞与超时机制。
        - 与 `k_poll` 的结合使用。

- [ ] **03-Mailbox.md** (`k_mbox`)
    - **目标**: 理解双向通信机制。
    - **重要性**: 适用于线程间的数据交换与同步。

## Medium Priority (辅助机制)

- [ ] **04-Pipe.md** (`k_pipe`)
    - **目标**: 流式数据传输。
    - **重要性**: 适用于字节流处理 (如 UART 数据流)。

- [ ] **05-Stack.md** (`k_stack`)
    - **目标**: 简单的 LIFO 数据结构。
    - **重要性**: 用于简单的逆序处理任务。

---

> [!TIP]
> **推荐路径**: 鉴于我们刚完成了 Input Subsystem (按键输入)，接下来的逻辑步骤是 **"如何将按键事件传递给其他线程处理"**。因此，**Message Queue** 是最迫切需要掌握的 IPC 机制。
