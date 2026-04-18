---
title: UART Device Model & DTS (串口设备模型与 DTS 挂载)
tags: [Zephyr, Logging, UART, Device Model, DTS]
desc: 剖析 Zephyr 设备树中的 zephyr,console 是如何映射到底层 UART 驱动，并被 Log Backend 成功挂载的完整机制。
update: 2026-02-25
---

# UART Device Model & DTS (串口设备模型与 DTS 挂载)

> [!note]
> **Source Codes:** 
> - `$ZEPHYR_BASE/subsys/logging/backends/log_backend_uart.c`
> - `boards/**/*.dts` (设备树文件)
> - `$ZEPHYR_BASE/include/zephyr/device.h`

在探讨了日志的前端数据如何流转到缓冲池，以及专职 Log 线程是如何调度后，本篇聚焦于最后一步：**日志最终是如何找到正确的物理硬件（如 UART0）发送出去的？**这涉及 Zephyr 强大的 Device Tree (DTS) 机制和设备驱动模型。

## 1. DTS 层的绑定：`/chosen` 节点

在绝大多数的 Zephyr Board 级设备树文件中（如 `esp32c3_devkitm.dts`），你会看到类似如下的定义：

```dts
/ {
    chosen {
        zephyr,console = &uart0;
        zephyr,shell-uart = &uart0;
    };
};
```
*   `zephyr,console` 是 Zephyr 约定的一个特殊路径。它并不代表某个具体的硬件地址，而是一个**别名/指针**，将系统的“控制台输出”职责指向了实际的物理节点（此处为 `&uart0`）。

## 2. UART Backend 的宏展开捕获

在 `$ZEPHYR_BASE/subsys/logging/backends/log_backend_uart.c` 中，系统是如何拿到这个硬件节点的呢？

查看其底部的宏定义和实例化过程：

```c
#if DT_HAS_CHOSEN(zephyr_log_uart)
// 如果显式定义了专用的 zephyr_log_uart，则使用它
#else
// 否则降级使用 zephyr,console
LBU_DEFINE(DT_CHOSEN(zephyr_console));
#endif
```

`LBU_DEFINE` 宏内部执行了最关键的设备绑定逻辑：
```c
static const struct lbu_cb_ctx lbu_cb_ctx = {                                 
    .output = &lbu_output,                                                
    .uart_dev = DEVICE_DT_GET(DT_CHOSEN(zephyr_console)), // <--- 获取设备结构体                                                           
    .data = &lbu_data,                                                    
}; 
```
`DEVICE_DT_GET` 是 Zephyr 设备模型的核心宏，它在编译期就通过展开 DTS 节点路径，找到了具体的设备实例 `const struct device *`。

## 3. UART 驱动的底层实例化 (Device Define)

那么 `DEVICE_DT_GET` 拿到的这个 `struct device` 是谁创建的？
这发生在芯片级的 UART 驱动源码中（例如 `drivers/serial/uart_stm32.c` 或 `uart_esp32.c`）。驱动开发者会在源码末尾使用如下宏：

```c
#define UART_INIT(n) 
    DEVICE_DT_INST_DEFINE(n, 
                          uart_init_func, 
                          NULL, 
                          &uart_data_##n, 
                          &uart_config_##n, 
                          PRE_KERNEL_1, 
                          CONFIG_SERIAL_INIT_PRIORITY, 
                          &uart_api); 

DT_INST_FOREACH_STATUS_OKAY(UART_INIT)
```
*   **启动层级 (`PRE_KERNEL_1`)**: UART 驱动通常在 OS 内核完成基础初始化之前（非常早期）就进行硬件寄存器的配置。
*   **`&uart_api`**: 包含了驱动底层实现的虚函数表（如 `.poll_out = uart_stm32_poll_out`）。

## 4. Log 线程的最终输出调用

当 `log_process_thread` 取出缓冲区的日志并传递给后端时，`log_backend_uart.c` 会执行输出动作 (`char_out`)。它正是调用了这套统一的 Device API：

```c
static int char_out(uint8_t *data, size_t length, void *ctx)
{
    const struct device *uart_dev = LBU_UART_DEV(cb_ctx);

    if (!IS_ENABLED(CONFIG_LOG_BACKEND_UART_ASYNC)) {
        // 轮询模式 (Polling Mode)
        for (size_t i = 0; i < length; i++) {
            uart_poll_out(uart_dev, data[i]);
        }
    } else {
        // 异步中断模式 (Async Mode - DMA/Interrupt)
        uart_tx(uart_dev, data, length, SYS_FOREVER_US);
        k_sem_take(&lb_data->sem, K_FOREVER); // 等待 TX_DONE 回调
    }
    
    return length;
}
```
*   **`uart_poll_out`**: 简单的死循环查寄存器，把字符一个一个塞进 TX FIFO。最可靠，常用于 Panic 或无中断场景。
*   **`uart_tx`**: 异步发送。结合 DMA 或 TX 空中断，将整块内存交出去后线程可以去休眠，等硬件发完后在中断里 `k_sem_give` 唤醒。对系统实时性最好。

---
> **闭环总结**：
> 1. Board 层 `DTS` 中选定 `zephyr,console = &uartX`。
> 2. UART 底层驱动在 `PRE_KERNEL_1` 阶段利用 `DEVICE_DT_DEFINE` 初始化硬件并提供虚函数表。
> 3. Log 后端代码在编译期利用 `DEVICE_DT_GET(DT_CHOSEN(zephyr_console))` 锁定该设备指针。
> 4. 运行期，后端的 `char_out` 利用 `uart_poll_out()` / `uart_tx()` 完成日志从内存到外设 TX 引脚的最终发送。
