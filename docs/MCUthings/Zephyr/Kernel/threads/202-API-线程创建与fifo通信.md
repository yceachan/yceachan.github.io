---
title: 线程创建与 FIFO 通信 API 参考 (Thread Creation & FIFO API Reference)
tags: [Zephyr, Kernel, Thread, FIFO, API]
desc: Zephyr 内核线程创建 (Thread Creation) 与 FIFO 消息队列 (FIFO Message Queue) 常用 API 参考手册，包含 Doxygen 风格注释。
update: 2026-02-12
---

# 线程创建与 FIFO 通信 API 参考 (Thread Creation & FIFO API Reference)

> [!note]
> **Ref:** 
> *   [Zephyr Thread APIs](https://docs.zephyrproject.org/latest/kernel/services/threads/index.html)
> *   [Zephyr FIFO APIs](https://docs.zephyrproject.org/latest/kernel/services/data_passing/fifos.html)

## 线程创建 (Thread Creation)

### `K_THREAD_DEFINE`

静态定义并自动启动一个线程。

```c
/**
 * @brief Statically define and initialize a thread.
 *
 * The thread may be scheduled for immediate execution or a delayed start.
 *
 * Thread options are architecture-specific, and can include K_ESSENTIAL,
 * K_FP_REGS, and K_SSE_REGS. Multiple options may be specified by separating
 * them using "|" (the logical OR operator).
 *
 * The id of the thread can be accessed using:
 * @code extern const k_tid_t <name>; @endcode
 *
 * @param name Name of the thread.
 * @param stack_size Stack size in bytes.
 * @param entry Thread entry function.
 * @param p1 1st entry point parameter.
 * @param p2 2nd entry point parameter.
 * @param p3 3rd entry point parameter.
 * @param prio Thread priority.
 * @param options Thread options.
 * @param delay Scheduling delay (if any).
 */
#define K_THREAD_DEFINE(name, stack_size, entry, p1, p2, p3, prio, options, delay)
```

## FIFO 消息队列 (FIFO Message Queue)

### `K_FIFO_DEFINE`

静态定义并初始化一个 FIFO 队列。

```c
/**
 * @brief Statically define and initialize a FIFO queue.
 *
 * The queue can be accessed outside the module where it is defined using:
 * @code extern struct k_fifo <name>; @endcode
 *
 * @param name Name of the FIFO.
 */
#define K_FIFO_DEFINE(name)
```

### `k_fifo_put`

向 FIFO 队列添加数据项 (入队)。

```c
/**
 * @brief Add an element to a FIFO queue.
 *
 * This routine adds a data item to @a fifo. A FIFO data item must be
 * aligned on a word boundary, and the first word of the item is reserved
 * for the kernel's use.
 *
 * @note Can be called by ISRs.
 *
 * @param fifo Address of the FIFO.
 * @param data Address of the data item.
 *
 * @return void
 */
void k_fifo_put(struct k_fifo *fifo, void *data);
```

### `k_fifo_get`

从 FIFO 队列获取数据项 (出队)。

```c
/**
 * @brief Get an element from a FIFO queue.
 *
 * This routine removes a data item from @a fifo in a "first in, first out"
 * manner. The first word of the data item is reserved for the kernel's use.
 *
 * @note Can be called by ISRs, but @a timeout must be set to K_NO_WAIT.
 *
 * @param fifo Address of the FIFO.
 * @param timeout Waiting period to obtain a data item,
 *                or one of the convenience macros like K_NO_WAIT.
 *
 * @return Address of the data item if successful; NULL if returned without
 *         waiting, or waiting period timed out.
 */
void *k_fifo_get(struct k_fifo *fifo, k_timeout_t timeout);
```

### 数据结构要求 (Data Structure Requirements)

FIFO 数据项必须满足特定的内存布局要求：

```c
struct my_fifo_data {
    void *fifo_reserved; /* 1st word reserved for use by kernel (linked list pointer) */
    /* ... application data ... */
    uint32_t value;
    char message[32];
};
```
