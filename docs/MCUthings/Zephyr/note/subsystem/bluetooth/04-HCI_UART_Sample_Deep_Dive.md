---
title: 蓝牙 HCI 接口规范与 hci_uart 示例深度剖析
tags: [Zephyr, Subsystem, Bluetooth, BLE, HCI, UART, Controller]
desc: 以 Zephyr 官方 hci_uart 示例工程为切入点，深入研究蓝牙双芯片架构下的主机控制器接口 (HCI) 规范，特别是基于 UART 的 H:4 传输层实现机制。
update: 2026-02-26
---

# 蓝牙 HCI 接口规范与 `hci_uart` 示例深度剖析

> [!note]
> **Ref:** 
> - 示例源码路径: `$ZEPHYR_BASE/samples/bluetooth/hci_uart/`
> - 核心文件: `src/main.c`, `prj.conf`

在探讨了 Host 层和 Controller 层之后，我们需要了解它们是如何在**双芯片 (Dual-chip) 架构**下通过物理总线协同工作的。Zephyr 提供的 `hci_uart` 示例工程是研究这一机制的绝佳切入点。

## 1. `hci_uart` 工程的本质与用途

`hci_uart` 是一个**纯控制器 (Controller-only)** 的固件应用。
它的作用是将一块支持蓝牙 LE 的开发板（例如 nRF52840DK）打造成一个**标准的外置蓝牙网卡 (Bluetooth Dongle)**。

通过烧录此固件，开发板的蓝牙 Controller 层将通过 UART 串口向外部暴露标准的 **HCI (Host Controller Interface)** 接口。外部的主机（Host）可以是一台运行 Linux BlueZ 协议栈的 PC，或者是另一块运行 Zephyr Host 栈的单片机。

## 2. HCI 传输层协议：H:4 规范

在 UART 串口上传输 HCI 报文，业界最常用的是 **H:4 协议 (UART Transport Layer)**。H:4 协议的核心是在每个 HCI 数据包的最前面增加了一个 **1 字节的 Packet Type 指示符**，用于区分后方跟随的数据类型。

在 `main.c` 中，我们可以清晰地看到这些类型的定义：
```c
#define H4_CMD 0x01  /* Host -> Controller 的命令 (Command) */
#define H4_ACL 0x02  /* 异步无连接数据 (ACL Data, 常用于 L2CAP 载荷) */
#define H4_SCO 0x03  /* 同步面向连接数据 (SCO Data, 用于经典蓝牙音频) */
#define H4_EVT 0x04  /* Controller -> Host 的事件 (Event) */
#define H4_ISO 0x05  /* 同步数据 (Isochronous Data, 用于 LE Audio) */
```

## 3. 核心机制设计剖析 (`main.c`)

`hci_uart` 示例代码充当了 UART 外设与底层 Link Layer 之间的**桥梁**。它主要由两部分数据流组成：

### 3.1 Host 发往 Controller (RX 流)
当外部主机通过 UART 发送指令时，会触发串口接收中断 `rx_isr()`。Zephyr 在这里实现了一个精简的 H:4 协议解析状态机：

1. **`ST_IDLE`**: 阻塞读取 1 个字节，解析出 Packet Type（如 `H4_CMD`）。
2. **`ST_HDR`**: 根据类型读取对应的 HCI Header（如 Command Header 包含 Opcode 和 Param Length）。
3. **内存分配**: 利用 `bt_buf_get_tx()` 从专门的缓冲池中分配出一个 `net_buf`（网络缓冲区）。
4. **`ST_PAYLOAD`**: 根据 Header 中指示的长度，读取完整的 Payload 数据填入 `net_buf`。
5. **分发**: 将完整的 `net_buf` 压入 `tx_queue`。专门的发送线程 `tx_thread` 会取出包，并调用 `bt_send(buf)` 接口，将其原封不动地砸给底层的蓝牙 Controller 协议栈执行。

### 3.2 Controller 发往 Host (TX 流)
底层 Link Layer 产生的数据或事件（例如扫描到的广播包、连接建立事件）如何传回给 Host 呢？

1. **`bt_enable_raw(&rx_queue)`**: 在 `main()` 函数初始化时，调用了这个特殊的 API。它取代了常规的 `bt_enable()`，告诉蓝牙子系统：“我是 Raw 模式，不要启动内置的 Host 协议栈处理逻辑，请把所有 Controller 产生的数据包全部扔进我指定的 `rx_queue` 中”。
2. **取出与压栈**: `main()` 函数的主循环永远阻塞在 `rx_queue` 上。一有数据，就调用 `h4_send(buf)` 将其转移给 UART 发送队列，并手动开启 UART 的发送空中断 (`uart_irq_tx_enable`)。
3. **`tx_isr()`**: 串口底层通过中断机制，逐字节地将 Controller 吐出的 `net_buf` 数据推送到物理串口的 TX 引脚上。

## 4. Kconfig 与 DeviceTree 配置分析

要让设备以这种模式运行，需要在工程配置上进行特殊设置。

**`prj.conf`**:
```kconfig
CONFIG_BT=y
# 核心宏：启用 HCI RAW 模式，彻底剔除高层的 Host 协议栈
CONFIG_BT_HCI_RAW=y 
# 告诉底层 RAW 接口使用 H:4 协议结构
CONFIG_BT_HCI_RAW_H4=y
CONFIG_BT_HCI_RAW_H4_ENABLE=y
```

**DeviceTree 绑定**:
通常在 `boards/` 下的 overlay 文件中，使用 `chosen` 节点显式指定哪一个 UART 外设用于 HCI 通信。
```dts
/ {
    chosen {
        /* 将特定的串口实例作为蓝牙 Controller 到 Host 的通信桥梁 */
        zephyr,bt-c2h-uart = &uart1; 
    };
};
```
在对应的 UART 节点中，还需要开启硬件流控 (RTS/CTS)，因为 1Mbps 级别的高速串口通信如果不加流控极易丢包，导致蓝牙协议栈状态机崩溃。

## 5. 总结

通过 `hci_uart` 示例工程，我们深入理解了蓝牙 HCI 层在物理边界上的具体表现。它揭示了：
- **`bt_enable_raw()`** 接口的威力，它能够将 Zephyr 从一个全栈系统降维成一个纯粹的基带控制器网卡。
- **H:4 协议**作为 UART 上最简单有效的封装格式，是如何通过 1 个字节的 Header 完成不同协议数据的分类分流的。
- Zephyr 的 **`net_buf` (网络缓冲区机制)** 在不同外设 ISR 与协议栈工作队列之间实现零拷贝数据传递的核心作用。

如果您想尝试基于此架构进行开发，一种非常流行的做法是将此固件烧录到 Nordic 开发板上，并将其插在 PC 上，通过 `btattach -B /dev/ttyACM0 -S 1000000` 命令，将其直接挂载到 Linux 的 BlueZ 蓝牙子系统下作为本地硬件适配器使用。