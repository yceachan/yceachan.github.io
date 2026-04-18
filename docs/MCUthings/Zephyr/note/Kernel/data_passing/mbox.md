---
title: Mailboxes (内核数据传递机制)
tags: [Zephyr, Kernel, Data Passing, Mailbox] 
desc: Zephyr 内核 Mailboxes 机制学习笔记，基于官方 Data Passing 文档。
update: 2026-02-25
---


# Mailboxes

> [!note]
> **Ref:** 
>
> - [wiki](https://docs.zephyrproject.org/latest/kernel/services/data_passing/mailboxes.html)
> - 本地文档: `zephyr/doc/kernel/services/data_passing/mailboxes.rst`

邮箱（Mailbox）是一个内核对象，它提供了比传统消息队列更强大的增强型消息队列功能。邮箱允许线程同步或异步地发送和接收任意大小的消息。

## 1. Concepts (概念)

可以定义任意数量的邮箱（仅受可用 RAM 的限制）。每个邮箱通过其内存地址进行引用。

邮箱具有以下两个关键属性：
*   **发送队列 (send queue)**：存放已发送但尚未被接收的消息。
*   **接收队列 (receive queue)**：存放等待接收消息的线程。

邮箱在使用前必须被初始化。初始化会将它的两个队列设为空。邮箱允许线程之间交换消息，但不允许 ISR (中断服务程序) 参与。发送消息的线程称为**发送线程**，接收消息的线程称为**接收线程**。
每条消息只能被一个线程接收（不支持点对多点和广播通信）。邮箱中交换的消息是非匿名的，允许参与交换的两个线程知道（甚至指定）对方的身份。

### 1.1 Message Format (消息格式)

*   **消息描述符 (message descriptor)**：一种数据结构，用于指定消息数据所在的位置，以及邮箱应如何处理该消息。发送线程和接收线程在访问邮箱时都需要提供消息描述符。邮箱利用它在匹配的收发线程间进行消息交换，并会在交换过程中更新其中的某些字段，让双方了解发生的情况。
*   **消息数据 (message data)**：包含零个或多个字节的数据。其大小和格式由应用程序定义。
*   **消息缓冲区 (message buffer)**：由收/发线程提供的内存区域，用于存放消息数据。通常可以使用数组或结构体变量。
*   **空消息 (empty message)**：既没有数据，也没有消息缓冲区指针的消息。（注意：如果缓冲区存在，但数据大小为 0，这不算是“空消息”）。

### 1.2 Message Lifecycle (消息生命周期)

消息的生命周期非常简单：
1.  **创建**：发送线程将消息交给邮箱时创建。
2.  **持有**：在移交给接收线程前，消息归邮箱所有。
3.  **提取与删除**：接收线程可以在接收消息时立即检索数据，也可以在后续的第二次邮箱操作中再检索数据。**只有当数据检索发生后，邮箱才会删除该消息。**

### 1.3 Thread Compatibility (线程兼容性)

*   发送线程可以指定消息的接收线程地址，或使用 `K_ANY` 发送给任何线程。
*   接收线程可以指定消息的来源线程地址，或使用 `K_ANY` 接收任何线程的消息。
*   只有当发送线程和接收线程的要求同时满足时，消息才会发生交换。此时，这些线程被称为是**兼容的 (compatible)**。

### 1.4 Message Flow Control (消息流控)

邮箱消息可以**同步**或**异步**交换，具体由发送线程决定：
*   **同步交换**：发送线程阻塞，直到消息被接收线程完全处理。这提供了**隐式流控**，防止发送线程生成消息的速度超过接收方的消费速度。
*   **异步交换**：发送线程不等待消息被接收即可继续执行（可以去准备下一条消息）。它提供**显式流控**，允许发送线程通过信号量确认先前发送的消息是否仍存在。

---

## 2. Implementation (实现)

### 2.1 Defining a Mailbox (定义邮箱)

使用 `struct k_mbox` 类型的变量来定义邮箱，并在运行时使用 `k_mbox_init` 初始化：
```c
struct k_mbox my_mailbox;
k_mbox_init(&my_mailbox);
```
或者在编译时使用宏 `K_MBOX_DEFINE` 进行定义和初始化：
```c
K_MBOX_DEFINE(my_mailbox);
```

### 2.2 Message Descriptors (消息描述符)

消息描述符是 `struct k_mbox_msg` 类型的结构体。应用程序仅应使用以下字段：
*   `info`: 32位应用程序定义值。双向交换，允许发送者传值给接收者，在同步模式下也允许接收者回传值给发送者。
*   `size`: 消息数据的大小（字节）。发送时，为空消息填0；接收时，填期望的最大数据量，或填0表示不想要数据。接收后，邮箱会更新为实际交换的字节数。
*   `tx_data`: 指向发送方缓冲区的指针。发送空消息时填 `NULL`；接收时保持未初始化。
*   `tx_target_thread`: 期望的接收线程地址。可填 `K_ANY`。邮箱在消息被接收后更新为实际接收者的地址。
*   `rx_source_thread`: 期望的发送线程地址。可填 `K_ANY`。邮箱在放入消息时更新为实际发送者的地址。

### 2.3 Sending a Message (发送消息)

发送线程先准备数据，然后创建消息描述符，最后调用发送 API。如果当前有兼容的接收线程等待，消息直接移交；否则，加入发送队列。发送队列按发送线程的优先级进行排序（同优先级按最旧优先）。

*   **同步发送**：操作在接收线程收到消息并检索完数据后才完成。若超时，消息从队列移除并返回失败。成功后，发送方可查看描述符获取交换细节。*(注意：一旦消息被接收，接收线程取数据耗时是没有限制的，发送线程可能会被一直阻塞。)*
*   **异步发送**：操作立即完成。发送线程可指定一个信号量，当消息被邮箱删除（被接收且数据被取走）时给出该信号量，用于实现显式流控。*(注意：异步发送无法获取接收者身份和回传信息。)*

#### 2.3.1 Sending an Empty Message (发送空消息)
用于仅交换 32-bit `info` 值的场景：
```c
send_msg.info = random_value;
send_msg.size = 0;
send_msg.tx_data = NULL;
send_msg.tx_target_thread = K_ANY;
k_mbox_put(&my_mailbox, &send_msg, K_FOREVER);
```

#### 2.3.2 Sending Data Using a Message Buffer (使用缓冲区发送数据)
用于常规数据交换：
```c
send_msg.info = buffer_bytes_used;
send_msg.size = buffer_bytes_used;
send_msg.tx_data = buffer;
send_msg.tx_target_thread = K_ANY;
k_mbox_put(&my_mailbox, &send_msg, K_FOREVER);
```

### 2.4 Receiving a Message (接收消息)

接收线程创建描述符并调用接收 API。邮箱扫描发送队列，提取第一个兼容线程的消息。若无兼容线程，可选择等待。多个等待的接收线程按优先级排序。
*(注意：由于兼容性约束，接收不一定严格遵循 FIFO 顺序。)*

接收线程可以控制提取多少数据以及存放在何处。

#### 2.4.1 Retrieving Data at Receive Time (接收时检索数据)
最直接的方式，接收时指定缓冲区及其大小。
邮箱会立刻将数据拷贝到缓冲区中，并更新描述符中的实际拷贝量。如果缓冲区不足，多余数据丢失。
```c
recv_msg.info = 100;
recv_msg.size = 100;
recv_msg.rx_source_thread = K_ANY;
k_mbox_get(&my_mailbox, &recv_msg, buffer, K_FOREVER);
```

#### 2.4.2 Retrieving Data Later Using a Message Buffer (延后使用缓冲区检索数据)
接收线程希望稍后检索数据，可在调用接收时传入缓冲区 `NULL`，并指定愿意接收的最大数据量。
邮箱不会马上拷贝，但会更新描述符中可用的数据字节数。随后线程必须响应：
*   如果 `size` 为 0：无需进一步操作，消息已删除。
*   如果 `size` 非 0 且想取数据：提供足够大的缓冲区调用 `k_mbox_data_get`，拷贝数据并删除消息。
*   如果 `size` 非 0 但不想取数据：调用 `k_mbox_data_get` 传入 `NULL`，直接删除消息不拷贝数据。
这适用于内存受限场景，如根据 `info` 判断是否需要分配大内存接收载荷。
```c
recv_msg.size = 10000;
recv_msg.rx_source_thread = K_ANY;
k_mbox_get(&my_mailbox, &recv_msg, NULL, K_FOREVER); /* 仅获取消息头 */

if (is_message_type_ok(recv_msg.info)) {
    k_mbox_data_get(&recv_msg, buffer); /* 检索数据并删除消息 */
} else {
    k_mbox_data_get(&recv_msg, NULL);   /* 忽略数据并删除消息 */
}
```

---

## 3. Suggested Uses (建议用途)

当传统消息队列 (Message Queue) 的功能不足以满足需求时，使用邮箱在线程之间传输数据项（例如传输任意大小的载荷、需要精准定点投递的场景）。

---

## 4. Configuration Options (配置选项)

相关配置选项：
*   `CONFIG_NUM_MBOX_ASYNC_MSGS`

---

## 5. API Reference (API 参考)

有关 Kernel Mailbox 的 API 参考，请参阅 Doxygen 的 `mailbox_apis` 分组，其中主要包含以下接口：
*   `k_mbox_init`
*   `k_mbox_put`
*   `k_mbox_async_put`
*   `k_mbox_get`
*   `k_mbox_data_get`
