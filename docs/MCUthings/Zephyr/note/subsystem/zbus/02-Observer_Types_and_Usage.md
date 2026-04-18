---
title: zbus 观察者模型对比 (Observer Types and Usage)
tags: [Zephyr, Subsystem, zbus, IPC, Pub-Sub]
desc: 深入分析 zbus 提供的四种观察者机制（Listeners, Async Listeners, Subscribers, Message Subscribers），及其在不同场景下的适用策略与代码范式。
update: 2026-02-25
---

# zbus 观察者模型对比

在 Zephyr 的 `zbus` (Zephyr Bus) 架构中，观察者（Observer）是接收通道（Channel）消息的主体。为了满足不同级别的实时性、内存占用和任务隔离需求，`zbus` 提供了四种截然不同的观察者模型：

1. **Listener (监听器)**
2. **Async Listener (异步监听器)**
3. **Subscriber (订阅者)**
4. **Message Subscriber (消息订阅者)**

本指南将深入剖析这四者的内部实现机制、适用场景以及典型的代码范式。

---

## 1. 核心模型解析与对比

`zbus` 的四种观察者类型本质上是对 **执行上下文 (Context)** 和 **数据缓冲方式 (Buffering)** 的不同组合。

| 特性维度 | 1. Listener (监听器) | 2. Async Listener (异步监听器) | 3. Subscriber (订阅者) | 4. Message Subscriber (消息订阅者) |
| :--- | :--- | :--- | :--- | :--- |
| **执行上下文** | 发布者线程 / ISR (同步) | 工作队列线程 (如系统工作队列) | 用户自定义的独立线程 | 用户自定义的独立线程 |
| **底层 IPC 机制** | 直接回调 (Callback) | `k_work` + `k_fifo` (带复制) | `k_msgq` (仅存引用) | `k_fifo` (带复制) |
| **消息获取方式** | 直接读取共享内存 (`const`) | 回调参数中传入完整消息副本 | 手动调 `zbus_chan_read` 拷贝 | 自动出队获取完整消息副本 |
| **中间数据丢失** | 不会丢失（因为阻塞了发布者） | 不会丢失（放入队列缓冲） | **可能丢失** (新数据覆盖旧数据) | 不会丢失（放入队列缓冲） |
| **执行速度/开销** | 极快（零拷贝），开销极小 | 较慢（涉及内存分配和拷贝） | 极快（仅传指针），但读时拷贝 | 较慢（涉及内存分配和拷贝） |
| **内存池依赖** | 无 | 需要配置 `net_buf` 内存池 | 无 | 需要配置 `net_buf` 内存池 |

---

## 2. 深入剖析与代码范式

### 2.1 Listener (监听器)
*   **底层结构**: `union` 中使用 `void (*callback)(const struct zbus_channel *chan)`。
*   **工作机制**: 当 VDED (虚拟分布式事件调度器) 触发时，**在发布者的上下文中直接同步调用此回调**。此时通道的锁尚未释放。
*   **适用场景**: 
    *   简单的状态转换、LED 闪烁、短小的逻辑判断。
    *   需要极高的响应速度（微秒级）。
    *   **警告**: 由于它在发布者的上下文中执行，绝不能在 Listener 中包含任何可能导致阻塞（如 `k_sleep`, 等待信号量）的操作。如果在 ISR 中发布消息，Listener 也将在 ISR 中执行！

```c
// 1. 定义回调
void my_listener_cb(const struct zbus_channel *chan) {
    // 必须使用 const_msg 宏，因为此时可以直接且安全地访问原内存，无需拷贝
    const struct my_msg_t *msg = zbus_chan_const_msg(chan);
    printk("Listener received: %d
", msg->value);
}

// 2. 注册 Listener
ZBUS_LISTENER_DEFINE(my_listener, my_listener_cb);
```

### 2.2 Async Listener (异步监听器)
*   **底层结构**: `union` 中使用 `struct k_work *work`。内部自动绑定了一个 `k_fifo`。
*   **工作机制**: 发布消息时，VDED 会将消息的完整副本（深拷贝）通过底层分配的 `net_buf` 投入该 Listener 绑定的 FIFO 中，并提交一个 Work item 到工作队列 (默认为 `k_sys_work_q`)。
*   **适用场景**:
    *   逻辑处理较复杂，但不希望为此专门开启一个常驻线程。
    *   需要推迟处理以避免阻塞发布者。
    *   相比普通 Listener 更安全，因为它运行在系统工作队列的线程上下文中。

