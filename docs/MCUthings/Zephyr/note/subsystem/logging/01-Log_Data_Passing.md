---
title: Zephyr Logging Data Passing 剖析：从应用层到缓冲池
tags: [Zephyr, Logging, Data Passing, mpsc_pbuf, cbprintf]
desc: 深入追踪 Zephyr 日志宏展开过程，解析应用层日志如何被无锁打包并存入 mpsc_pbuf 等待后端处理。
update: 2026-02-25
---

# Zephyr Logging Data Passing (前段追踪)

> [!note]
> **Source Codes:** 
> - `$ZEPHYR_BASE/include/zephyr/logging/log.h`
> - `$ZEPHYR_BASE/include/zephyr/logging/log_msg.h`
> - `$ZEPHYR_BASE/subsys/logging/log_core.c`

本篇主要探讨当应用层调用 `LOG_INF()` 宏时，数据在到达后台专用线程之前的“打包”与“传输”过程。

## 1. 宏展开与编译期预处理 (Macro Expansion)

当我们在代码中写下 `LOG_INF("Value: %d", val)` 时，它会经历复杂的宏展开：

1. **`LOG_INF` -> `Z_LOG` -> `Z_LOG2`**：
   在 `log_core.h` 中，宏首先会进行**编译期级别检查 (Static Level Check)**。如果 `CONFIG_LOG_DEFAULT_LEVEL` 低于 INFO 级别，这行代码在编译阶段就会被完全优化掉，实现真正的零开销 (Zero Overhead)。
2. **`Z_LOG_MSG_CREATE` (创建消息)**：
   检查通过后，核心逻辑会流转到 `log_msg.h` 中的 `Z_LOG_MSG_CREATE` 系列宏。

## 2. 数据的序列化：`cbprintf_package`

Zephyr 日志子系统为了兼顾执行速度（减少应用线程的阻塞）和内存安全，引入了基于 `cbprintf` 的打包机制 (`CBPRINTF_STATIC_PACKAGE`)。

* **延迟求值问题**：传统的 `printf` 直接解析 `%s`, `%d` 并输出字符。但在延迟模式 (Deferred Mode) 下，日志输出是由另一个低优先级线程在未来执行的。如果传递的是指针 (`%s`)，等后台线程去读指针内容时，指针指向的内存可能已经被释放或覆写了。
* **解决策略**：`CBPRINTF_STATIC_PACKAGE` 宏会在调用点（即 `LOG_INF` 所在的线程上下文中），将格式化字符串和所有参数**打包成一个自包含的连续内存块 (Self-contained Package)**。遇到 `%s` 对应的字符串时，会直接将字符串**深拷贝**到包中。

根据消息复杂度和上下文，系统会选择不同的创建策略：
* `Z_LOG_MSG_SIMPLE_CREATE`: 零拷贝模式（仅限无格式化参数且无非常量字符串）。
* `Z_LOG_MSG_STACK_CREATE`: 先将打包数据生成在当前线程的栈空间 (`_msg` 局部变量) 上，准备后续拷贝。

## 3. 内存分配：`mpsc_pbuf` 机制

序列化完成后的数据包需要被转移到全局环形缓冲区中等待后端处理。

在 `$ZEPHYR_BASE/subsys/logging/log_core.c` 中：
1. **`z_log_msg_alloc()`**:
   调用 `mpsc_pbuf_alloc(&log_buffer, wlen, ...)` 分配空间。
   `mpsc_pbuf` (Multi-Producer Single-Consumer Packet Buffer) 是 Zephyr 专门为日志系统设计的一种**多生产者、单消费者、无锁 (Lock-free)** 缓冲池。它允许中断 (ISR) 和多个高优先级线程并发写入日志，而不发生锁竞争。
2. **`z_log_msg_finalize()` & `z_log_msg_commit()`**:
   数据包从栈上拷贝到 `mpsc_pbuf` 分配的内存块中。
   记录时间戳：`msg->hdr.timestamp = timestamp_func();`
   调用 `mpsc_pbuf_commit` 提交数据块，宣告该消息入队成功。

## 4. 唤醒后端线程

提交成功后，最后一步是调用 `z_log_msg_post_finalize()` 唤醒后台处理线程：

```c
// subsys/logging/log_core.c : z_log_msg_post_finalize()
atomic_val_t cnt = atomic_inc(&buffered_cnt);

// 当缓冲池中只有一条待处理消息（之前是空的）时，释放信号量
if (cnt == 0) {
    k_sem_give(&log_process_thread_sem);
}
```
* **按阈值触发**：为了避免频繁唤醒后台线程引发上下文切换开销，Zephyr 提供 `CONFIG_LOG_PROCESS_TRIGGER_THRESHOLD` 等机制。可以设定攒够多少条日志才唤醒，或者启动 `log_process_thread_timer` 延时唤醒。

## 总结数据流：

`LOG_INF()` 宏调用  
  --> `CBPRINTF_STATIC_PACKAGE` (栈上打包，深拷贝易失字符串)  
  --> `mpsc_pbuf_alloc` (在多写单读缓冲池申请空间)  
  --> 内存拷贝与记录时间戳  
  --> `mpsc_pbuf_commit` (入队)  
  --> `k_sem_give(&log_process_thread_sem)` (按策略唤醒后台 Log 线程)

---
> 此时，数据已经安全落入了 `mpsc_pbuf` 中，应用线程立即返回。接下来将由专职的 `log_process_thread` 接管，负责将其传递给串口 (UART)。
