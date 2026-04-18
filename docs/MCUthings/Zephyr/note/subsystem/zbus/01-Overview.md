---
title: Zephyr Bus (zbus) 概述
tags: [Zephyr, Subsystem, zbus, IPC, Publish-Subscribe]
desc: zbus 是 Zephyr 提供的一种轻量级软件总线，支持线程间多对多通信，通过通道（Channels）实现发布-订阅范式。
update: 2026-02-25
---

# Zephyr Bus (zbus)

> [!note]
> **Ref:** [Zephyr Project Documentation - zbus](https://docs.zephyrproject.org/latest/services/zbus/index.html)

**Zephyr bus (zbus)** 是一个轻量级且灵活的软件总线，允许线程之间以多对多（many-to-many）的方式进行通信。

## 1. 概念 (Concepts)

zbus 允许线程向一个或多个观察者发送消息，实现了**消息传递 (Message-passing)** 和 **发布/订阅 (Publish/Subscribe)** 通信范式。它支持通过共享内存进行同步或异步通信。

zbus 的通信是**基于通道 (Channel-based)** 的。线程或回调函数通过通道交换消息。当线程在通道上发布消息时，总线会将消息通知给该通道的所有观察者。

**zbus 的组成部分：**
*   **通道 (Channels)**：包含控制元数据信息和消息本身。
*   **虚拟分布式事件调度器 (VDED)**：负责向观察者发送通知/消息的逻辑。VDED 在发布者的线程上下文中运行。
*   **观察者 (Observers)**：包括订阅者 (Subscribers)、消息订阅者 (Message Subscribers) 和监听器 (Listeners)。

### 1.1 观察者类型 (Observer Types)
*   **Listeners (监听器)**：由事件调度器在每次通道发布时同步执行的回调函数。
*   **Async Listeners (异步监听器)**：由事件调度器调度到工作队列（通常是系统工作队列）中执行的回调。
*   **Subscribers (订阅者)**：基于线程的观察者，内部依赖消息队列。它只接收通道的引用，需要自行读取消息。
*   **Message Subscribers (消息订阅者)**：基于线程的观察者，内部依赖 FIFO。它接收消息的完整副本。

### 1.2 虚拟分布式事件调度器 (VDED)
VDED 的执行始终发生在发布者的上下文中（可以是线程或 ISR）。
**执行流程：**
1. 获取通道锁。
2. 通过 `memcpy` 将新消息拷贝到通道。
3. 执行监听器，发送消息副本给消息订阅者，并将通道引用推送到订阅者的消息队列。
4. 释放通道锁。

## 2. 限制 (Limitations)

zbus 并不能解决所有问题，例如在线程间传输高速字节流时，`Pipe` 可能是更好的选择。

### 2.1 交付保证 (Delivery Guarantees)
zbus 总是将消息交付给监听器、消息订阅者和异步监听器。但对于普通**订阅者 (Subscribers)**，由于它只发送通知，消息读取取决于订阅者的实现，可能存在数据丢失（如果通道在订阅者读取前被再次发布）。

### 2.2 消息传递顺序 (Message Delivery Sequence)
1. 通过 `ZBUS_CHAN_DEFINE` 定义的观察者（按定义顺序）。
2. 通过 `ZBUS_CHAN_ADD_OBS` 定义的观察者（按优先级参数）。
3. 运行时观察者（按添加顺序）。

## 3. 使用方法 (Usage)

### 3.1 发布到通道 (Publishing to a channel)
通过调用 `zbus_chan_pub` 发布消息。在 ISR 中调用时，超时必须设为 `K_NO_WAIT`。

### 3.2 从通道读取 (Reading from a channel)
通过调用 `zbus_chan_read` 读取消息。

### 3.3 通知通道 (Notifying a channel)
调用 `zbus_chan_notify` 强制通知观察者，而不一定需要交换数据。

### 3.4 声明通道和观察者 (Declaring channels and observers)
使用 `ZBUS_CHAN_DECLARE` 和 `ZBUS_OBS_DECLARE` 在其他文件中引用已定义的通道和观察者。

## 4. 高级通道控制 (Advanced channel control)

### 4.1 监听器消息访问
监听器可以直接访问接收通道的消息，因为此时通道已被锁定。应使用 `zbus_chan_const_msg` 进行只读访问。

### 4.2 用户数据 (User Data)
可以通过通道定义中的 `user_data` 字段传递自定义元数据。

### 4.3 声明与结束通道 (Claim and finish a channel)
使用 `zbus_chan_claim` 和 `zbus_chan_finish` 可以在不使用 `zbus_chan_pub/read` 的情况下安全地访问通道元数据或消息体。

### 4.4 运行时观察者注册 (Runtime observer registration)
通过启用 `CONFIG_ZBUS_RUNTIME_OBSERVERS`，可以在运行时动态添加或移除观察者。

## 5. 建议用途 (Suggested Uses)
* 用于线程间同步或异步的数据传输。
* 对于可以容忍消息丢失或重复的场景，使用订阅者 (Subscribers)。
* 对于需要高可靠性或快速处理的场景，使用监听器 (Listeners) 或消息订阅者 (Message Subscribers)。
