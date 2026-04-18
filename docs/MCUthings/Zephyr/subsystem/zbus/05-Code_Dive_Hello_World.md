---
title: zbus Hello World 示例深度剖析
tags: [Zephyr, Subsystem, zbus, Sample, API]
desc: 从 samples/subsys/zbus/hello_world 源码出发，自顶向下解析 zbus 通信的核心 API 使用方法与编程范式。
update: 2026-02-25
---

# zbus Hello World 示例深度剖析

`samples/subsys/zbus/hello_world` 是理解 Zephyr 总线机制的最佳入门示例。它展示了如何定义消息、通道、多种观察者，以及如何使用发布、验证和迭代器 API。

## 1. 消息与通道定义 (Static Configuration)

zbus 的核心是**静态定义**。在 `main.c` 中，首先定义了业务消息结构体：

```c
struct version_msg { uint8_t major; uint8_t minor; uint16_t build; };
struct acc_msg { int x; int y; int z; };
```

随后使用 `ZBUS_CHAN_DEFINE` 宏定义通道。这是最关键的 API：

```c
ZBUS_CHAN_DEFINE(acc_data_chan,      /* 通道名 */
		 struct acc_msg,             /* 消息类型 */
		 NULL,                       /* 验证器 (Optional) */
		 NULL,                       /* 用户数据 (Optional) */
		 ZBUS_OBSERVERS(foo_lis, bar_sub, baz_async_lis), /* 观察者列表 */
		 ZBUS_MSG_INIT(.x = 0, .y = 0, .z = 0)            /* 初始值 */
);
```

### 关键点解析：
*   **Validator (验证器)**：示例中展示了 `simple_chan` 使用了 `simple_chan_validator`。如果发布的数据不满足逻辑（例如 `value < 0`），`zbus_chan_pub` 会返回 `-ENOMSG`。
*   **Observers 列表**：通道在定义时就静态绑定了哪些观察者会收到通知。

---

## 2. 观察者实现 (Observer Implementation)

示例演示了三种不同类型的观察者，它们的 API 范式各不相同：

### 2.1 同步监听器 (Listener)
*   **API**: `ZBUS_LISTENER_DEFINE(_name, _cb)`
*   **用法**: 直接提供一个回调。
*   **读取方式**: 使用 `zbus_chan_const_msg(chan)` 进行零拷贝只读访问。

### 2.2 异步监听器 (Async Listener)
*   **API**: `ZBUS_ASYNC_LISTENER_DEFINE(_name, _cb)`
*   **用法**: 回调参数多了一个 `const void *message`，这是系统深拷贝后的消息副本。
*   **特性**: 运行在系统工作队列上下文中，不阻塞发布者。

### 2.3 订阅者 (Subscriber)
*   **API**: `ZBUS_SUBSCRIBER_DEFINE(_name, _queue_size)`
*   **用法**: 必须配合一个独立线程。
*   **执行流**:
    1.  调用 `zbus_sub_wait(&bar_sub, &chan, K_FOREVER)` 阻塞等待。
    2.  收到通知后，检查是哪个通道 (`&acc_data_chan == chan`)。
    3.  调用 `zbus_chan_read` 手动读取数据。

---

## 3. 运行时的核心操作 (Runtime Operations)

### 3.1 发布消息 (Publishing)
```c
struct acc_msg acc1 = {.x = 1, .y = 1, .z = 1};
zbus_chan_pub(&acc_data_chan, &acc1, K_SECONDS(1));
```
*   `zbus_chan_pub` 会触发 VDED 逻辑。
*   如果通道有验证器且验证失败，返回 `-ENOMSG`。

### 3.2 发现与遍历 (Introspection)
示例展示了 zbus 的“自省”能力，即在运行时查询系统中有哪些通道和观察者。

*   **遍历通道**: `zbus_iterate_over_channels_with_user_data(print_channel_data_iterator, &count);`
*   **遍历观察者**: `zbus_iterate_over_observers_with_user_data(print_observer_data_iterator, &count);`

这对于调试、生成系统拓扑图或实现通用的网关类应用非常有用。通过 `chan->data->observers_start_idx` 可以进一步访问该通道的所有观察者。

---

## 4. 总结：zbus 编程范式清单

通过该示例，我们可以总结出使用 zbus 的典型步骤：

1.  **定义消息类型** (普通的 C struct)。
2.  **定义通道观察者** (Listener, Subscriber 或 Async Listener)。
3.  **定义通道** (使用 `ZBUS_CHAN_DEFINE` 绑定消息、验证器和观察者)。
4.  **实现逻辑**：
    *   在需要的地方通过 `zbus_chan_pub` 发布数据。
    *   在回调或订阅者线程中接收并处理数据。
5.  **(可选) 声明**：如果跨文件使用，需在头文件中使用 `ZBUS_CHAN_DECLARE` 或 `ZBUS_OBS_DECLARE`。

---

> [!NOTE]
> **Ref:** `zephyr/samples/subsys/zbus/hello_world/src/main.c`
