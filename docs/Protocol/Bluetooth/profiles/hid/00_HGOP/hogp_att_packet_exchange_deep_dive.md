# HOGP 初始化中的 ATT 报文交换详解

**文档目标**: 本文档是 [HOGP 设备完整初始化流程](hogp_device_initialization_flow.md) 的配套技术深潜篇。它专注于协议栈的 **ATT (Attribute Protocol) 层**，通过具体的 PDU (Protocol Data Unit) 示例，详细展示服务发现与配置过程中的底层报文交换。

**前置知识**: 读者应已理解 HOGP 初始化的宏观流程。本文档假定设备与主机已完成 **连接** 与 **加密**。

---

## 1. 核心目标：构建 Handle 映射表

GATT 操作依赖于 Handle，而规范定义的是 UUID。主机在初始化阶段的核心任务，就是构建一个从 UUID 到具体 Handle 的映射表，并缓存在本地。

**目标映射表示例**:
| 逻辑功能 | 标准 UUID | 发现的 Handle |
| :--- | :--- | :--- |
| HID Service | `0x1812` | `0x0010` - `0x0025` |
| DIS Service | `0x180A` | `0x0026` - `0x0030` |
| Report (Input) | `0x2A4D` | `0x0015` |
| CCCD (for Report) | `0x2902` | `0x0016` |
| Report Map | `0x2A4B` | `0x0019` |
| PnP_ID | `0x2A50` | `0x002A` |

---

## 2. 阶段一：服务发现 (Primary Service Discovery)

主机问：“你有 HID 服务(`0x1812`)、DIS 服务(`0x180A`)吗？在哪？”

### 请求：Read By Group Type Request

*   **ATT Opcode**: `0x10`
*   **Handle Range**: `0x0001` - `0xFFFF` (全范围搜索)
*   **Attribute Type**: `0x2800` (Primary Service)

### 响应：Read By Group Type Response

设备返回它拥有的所有主服务列表。主机遍历此列表，找到自己关心的服务及其 Handle 范围。

*   **ATT Opcode**: `0x11`
*   **Data Entry Format**: `[Start Handle (2B), End Handle (2B), Service UUID (2B/16B)]`

**ATT PDU 示例 (找到 HID 服务)**:
```
// Request: Search all handles for Primary Services
// Op(1)  Start(2)  End(2)   Type(2)
   10   01 00   FF FF   00 28

// Response: Found one service
// Op(1)  Len(1) Start(2)  End(2)   UUID(2)
   11     06   10 00   25 00   12 18
```
> **结论**: 主机得知 HID 服务位于 `0x0010` - `0x0025`。后续将在此范围内查找特征。DIS 和 BAS 的发现过程与此完全相同。

---

## 3. 阶段二：特征发现 (Characteristic Discovery)

主机问：“在 HID 服务范围内，都有哪些具体的特征？”

### 请求：Read By Type Request

*   **ATT Opcode**: `0x08`
*   **Handle Range**: `0x0010` - `0x0025` (先前发现的 HID 服务范围)
*   **Attribute Type**: `0x2803` (Characteristic Declaration)

### 响应：Read By Type Response

设备返回该服务下的所有特征声明。这是**UUID 与 Handle 绑定的关键时刻**。

*   **ATT Opcode**: `0x09`
*   **Data Entry Format**: `[Decl Handle(2B), Properties(1B), Value Handle(2B), UUID(2B/16B)]`

**ATT PDU 示例 (返回两个特征)**:
```
// Request: In handle 0x10-0x25, find all Characteristic Declarations
// Op(1)  Start(2)  End(2)   Type(2)
   08   10 00   25 00   03 28

// Response: Found Report and Report Map
// Op Len  DeclH  Props ValH   UUID     DeclH  Props ValH   UUID
   09 07  14 00   12   15 00  4D 2A    18 00   02   19 00  4B 2A
//        ^--Report Decl--^ ^-Report-^  ^--Map Decl-----^ ^-Map-^
```
> **结论**: 主机记下：`Report(0x2A4D)` 的值句柄是 `0x0015`；`Report Map(0x2A4B)` 的值句柄是 `0x0019`。

---

## 4. 阶段三：描述符发现 (Descriptor Discovery)

主机问：“对于 Handle `0x0015` 这个 Report，它还有哪些附加信息（如CCCD）？”

### 请求：Find Information Request

*   **ATT Opcode**: `0x04`
*   **Handle Range**: `0x0016` - `0x0017` (特征值句柄之后，到下一个特征声明句柄之前)

### 响应：Find Information Response

设备返回该范围内的所有描述符。

*   **ATT Opcode**: `0x05`
*   **Data Entry Format**: `[Handle(2B), UUID(2B)]`

**ATT PDU 示例 (找到 CCCD 和 Report Reference)**:
```
// Request: In handle 0x16-0x17, find all descriptors
// Op(1)  Start(2)  End(2)
   04   16 00   17 00

// Response: Found CCCD and Report Reference
// Op Fmt   Handle  UUID    Handle  UUID
   05 01   16 00  02 29   17 00  08 29
//         ^-CCCD-^ ^-CCCD-^ ^-Ref-^  ^-Ref-^
```
> **结论**: 主机记下：`Report(0x0015)` 的 `CCCD` 在 `0x0016`，`Report Reference` 在 `0x0017`。

---

## 5. 阶段四：读取长特征值 (Reading Long Values)

`Report Map` 通常很长，无法在一个 ATT PDU 中传完 (默认 MTU=23)。

### 5.1 首次读取：Read Request

*   **请求 PDU**: `[Op(0x0A), Handle(0x0019)]` -> `0A 19 00`
*   **响应 PDU**: 设备返回 MTU-1 (22) 字节的数据。`[Op(0x0B), Data(22B)]`

### 5.2 后续读取：Read Blob Request

主机发现响应长度等于 MTU-1，意味着数据没读完，发起“长读”请求。

*   **请求 PDU**: `[Op(0x0C), Handle(0x0019), Offset(0x0016)]` -> `0C 19 00 16 00`
    * Offset `0x0016` = 22，即上次读完的位置。
*   **响应 PDU**: `[Op(0x0D), Data(...)]`

此过程循环，直到收到的数据长度小于 MTU-1。

---

## 6. 阶段五：配置与使能 (Configuration)

最后，主机通过写操作来激活设备。

### 6.1 (可选) 写命令：Write Command (无响应)

用于不需要确认的操作，如切换 Protocol Mode。

*   **请求 PDU**: `[Op(0x52), Handle(0x0012), Value(0x01)]` -> `52 12 00 01`

### 6.2 写请求：Write Request (需响应)

用于关键配置，如开启通知。这是**激活数据上报的关键**。

*   **请求 PDU**: `[Op(0x12), Handle(0x0016), Value(0x0001)]` -> `12 16 00 01 00`
    * Opcode `0x12` = Write Request
    * Handle `0x0016` = CCCD 的句柄
    * Value `0x0001` = 使能 Notification

*   **响应 PDU**: `[Op(0x13)]` -> `13`
    * Opcode `0x13` = Write Response

> **注意**: 设备只有在成功处理 `Write Request` 并发送 `Write Response` 后，才有权开始发送 `Handle Value Notification` (`0x1B`) 报文。

---
此文档详细记录了 ATT 层的交互细节，可作为固件开发和蓝牙抓包分析的精确参考。
