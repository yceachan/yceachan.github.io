---
title: Message Queues (消息队列)
tags: [Zephyr, Kernel, IPC, Data Passing, Message Queue]
desc: 解析 Zephyr 内核中消息队列 (k_msgq) 的工作原理、实现细节与最佳实践。
update: 2026-02-25
---

# Message Queues (消息队列)

> [!note]
> **Ref:** [Message Queues — Zephyr Project Documentation](https://docs.zephyrproject.org/latest/kernel/services/data_passing/message_queues.html)
> **Local Doc:** `$ZEPHYR_BASE/doc/kernel/services/data_passing/message_queues.rst`

Message Queue（消息队列）是一个内核对象，它实现了一个简单的消息队列，允许线程和 ISR 异步地发送和接收固定大小的数据项 (data items)。

## Concepts (概念)

可以定义任意数量的消息队列（仅受可用 RAM 的限制）。每个消息队列通过其内存地址进行引用。

消息队列具有以下关键属性：
* 一个 **环形缓冲区 (ring buffer)**，用于存放已发送但尚未被接收的数据项。
* **数据项大小 (data item size)**，以字节为单位。
* **最大数量 (maximum quantity)**，即环形缓冲区中可排队的数据项的上限。

消息队列在使用前必须进行初始化，这会将其环形缓冲区清空。

### 发送机制 (Sending)
线程或 ISR 可以向消息队列 **发送 (sent)** 数据项。
如果存在正在等待接收的线程，发送线程指向的数据项会被直接拷贝到该等待线程中；否则，如果环形缓冲区有可用空间，数据项将被拷贝到消息队列的环形缓冲区中。在这两种情况下，被发送的数据区域的大小 **必须** 等于消息队列配置的“数据项大小”。

如果线程试图在环形缓冲区已满时发送数据项，发送线程可以选择等待空间变为可用。
当环形缓冲区填满时，任意数量的发送线程可以同时处于等待状态；一旦空间可用，它会被分配给等待时间最长且优先级最高的发送线程。

### 接收机制 (Receiving)
线程可以从消息队列 **接收 (received)** 数据项。
数据项会被拷贝到接收线程指定的内存区域；接收区域的大小 **必须** 等于消息队列配置的“数据项大小”。

如果线程试图在环形缓冲区为空时接收数据项，接收线程可以选择等待数据项被发送。
当环形缓冲区为空时，任意数量的接收线程可以同时处于等待状态；一旦有数据项可用，它会被分配给等待时间最长且优先级最高的接收线程。

线程还可以对消息队列头部的消息进行 **窥探 (peek)**，而不将其从队列中移除。
数据项会被拷贝到接收线程指定的区域；接收区域的大小同样 **必须** 等于消息队列的数据项大小。

> [!note]
> * 内核允许 ISR 从消息队列接收数据项，但是如果消息队列为空，ISR 绝不能尝试等待。
> * 消息队列的环形缓冲区不需要对齐。底层实现使用了 `memcpy`（对齐无关），并且不暴露任何内部指针。

## Implementation (实现)

### 定义消息队列 (Defining a Message Queue)

使用 `k_msgq` 类型的变量定义消息队列，然后必须通过调用 `k_msgq_init` 进行初始化。

以下代码定义并初始化了一个空的消息队列，它能够容纳 10 个数据项，每个数据项长 12 字节：

```c
struct data_item_type {
    uint32_t field1;
    uint32_t field2;
    uint32_t field3;
};

char my_msgq_buffer[10 * sizeof(struct data_item_type)];
struct k_msgq my_msgq;

k_msgq_init(&my_msgq, my_msgq_buffer, sizeof(struct data_item_type), 10);
```

或者，可以在编译时通过调用宏 `K_MSGQ_DEFINE` 定义并初始化消息队列：

```c
K_MSGQ_DEFINE(my_msgq, sizeof(struct data_item_type), 10, 1);
```

### 写入消息队列 (Writing to a Message Queue)

通过调用 `k_msgq_put` 将数据项添加到消息队列中。

如果消费者处理不过来导致消息队列满了，生产者线程可以丢弃所有旧数据以便保存新数据。请注意，此 API 将触发重新调度 (reschedule)。

```c
void producer_thread(void)
{
    struct data_item_type data;

    while (1) {
        /* create data item to send (e.g. measurement, timestamp, ...) */
        data = ...

        /* send data to consumers */
        while (k_msgq_put(&my_msgq, &data, K_NO_WAIT) != 0) {
            /* message queue is full: purge old data & try again */
            k_msgq_purge(&my_msgq);
        }

        /* data item was successfully added to message queue */
    }
}
```

### 读取消息队列 (Reading from a Message Queue)

通过调用 `k_msgq_get` 从消息队列中获取数据项。
注意：应该测试 `k_msgq_get` 的返回值，因为 `k_msgq_purge` 可能会导致返回 `-ENOMSG`。

```c
void consumer_thread(void)
{
    struct data_item_type data;

    while (1) {
        /* get a data item */
        k_msgq_get(&my_msgq, &data, K_FOREVER);

        /* process data item */
        ...
    }
}
```

### 窥探消息队列 (Peeking into a Message Queue)

通过调用 `k_msgq_peek` 从消息队列中读取数据项。

```c
void consumer_thread(void)
{
    struct data_item_type data;

    while (1) {
        /* read a data item by peeking into the queue */
        k_msgq_peek(&my_msgq, &data);

        /* process data item */
        ...
    }
}
```

## Suggested Uses (建议用途)

使用消息队列在异步方式下的线程之间传输小型数据项 (small data items)。

> [!tip] Best Practices
> * **避免传输大型数据项**：虽然消息队列可用于传输大型数据项，但这会增加中断延迟 (interrupt latency)，因为在写入或读取数据项时会锁定中断。读写数据项的时间随其大小线性增加，因为整个数据项都被复制到内存缓冲区中，或者从中复制出来。因此，通常最好通过 **交换指向数据项的指针**（例如使用 FIFO/LIFO 或 Mailbox）来传输大型数据项，而不是直接传输数据项本身。
> * **同步传输**：可以通过使用内核的 **Mailbox (邮箱)** 对象类型来实现同步传输。

## Configuration Options (配置选项)

相关配置选项：
* 无 (None)

## API Reference (API 参考)

- [Message Queue APIs](https://docs.zephyrproject.org/latest/kernel/services/data_passing/message_queues.html#api-reference)

核心 API 包括：`k_msgq_init`, `K_MSGQ_DEFINE`, `k_msgq_put`, `k_msgq_get`, `k_msgq_peek`, `k_msgq_purge`。

## Related code samples (相关代码示例)

- [Message Queue](https://docs.zephyrproject.org/latest/samples/kernel/msg_queue/README.html): Implement a basic message queue producer/consumer thread pair.
  - **Local Sample Path:** `$ZEPHYR_BASE/samples/kernel/msg_queue`