```c
// 1. 定义回调（注意，这里的 msg 已经是系统帮我们拷贝好的副本）
void my_async_listener_cb(const struct zbus_channel *chan, const void *msg) {
    const struct my_msg_t *data = msg;
    printk("Async Listener received: %d
", data->value);
}

// 2. 注册 Async Listener
ZBUS_ASYNC_LISTENER_DEFINE(my_async_listener, my_async_listener_cb);
```

### 2.3 Subscriber (订阅者)
*   **底层结构**: `union` 中使用 `struct k_msgq *queue`。
*   **工作机制**: 发布消息时，VDED 仅将该**通道的指针（引用）** 放入 Subscriber 的 `k_msgq` 中。此时没有发生消息内容的深拷贝。用户线程在收到通知后，需要主动从通道中读取消息内容。
*   **核心缺陷 (Data Loss)**: 如果通道连续多次发布消息，而 Subscriber 线程还没有来得及读取，当它最终去读时，只能读到最后一次的最新状态。中间的过渡状态将被覆盖。
*   **适用场景**:
    *   只关心系统最新状态（例如温度传感器数据更新），不关心中间过程。
    *   不需要分配 `net_buf` 内存池，适合内存受限设备。

```c
// 1. 定义 Subscriber (队列深度为 4 个通道引用)
ZBUS_SUBSCRIBER_DEFINE(my_subscriber, 4);

// 2. 独立线程逻辑
void sub_thread(void) {
    const struct zbus_channel *chan;
    struct my_msg_t msg;

    while (1) {
        // 等待通道引用的到来
        if (zbus_sub_wait(&my_subscriber, &chan, K_FOREVER) == 0) {
            if (chan == &my_chan) {
                // 手动从通道读取最新数据 (可能发生了覆盖)
                zbus_chan_read(chan, &msg, K_NO_WAIT);
                printk("Subscriber read: %d
", msg.value);
            }
        }
    }
}
```

### 2.4 Message Subscriber (消息订阅者)
*   **底层结构**: `union` 中使用 `struct k_fifo *message_fifo`。
*   **工作机制**: 发布消息时，VDED 会从 `net_buf` 内存池中分配一块内存，将完整的消息内容**深拷贝**后投入 FIFO。
*   **适用场景**:
    *   经典的 Pub-Sub 业务解耦模型。
    *   绝不允许丢失任何一条中间消息（如指令序列、日志流）。
    *   **代价**: 必须配置相应的 Kconfig (`CONFIG_ZBUS_MSG_SUBSCRIBER=y` 和 `CONFIG_ZBUS_MSG_SUBSCRIBER_NET_BUF_POOL_SIZE`)，增加了内存池开销。

```c
// 1. 定义 Message Subscriber
ZBUS_MSG_SUBSCRIBER_DEFINE(my_msg_subscriber);

// 2. 独立线程逻辑
void msg_sub_thread(void) {
    const struct zbus_channel *chan;
    struct my_msg_t msg;

    while (1) {
        // 等待并直接获取深拷贝后的完整消息内容
        if (zbus_sub_wait_msg(&my_msg_subscriber, &chan, &msg, K_FOREVER) == 0) {
            if (chan == &my_chan) {
                printk("Msg Subscriber read exact: %d
", msg.value);
            }
        }
    }
}
```

---

## 3. 架构选型树 (Decision Tree)

在实际业务开发中，该如何选择？可以通过以下决策树来快速定位：

1. **是否需要隔离执行上下文（即：不能阻塞发布者 / 避免优先级反转）？**
   * **否**: 使用 `Listener`。（适合轻量级状态处理、高实时性要求）。
   * **是**: 往下看（2）。

2. **你愿意为了此任务分配/维持一个独立的常驻线程吗？**
   * **否**: 使用 `Async Listener`。（借用工作队列，省线程栈空间）。
   * **是**: 往下看（3）。

3. **如果消息积压，是否可以容忍丢失中间状态（仅读取最终值）？**
   * **是**: 使用 `Subscriber`。（省 RAM，不需要 `net_buf` 内存池）。
   * **否**: 使用 `Message Subscriber`。（保证消息的全序列按序到达，需配合 `net_buf` 内存池）。
