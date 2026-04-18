---
Title: HCI USB Transport Layer (H2)
Tags: HCI, Transport, USB, H2
---

# HCI USB Transport Layer (H2)

> [!note]
> **Ref:** Bluetooth Core Specification v6.2 - Vol 4, Part B USB Transport Layer

HCI USB 传输层定义了如何通过通用串行总线（USB）传输 HCI 数据包。USB 具有高达几 Gb/s 的高带宽优势，并提供内在的错误检测与修正机制。该传输层常用于 PC 端的蓝牙 Dongle 或主板集成的蓝牙模块。

## 1. 操作模式 (Operating Modes)

控制器可以运行在以下两种模式之一：

1. **Legacy Mode (传统模式)**:
   这是默认及必选支持的模式。不同的 HCI 包类型通过**不同的 USB 端点 (Endpoints)** 进行路由，利用 USB 规范对不同端点类型的传输特性来实现数据传输。在此模式下，未定义如何传输 LE ISO 数据。
   
2. **Bulk Serialization Mode (块序列化模式)**:
   这是一种可选模式。在开启后，**所有类型**的 HCI 数据包（包括 Command, Event, ACL, SCO 以及 ISO 数据）都被打包，并全部通过 **Bulk Endpoints** 发送和接收。通过 USB Select Interface 请求来切换到此模式。

## 2. Legacy Mode 端点映射 (Endpoint Mapping)

在传统模式下，不同类型的 HCI 包严格依赖不同的 USB 端点特性：

| HCI 包类型 | USB 端点类型 (Type) | 建议端点地址 | 方向 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **HCI Commands** | **Control** (控制端点) | `0x00` | Host -> Device | 端点 0 用于设备的配置以及下发 HCI Commands。控制传输有较高优先级和可靠性保障。 |
| **HCI Events** | **Interrupt** (中断端点) | `0x81` (IN) | Device -> Host | 中断端点用于低延迟、周期性的轮询机制上报突发事件。 |
| **HCI ACL Data** | **Bulk** (批量端点) | `0x02` (OUT) / `0x82` (IN) | 双向 | 批量传输提供大数据量、非实时但能保证**数据完整性**的传输（USB 会利用 16-bit CRC 与重传机制保证准确性）。 |
| **HCI SCO Data** | **Isochronous** (同步端点) | `0x03` (OUT) / `0x83` (IN) | 双向 | 同步传输提供**时间确定性**。如果由于干扰产生误码将不提供重传直接丢弃（或覆盖）。具有多种 Alternate Settings 来满足不同语音带宽（如 1/2/3 路 8kHz、mSBC 宽带语音等）。 |

> **端点配置架构**：
> 控制器配置通常包含**两个 Interface (接口)**：
> - **Interface 0**: 包含 Control, Interrupt, Bulk 端点。
> - **Interface 1**: 包含 Isochronous 端点。利用 Alternate settings (备用设置) 在运行时动态调整预留的同步带宽（例如 0 带宽、适应 1 路 SCO 带宽、适应 2 路 SCO 等）。这种分离接口的设计确保了在调整同步带宽时，Interface 0 上的批量/中断传输不必被终止或重传。

## 3. Bulk Serialization Mode (块序列化模式)

为支持新的包类型（如 ISO 数据包）并简化端点模型，定义了 Bulk Serialization 模式。

### 3.1 激活机制
- Controller 在 USB Configuration Descriptor 中为 Interface 0 提供一个**仅包含 Bulk 端点**的备用设置 (Alternate Setting 1)。
- Host 发送 USB `Set Interface` 请求选择此备用设置，从而触发模式切换。
- **约束**: 处于块序列化模式时，Host 如果尝试向 Interface 1 发起带宽调整，或者尝试在 Control Endpoint (EP0) 发送 HCI Commands，Controller 都会返回 USB STALL 予以拒绝。

### 3.2 封包格式
在该模式下，所有流量走 Bulk 端点，由于 USB Bulk 流是字节流，因此采用了与 H4 UART 完全相同的**包指示符 (Packet Indicator)** 前缀机制来区分包类型：

| 包类型 | 指示符 (Indicator) |
| :--- | :--- |
| **HCI Command packet** | `0x01` |
| **HCI ACL Data packet** | `0x02` |
| **HCI Synchronous Data packet** | `0x03` |
| **HCI Event packet** | `0x04` |
| **HCI ISO Data packet** | `0x05` |

## 4. USB 复合设备实现 (Composite Device)

很多时候，蓝牙 Controller 并非作为一个单独的 USB 设备存在，而是与 Wi-Fi 网卡等整合在同一个硬件中。这就涉及复合设备的设计。

当作为 USB 复合设备的一部分时：
1. **Interface Association Descriptor (IAD)**: 必须使用 IAD 来将属于蓝牙控制器的两个 Interface (Interface 0 和 Interface 1) 关联成一个单一的 Function。
2. **命令路由**: Host 必须将封装了 HCI Command 的 USB 控制请求寻址到**指定的 Interface** (即蓝牙接口），而不是整个 Device（`bmRequestType = 0x21`，`wIndex` 指定接口号）。
3. **Class Code**: 必须使用统一指定的 Bluetooth Code（如 Class `0xE0`, SubClass `0x01`, Protocol `0x01`）以匹配通用的蓝牙驱动。

## 5. 限制与考量 (Limitations)

- **电源管理限制**: 在 ACPI 状态下的睡眠唤醒。典型的 PC 主机在 S3 或 S4 休眠状态下会切断 USB 端口电源。这会导致蓝牙在系统唤醒后必须**重新初始化 (Re-initialization)**。为了节省功耗，主机推荐实现 USB 的 LPM (Link Power Management) 以及减少由于高频轮询导致的 C3 状态无法进入的情况。
- **同步端点误码**: 虽然 Bulk 和 Control 可以保证传输可靠，但 Isochronous 同步端点容忍约 10^-13 的位误码率，其数据可能在 USB 总线传输中损坏且不会被重传。
