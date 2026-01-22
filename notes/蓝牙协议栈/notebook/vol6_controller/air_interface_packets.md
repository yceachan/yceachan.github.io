# BLE 空口包格式 (Air Interface Packets)

蓝牙低功耗 (BLE) 定义了两种基础的空口包格式，分别用于 **Uncoded PHY** (LE 1M, LE 2M) 和 **Coded PHY** (LE Coded)。

> 核心规范参考: **Vol 6, Part B, Section 2**

---

## 1. Uncoded PHY 包格式 (LE 1M & LE 2M)

适用于 LE 1M 和 LE 2M 物理层。结构紧凑，所有字段均以相同的符号速率传输。

| 字段 (Field) | 长度 (Length) | 描述 (Description) |
| :--- | :--- | :--- |
| **Preamble** | 1 octet (1M)<br>2 octets (2M) | **前导码**。用于接收机增益控制、时钟同步。它是 0/1 交替的序列 (e.g., `10101010`)。 |
| **Access Address** | 4 octets | **接入地址**。用于标识物理信道。<br>- **广播信道**: 固定为 `0x8E89BED6`。<br>- **数据信道**: 连接建立时生成的随机值。 |
| **PDU** | 2 - 258 octets | **协议数据单元**。承载实际的广播数据或连接数据 (LL Data/Control)。 |
| **CRC** | 3 octets | **循环冗余校验**。用于数据完整性校验。 |
| **CTE** (Optional) | 16 - 160 µs | **恒定音频扩展** (Constant Tone Extension)。仅用于 **AoA/AoD 寻向**功能。 |

---

## 2. Coded PHY 包格式 (LE Coded)

适用于长距离传输 (Long Range)。引入了前向纠错 (FEC)，包含多个编码阶段。

| 字段 (Field) | 编码 (Coding) | 描述 (Description) |
| :--- | :--- | :--- |
| **Preamble** | 无 (Uncoded) | **前导码**。固定为 80 bits 的 `00111100` 重复序列，不经 FEC 编码，以便于远距离检测。 |
| **Access Address** | S=8 | **接入地址**。总是采用最强的 S=8 编码（每个 bit 扩展为 8 个 symbol）。 |
| **CI** (Coding Indicator) | S=8 | **编码指示器**。指示后续 PDU 使用的编码方案 (S=2 或 S=8)。 |
| **TERM1** | S=8 | **终止符 1**。3 bits，用于重置 FEC 编码器状态。 |
| **PDU** | S=2 or S=8 | **协议数据单元**。根据 CI 的指示进行编码。 |
| **CRC** | S=2 or S=8 | **循环冗余校验**。 |
| **TERM2** | S=2 or S=8 | **终止符 2**。3 bits，用于结束 PDU 部分的 FEC 编码。 |

> **注意**: Coded PHY 的前导码非常长且特殊，是为了在极低信噪比下也能被检测到。

---

## 3. 广播物理信道 PDU (Advertising Channel PDU)

无论是广播包还是扫描请求包，PDU 结构都是通用的。

**PDU 结构**:
`[ Header (2 octets) ] + [ Payload (0-255 octets) ]`

### 3.1 PDU Header (16 bits)

| Bit | 字段 (Field) | 描述 (Description) |
| :--- | :--- | :--- |
| **0-3** | **PDU Type** | 广播报文类型 (e.g., `ADV_IND`, `SCAN_REQ`, `CONNECT_IND`)。 |
| **4** | **RFU** | 保留。 |
| **5** | **ChSel** | 通道选择位。指示是否支持 Channel Selection Algorithm #2。 |
| **6** | **TxAdd** | 发送者地址类型 (0=Public, 1=Random)。 |
| **7** | **RxAdd** | 接收者地址类型 (0=Public, 1=Random)。 |
| **8-15** | **Length** | Payload 的长度 (0-255 字节)。 |

### 3.2 常见 PDU 类型

*   **ADV_IND (0000b)**: 通用可连接广播。最常见的广播形式。
*   **ADV_DIRECT_IND (0001b)**: 定向连接广播。快速重连使用。
*   **SCAN_REQ (0011b)**: 扫描请求。Scanner 想获取更多数据时发送。
*   **SCAN_RSP (0100b)**: 扫描响应。Advertiser 对 SCAN_REQ 的回复。
*   **CONNECT_IND (0101b)**: 连接请求。Initiator 发送此包以建立连接。
*   **ADV_EXT_IND (0111b)**: **扩展广播**。v5.0 引入，用于承载更长的数据包，通常指向辅助广播信道 (Auxiliary Packet)。