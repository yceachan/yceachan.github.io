---
title: "Zephyr Logging Thread Internals: 调度与流控"
tags: [Zephyr, Logging, Thread, Flow Control, mpsc_pbuf]
desc: 深入剖析 Zephyr 日志处理线程 (log_process_thread) 的生命周期、唤醒机制以及高并发下的丢包 (Drop) 策略。
update: 2026-02-25
---

# Logging Thread Internals (后台调度与流控)

> [!note]
> **Source Codes:** 
> - `$ZEPHYR_BASE/subsys/logging/log_core.c`
> - `$ZEPHYR_BASE/subsys/logging/Kconfig.processing`

在 Zephyr 的延迟日志模式 (Deferred Mode) 下，前端应用线程将日志打包存入 `mpsc_pbuf` 后即刻返回。真正执行文本格式化（如 `vsprintf`）并将其送入物理接口（如 UART）的工作，完全由一个后台专属的 `log_process_thread` 承担。

## 1. 线程的创建与配置

该日志专职线程通过 `K_THREAD_DEFINE` 或内部动态创建机制 (`k_thread_create`) 启动，它的属性高度可配：

*   **优先级 (Priority):** 
    默认为 `K_LOWEST_APPLICATION_THREAD_PRIO`（系统最低优先级）。这体现了 Zephyr 极强的**实时性导向**：打印 Log 绝不能抢占任何实际业务逻辑的 CPU 时间。如果遇到非常密集的业务循环，日志线程可能会饿死，此时可以通过开启 `CONFIG_LOG_PROCESS_THREAD_CUSTOM_PRIORITY` 手动提权。
*   **栈空间 (Stack Size):**
    由 `CONFIG_LOG_PROCESS_THREAD_STACK_SIZE` 定义。因为所有日志后端的字符串格式化操作（`snprintf` / `cbprintf`）都在这个线程里执行，所以栈不能太小。
*   **延迟启动 (Startup Delay):**
    支持 `CONFIG_LOG_PROCESS_THREAD_STARTUP_DELAY_MS`，避免系统启动初期日志线程和关键初始化抢占 CPU。

## 2. 核心循环与唤醒机制

在 `log_core.c` 的 `log_process_thread_func()` 函数中，线程的核心表现是一个无限循环：

```c
// 简化的日志线程主循环
while (true) {
    if (log_process() == false) {
        // 如果没有处理任何日志（队列空），则进入阻塞休眠
        k_sem_take(&log_process_thread_sem, timeout);
    }
}
```

### 何时被唤醒 (Wakeup triggers)?
并不是每打印一条日志就会唤醒一次该线程（那样会导致海量的上下文切换），内核使用了节流与定时结合的机制：
1.  **超时定时器 (`log_process_thread_timer`)**: 如果日志缓冲池中有数据，但还没达到立即处理的阈值，内核会启动一个软定时器 (`CONFIG_LOG_PROCESS_THREAD_SLEEP_MS`)，定时器到期后通过 `k_sem_give(&log_process_thread_sem)` 唤醒它。
2.  **阈值触发 (`CONFIG_LOG_PROCESS_TRIGGER_THRESHOLD`)**: 当缓冲池里积攒的未处理日志达到设定阈值时，立刻 `k_sem_give()`。
3.  **Panic 模式**: 如果系统发生了 `k_panic()`，内核会绕过信号量，直接在死机线程中强行接管并排空队列 (`log_flush`)。

## 3. Log 的提取与分发

在被唤醒后，`log_process()` 开始工作：
1.  **`z_log_msg_claim()`**: 从 `mpsc_pbuf` 无锁队列中“认领”最老的一条日志块。
2.  **`msg_process()`**: 遍历系统里挂载的所有激活后端的 (`log_backend`，如 UART、RTT、Flash 等)。
3.  **过滤器检查 (`msg_filter_check`)**: 再次确认该后端的 Log 级别设置是否允许输出这条消息。
4.  **`log_backend_msg_process()`**: 交给具体的驱动去渲染并输出。
5.  **`z_log_msg_free()`**: 从内存池中释放该日志包的空间。

## 4. 丢包管理 (Drop Logic & Flow Control)

当**系统产生日志的速度远大于 UART 波特率传输的速度**时，`mpsc_pbuf` 会耗尽。Zephyr 是如何处理这种背压 (Backpressure) 的？

*   **丢弃模式**:
    *   **Overwrite (覆盖旧数据)**: 若开启 `CONFIG_LOG_MODE_OVERFLOW=y`，新日志会强行覆盖未被处理的最老日志。
    *   **Drop New (丢弃新数据)**: 默认行为，如果缓冲满了，`z_log_msg_alloc()` 会返回 NULL，此时系统调用 `z_log_dropped(false)` 放弃该条打印。
*   **记录与通告**:
    无论是哪种丢弃，内核都会执行 `atomic_inc(&dropped_cnt)` 原子自增丢弃计数器。
    在 `log_process()` 循环中，它会定期检查 (`z_log_dropped_pending()`)。如果发现发生了丢包，它会主动通过 `dropped_notify()` 通知所有后台驱动。
    因此我们经常能在高并发死机前，在串口看到类似这样的提示符：
    > `--- 43 messages dropped ---`

---
> **总结**: `log_process_thread` 是一个极具弹性的后台搬运工。它通过无锁队列、信号量节流以及完善的丢包通告机制，将应用层的异步输出与后端的同步物理发送完美解耦。
