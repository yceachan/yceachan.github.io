---
title: zbus 内部实现深度剖析 (Zbus Internals Deep Dive)
tags: [Zephyr, Subsystem, zbus, IPC, Internals]
desc: 深入剖析 Zephyr zbus 消息总线的底层实现：包含宏静态分配、观察者遍历唤醒机制，以及不同类型观察者的源码路径。
update: 2026-02-25
---

# zbus 内部实现深度剖析 (Zbus Internals Deep Dive)

> [!note]
> **Source Codes:**
> - `$ZEPHYR_BASE/include/zephyr/zbus/zbus.h` (宏定义与核心数据结构)
> - `$ZEPHYR_BASE/subsys/zbus/zbus.c` (核心逻辑与 `VDED` 引擎)

作为 Zephyr 的现代发布-订阅总线，`zbus` (Zephyr Bus) 提供了极为优雅的解耦方式。它是如何通过极致的静态宏分配做到零运行时开销初始化？`VDED` (Virtual Distributed Event Dispatcher) 在代码里长什么样？本篇我们从源码级深入解密。

---

## 1. 静态内存分配机制 (`ZBUS_CHAN_DEFINE`)

Zephyr 极度推崇“能在编译期做完的事，绝对不在运行期做”。`zbus` 通道的创建便是一个典型代表。

当你写下：
```c
ZBUS_CHAN_DEFINE(my_sensor_chan, struct sensor_data, NULL, NULL, ZBUS_OBSERVERS(my_lis, my_sub), my_init_val);
```

### 1.1 宏展开背后的三个实体

展开 `$ZEPHYR_BASE/include/zephyr/zbus/zbus.h` 中的 `_ZBUS_CHAN_DEFINE`，实际上会创建 3 个强关联的静态变量：

1.  **消息存储区 (`_ZBUS_MESSAGE_NAME`)**：
    ```c
    static struct sensor_data _zbus_message_my_sensor_chan = my_init_val;
    ```
    这是通道内消息对象的真实内存地址（Type-safe）。

2.  **通道运行时数据块 (`_zbus_chan_data_XXX`)**：
    ```c
    static struct zbus_channel_data _zbus_chan_data_my_sensor_chan = {
        .observers_start_idx = -1,
        .observers_end_idx = -1,
        .sem = Z_SEM_INITIALIZER(...), // 用于保护通道读写的信号量
        ...
    };
    ```

3.  **只读的通道描述符 (`zbus_channel`)**：
    ```c
    const STRUCT_SECTION_ITERABLE(zbus_channel, my_sensor_chan) = {
        .message = &_zbus_message_my_sensor_chan,
        .message_size = sizeof(struct sensor_data),
        .data = &_zbus_chan_data_my_sensor_chan,
        ...
    };
    ```
    这个描述符被强制放入名为 `zbus_channel` 的专用 ELF 内存段 (Iterable Section) 中，系统可以通过链接器脚本轻松遍历所有的通道。

### 1.2 观察者与通道的绑定 (`zbus_channel_observation`)

`ZBUS_OBSERVERS(...)` 参数并非将观察者塞进一个运行时数组！而是再次利用了 Iterable Section 魔法，生成 `zbus_channel_observation` 结构体，专门放入另一个独立段中。系统在 `SYS_INIT(_zbus_init)` 启动时，遍历这个段，算出每个通道在数组中的 `start_idx` 和 `end_idx`，从而实现了 $O(1)$ 的内存占用且零动态内存分配 (No `malloc`)。

---

## 2. Observer 的遍历与唤醒流程 (`zbus_chan_pub`)

当发布者调用 `zbus_chan_pub(chan, msg, timeout)` 时，VDED 虚拟事件调度引擎开始工作。流程分为两大步：

### 2.1 获取通道锁与消息拷贝
在 `zbus.c` 的 `zbus_chan_pub` 中：
```c
// 1. 获取保护通道的 Semaphore
err = chan_lock(chan, timeout, &context_priority);

// 2. 将用户传入的 msg 深拷贝到通道内置的静态缓存中
memcpy(chan->message, msg, chan->message_size);

// 3. 执行核心调度引擎
err = _zbus_vded_exec(chan, end_time);

chan_unlock(chan, context_priority);
```

### 2.2 核心调度器 `_zbus_vded_exec` 
这是 `zbus` 的心脏，负责将事件分发给所有订阅者：

```c
static inline int _zbus_vded_exec(const struct zbus_channel *chan, k_timepoint_t end_time) {
    // 遍历属于该通道的所有观察者 (静态)
    for (int16_t i = chan->data->observers_start_idx, limit = chan->data->observers_end_idx;
         i < limit; ++i) {
        
        STRUCT_SECTION_GET(zbus_channel_observation, i, &observation);
        const struct zbus_observer *obs = observation->obs;

        // 核心分发函数
        _zbus_notify_observer(chan, obs, end_time, buf);
    }
}
```

---

## 3. 同步 vs 异步的上下文区别 (`_zbus_notify_observer`)

不同类型的观察者，唤醒他们的机制完全不同。在 `zbus.c` 中：

```c
static inline int _zbus_notify_observer(...) {
    switch (obs->type) {
        
        // 【1. Listener - 同步监听器】
        case ZBUS_OBSERVER_LISTENER_TYPE: {
            obs->callback(chan); // 直接在当前发布者 (Publisher) 线程的上下文中调用！
            break;
        }
        
        // 【2. Subscriber - 异步订阅者】
        case ZBUS_OBSERVER_SUBSCRIBER_TYPE: {
            // 不阻塞发布者，直接将通道的指针投递到该观察者绑定的 k_msgq 中
            return k_msgq_put(obs->queue, &chan, ...); 
        }

        // 【3. Msg Subscriber - 独立消息订阅者】
        case ZBUS_OBSERVER_MSG_SUBSCRIBER_TYPE: {
            // 利用 net_buf_pool 从内存池分配一块缓存，克隆消息，然后丢入 k_fifo
            struct net_buf *cloned_buf = net_buf_clone(buf, ...);
            k_fifo_put(obs->message_fifo, cloned_buf);
            break;
        }
    }
}
```

### 关键结论
*   **Listener (监听器)**：**极其危险但也最高效**。回调函数运行在**调用 `zbus_chan_pub` 的那个线程上下文中**。如果回调发生阻塞（例如执行了 `k_sleep`），会直接阻塞发布者！绝不允许在 Listener 中等待该通道的数据更新（死锁）。
*   **Subscriber (订阅者)**：安全且解耦。发布者只是在它的消息队列 (`k_msgq`) 里塞了一个 `chan` 指针。接收线程在自己的上下文中通过 `zbus_sub_wait` 醒来，随后再去通道中读取数据。
*   **MSG Subscriber**：彻底的空间解耦。它使用了内核的 `net_buf` 内存池，甚至连消息体的内容都给你复制了一份。接收线程读取时，不用再加锁访问通道的共享内存了，但也带来了最大的内存开销。
