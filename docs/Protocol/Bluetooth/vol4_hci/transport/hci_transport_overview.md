---
Title: HCI 传输层 (Transport Layers) 概览
Tags: HCI, Transport, Overview
---

# HCI 传输层 (Transport Layers) 概览

> [!note]
> **Ref:** Bluetooth Core Specification v6.2 - Vol 4 Host Controller Interface

HCI 传输层 (HCI Transport Layer) 是蓝牙架构中的关键桥梁，它定义了**主机 (Host)** 如何通过物理接口将 HCI 的 Command、Event 以及各类 Data 包（ACL、SCO、ISO）传递给底层的**控制器 (Controller)**。
不同的物理接口定义了对应的专用传输层协议，以适应各种带宽、误码容忍度和硬件资源的场景。

## 传输层支持矩阵

Bluetooth Core Spec 定义了以下四种官方 HCI 传输层：

| 传输层名称 | 核心规范卷册 | 物理接口 | 适用场景 / 核心特点 |
| :--- | :--- | :--- | :--- |
| **[H4 (UART)](./h4_uart_transport.md)** | Part A | UART | 适用于高可靠、无误码的短距物理连线（如同块 PCB 内），必须启用 RTS/CTS 硬件流控。使用简单的 `0x01` ~ `0x05` 包前缀标识包类型。 |
| **[H2 (USB)](./h2_usb_transport.md)** | Part B | USB (1.1/2.0+) | 适用于 PC Dongle 和高性能模块。有极高的带宽和内置校验机制。分 Legacy Mode（不同 HCI 包走不同的 Endpoint）和 Bulk Serialization Mode（全部走 Bulk EP）。 |
| **[SD (Secure Digital)](./sd_transport.md)** | Part C | SDIO | 利用 SD 总线的高带宽块传输，适用于部分网卡复合设备。规范细节由 SDA（Secure Digital Association）制定。 |
| **[H5 (Three-wire UART)](./h5_three_wire_uart_transport.md)** | Part D | 三线 UART | 设计用于有线噪声和误码的链路。使用 SLIP 协议进行封包定界，具备 4-byte 独立头部、CRC 数据校验、滑动窗口确认（ACK/SEQ），并支持软件流控和休眠控制。 |

## 各传输层的核心差异

1. **包定界与标识**:
   * **H4**: 极其简单，没有自己的包头包尾，仅仅在 HCI 包之前强制塞入 **1 字节的 Indicator** 来区分 Command/Event/Data。它依赖底层链路“不会出错”的假设。
   * **H5**: 为了解决包错误，使用 **SLIP 协议** (通过 `0xC0` 分界) 来划定明确的包边界。
2. **错误恢复**:
   * **H4 & H2**: 如果发生错误，直接**上报 Hardware Error 并触发 Reset (复位)**，无法局部恢复。
   * **H5**: 拥有类似 TCP 的 **ACK 确认、Sequence 序号、滑动窗口重传机制**，可以对错误包进行精准重传。
3. **低功耗 (Low Power)**:
   * **H2 (USB)**: 依赖主机系统的 USB LPM 和 ACPI (S3/S4) 进行休眠，且深休眠唤醒可能需要重新枚举和初始化。
   * **H5**: 有自己原生的链路级控制机制（Sleep/Wakeup/Woken），可以在不重置 Controller 状态的情况下主动发起深度休眠调度。

## 开发与调试提示

- 开发者如果在使用基于 UART 的蓝牙芯片时遇到莫名其妙的 HCI Event 错乱（长度越界或包类型非法），首先检查**波特率**是否匹配以及 **CTS/RTS 硬件流控**是否开启和连接正确。如果物理链路抗干扰极差，应当在芯片和主机驱动中将协议切换至 **H5 (Three-wire UART)**。
- 只有确保传输层稳定工作，HCI 的初始化流程（如 `HCI_Reset`, `HCI_Read_Local_Version_Information`）才能跑通。
