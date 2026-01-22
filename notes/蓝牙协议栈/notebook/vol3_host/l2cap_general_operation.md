# L2CAP 核心机制 (General Operation & Channels)

L2CAP (Logical Link Control and Adaptation Protocol) 是蓝牙 Host 层的多路复用器。它位于 HCI 之上，负责将来自上层协议（如 ATT, SMP, SDP）的数据流复用到底层的逻辑链路（ACL/LE-U）上。

> 核心规范参考: **Vol 3, Part A, Section 2 & 10**

---

## 1. 通道标识符 (Channel Identifiers - CID)

L2CAP 使用 **CID (2 octets)** 来标识逻辑通道。

### 1.1 CID 空间划分

| CID 值 | 描述 (Description) | 用途 |
| :--- | :--- | :--- |
| `0x0000` | Null Identifier | 非法，不可用。 |
| `0x0001` | **L2CAP Signaling Channel** | **BR/EDR 信令通道**。用于连接建立、配置请求等。 |
| `0x0002` | Connectionless Channel | 无连接数据通道（仅 BR/EDR）。 |
| `0x0003` | AMP Manager Protocol | AMP 管理协议。 |
| `0x0004` | **Attribute Protocol (ATT)** | **ATT 通道**。所有 GATT 读写操作都走这里。 |
| `0x0005` | **LE L2CAP Signaling Channel** | **BLE 信令通道**。用于 LE 连接参数更新、LE 信用流控通道建立。 |
| `0x0006` | **Security Manager Protocol (SMP)** | **SMP 通道**。用于 BLE 配对和密钥分发。 |
| `0x0007` | BR/EDR Security Manager | BR/EDR 安全管理。 |
| `0x0020-0x003F` | Assigned Numbers | 保留给标准服务。 |
| `0x0040-0xFFFF` | **Dynamically Allocated** | **动态分配通道**。用于特定的 L2CAP 连接（如 CoC）。 |

---

## 2. 操作模式 (Modes of Operation)

L2CAP 支持多种操作模式，但在 BLE 开发中，我们主要关注以下两种：

### 2.1 Basic L2CAP Mode (基本模式)
*   **默认模式**。
*   **特点**: 无流量控制，无重传。
*   **适用场景**: 
    *   ATT, SMP 等固定通道默认使用此模式。
    *   极其依赖底层 Controller 的可靠性（ACL 链路本身的 ARQ 重传）。
*   **MTU**: 默认最小 MTU 为 23 字节 (LE)。

### 2.2 LE Credit Based Flow Control Mode (LE 信用流控模式)
*   **用途**: 用于在 BLE 上建立面向连接的数据通道 (LE L2CAP Connection Oriented Channels - **CoC**)。
*   **机制**: 
    *   **信用分 (Credits)**: 接收方发送“信用分”给发送方（例如：我有空间接收 5 个包）。
    *   **消耗**: 发送方每发一个 PDU 消耗 1 个信用分。
    *   **耗尽**: 信用分归零时，发送方必须停止发送，直到收到新的信用分。
*   **优势**: 允许应用层直接进行大数据传输（如对象传输 OTS），支持分段和重组，且不需要像 ATT 那样每发一个包都等待应用层确认。

---

## 3. 分段与重组 (Segmentation & Reassembly)

L2CAP 的核心职责之一是将上层的大数据包（SDU - Service Data Unit）适配到底层的小数据包（PDU - Protocol Data Unit）。

*   **Segmentation (分段)**: 当 SDU 大于 PDU 的 Payload 时，L2CAP 将其切分为多个 PDU。
    *   *注意*: 在 Basic Mode 下，L2CAP 不支持分段（SDU 必须 <= MTU）。分段主要用于流控模式。
*   **Reassembly (重组)**: 接收方将多个 PDU 重新组装成原始的 SDU。

---

## 4. 总结：BLE 开发者需要知道什么？

1.  **ATT/GATT 走的是固定通道 0x0004**。如果你在做标准的特征值读写，你实际上是在使用 Basic Mode。
2.  **MTU 交换很重要**。默认 MTU 很小（23 字节），为了提高吞吐量，Central 和 Peripheral 在连接初期通常会进行 **Exchange MTU** 流程（ATT 层），协商一个更大的 MTU（如 247 或 512）。
3.  **L2CAP CoC (0x0040+)** 是传输大量数据的“高速公路”。如果你觉得 GATT notify/write 效率低或开销大，可以考虑建立 L2CAP CoC 通道。