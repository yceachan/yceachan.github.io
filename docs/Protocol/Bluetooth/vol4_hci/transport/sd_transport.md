---
Title: HCI Secure Digital (SD) Transport Layer
Tags: HCI, Transport, SD, SDIO
---

# HCI Secure Digital (SD) Transport Layer

> [!note]
> **Ref:** Bluetooth Core Specification v6.2 - Vol 4, Part C Secure Digital (SD) Transport Layer

HCI Secure Digital (SD) 传输层定义了如何通过 SD 总线接口传输 HCI 命令、事件和数据包。与其他传输层不同，蓝牙 SD 传输层的完整物理层和协议细节并不在蓝牙核心规范中详述，而是由 **Secure Digital Association (SDA)** 拥有和维护。

## 1. 规范背景 (Specifications)

实现基于 SD 的蓝牙控制器需要参考 SDA 提供的规范文件（需要 SDA 成员资格或查阅 Simplified 简化版）：
- *SD Memory Card Specification: Part 1 Physical Layer Specification*
- *SDIO Card Specification*
- **SDIO Card Type-A Specification for Bluetooth** (定义了非嵌入式的 HCI 标准接口)
- *SDIO Card Type-B Specification for Bluetooth* (定义了嵌入式接口，控制器内部包含 RFComm/SDP 等上层协议)

## 2. 数据传输模型

蓝牙 SD 传输接口利用了 SD 物理总线的高带宽和块传输 (Block Transfer) 特性，同时也保留了蓝牙 HCI 协议的面向包 (Packet-oriented) 特性。
由于 SD 总线使用的块大小（Block Size）可能小于 HCI 数据包的大小，因此该接口在底层定义了**分段与重组 (Segmentation and Recombination) 协议**。

### 路由与 Service ID

根据 SDIO 规范，功能代码 (Function Code) `0x2` 被分配给支持 **SDIO Type-A for Bluetooth** 的设备。
为了在同一接口上区分并路由不同类型的 HCI 数据包，规范定义了对应的 **Service ID 代码**：

| SDIO Type-A Service ID | Controller 路由目标 |
| :--- | :--- |
| `0x01` | **HCI Command packet** |
| `0x02` | **ACL data** |
| `0x03` | **SCO data** |
| `0x04` | **HCI Event packet** |
| `0x05` | **HCI ISO Data packet** |
| 其他值 | 预留或用于未来扩展 |

## 3. 典型架构

系统架构通常采用如下栈：
```mermaid
graph TD
    A[蓝牙 Host 协议栈] --> B[蓝牙 HCI 驱动]
    B --> C[SD HCI 驱动 (实现 Type-A 接口)]
    C --> D[操作系统 SD 总线驱动]
    D --> |SD 物理总线| E[SDIO 蓝牙设备 (Controller)]
```

> **注意**：由于核心细节属于 SDA 规范，如果需要进行底层 SDIO HCI 驱动开发，必须参考 SDA 发布的最新《SDIO Card Type-A Specification for Bluetooth》。
