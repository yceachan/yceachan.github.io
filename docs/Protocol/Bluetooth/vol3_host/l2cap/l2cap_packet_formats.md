# L2CAP 数据包格式 (Packet Formats)

L2CAP 的数据包结构取决于其操作模式。对于 BLE 开发者，最重要的是 **B-Frame** 和 **K-Frame**。

> 核心规范参考: **Vol 3, Part A, Section 3**

---

## 1. B-Frame (Basic Information Frame)

用于 **Basic L2CAP Mode**。这是 ATT, SMP 以及大多数信令通道使用的数据包格式。

**结构:**
`[ Length (2) ] [ Channel ID (2) ] [ Information Payload (0-65535) ]`

| 字段 (Field) | 长度 (Octets) | 描述 |
| :--- | :--- | :--- |
| **Length** | 2 | **Information Payload** 的长度。注意：不包含 Length 和 CID 字段本身的长度。 |
| **Channel ID (CID)** | 2 | 目标通道标识符 (例如 `0x0004` for ATT)。 |
| **Payload** | N | 上层协议数据 (SDU)。在 Basic Mode 下，Payload 必须是一个完整的 SDU（不支持分段）。 |

> **关键点**: B-Frame 的最大负载受限于 `MTU`。

---

## 2. K-Frame (LE Information Frame)

用于 **LE Credit Based Flow Control Mode**。支持分段和重组。

**结构:**
`[ Length (2) ] [ Channel ID (2) ] [ SDU Length (2) ] [ Information Payload ]`

| 字段 (Field) | 长度 (Octets) | 描述 |
| :--- | :--- | :--- |
| **Length** | 2 | 整个 PDU Payload (包含 SDU Length 字段) 的长度。 |
| **Channel ID (CID)** | 2 | 目标通道标识符 (动态分配的 CID)。 |
| **SDU Length** | 2 | **仅出现在第一个分段 (Start Fragment)**。指示整个原始 SDU 的总长度。后续的分段不包含此字段。 |
| **Payload** | N | SDU 的一部分。 |

### 2.1 K-Frame 的分段逻辑

当上层要发送一个巨大的 SDU (例如 1000 字节)，而底层的 PDU 大小限制为 250 字节时：

1.  **First PDU**:
    *   Length = 250
    *   SDU Length = 1000
    *   Payload = SDU 的前 248 字节 (250 - 2 SDU_Len)
2.  **Next PDU**:
    *   Length = 250
    *   Payload = SDU 的接下来的 250 字节
    *   *(无 SDU Length 字段)*
3.  **Last PDU**:
    *   ...直到传完。

---

## 3. 信令包 (Control Frame / C-Frame)

用于 **Signaling Channel** (`0x0001` or `0x0005`)。用于传输命令，如连接请求、更新参数。

**结构:**
`[ B-Frame Header ] + [ Command 1 ] + [ Command 2 ] ...`

每个 **Command** 的结构：
`[ Code (1) ] [ Identifier (1) ] [ Length (2) ] [ Data ]`

*   **Code**: 命令类型 (e.g., `0x12` = Connection Parameter Update Request)。
*   **Identifier**: 事务 ID，用于匹配请求和响应。
*   **Length**: Data 字段的长度。