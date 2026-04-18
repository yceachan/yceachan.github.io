# HCI Packet Structures (HCI 包结构详解)

**HCI (Host Controller Interface)** 是蓝牙 Host（协议栈）与 Controller（芯片）之间标准化的通信协议。无论底层物理接口是 UART、USB 还是 SDIO，HCI 层定义的数据包格式是统一的。

> **核心参考**: *Bluetooth Core Spec v6.2, Vol 4, Part E, Section 5.4*

---

## 1. 物理传输与 H4 协议 (H4 Transport)

在嵌入式系统中最常见的 UART 接口上，使用 **H4 协议** 进行封包。H4 协议非常简单：**在每个 HCI 包的最前面加一个字节的 Packet Indicator**，用来指示后续数据的类型。

| Packet Indicator | Type | Direction | Description |
| :--- | :--- | :--- | :--- |
| **0x01** | **HCI Command** | Host -> Controller | 主机发送命令（如“开始广播”）。 |
| **0x02** | **HCI ACL Data** | Bidirectional | 异步数据传输（如 L2CAP 数据包）。 |
| **0x03** | **HCI SCO Data** | Bidirectional | 同步音频数据（经典蓝牙语音）。 |
| **0x04** | **HCI Event** | Controller -> Host | 控制器上报事件（如“扫描结果”）。 |
| **0x05** | **HCI ISO Data** | Bidirectional | 等时数据传输（LE Audio 核心）。 |

---

## 2. Command Packet (Type 0x01)

Host 发送给 Controller 的控制指令。

**结构**:
`Opcode (2 bytes) | Parameter Total Length (1 byte) | Parameters (Variable)`

### 2.1 Opcode 解析
Opcode 由两部分组成：
*   **OGF (Opcode Group Field)**: 高 6 bit。指示命令分类（如 Link Control, LE Controller 等）。
*   **OCF (Opcode Command Field)**: 低 10 bit。该组内的具体命令 ID。

**常见 OGF**:
*   `0x03`: Controller & Baseband (如 Reset)
*   `0x08`: LE Controller (如 LE Set Adv Enable)

> **示例 (LE Set Adv Enable)**:
> *   Opcode: `0x200A` (OGF=0x08, OCF=0x000A)
> *   Little Endian: `0A 20`

---

## 3. Event Packet (Type 0x04)

Controller 上报给 Host 的状态变化或命令结果。

**结构**:
`Event Code (1 byte) | Parameter Total Length (1 byte) | Parameters (Variable)`

**常见 Event Code**:
*   `0x0E`: **Command Complete**。命令执行完毕，带返回值。
*   `0x0F`: **Command Status**。命令已启动（异步），后续会有其他 Event。
*   `0x3E`: **LE Meta Event**。所有 BLE 相关事件都共享这一个 Event Code，通过子事件代码 (Subevent Code) 区分。

---

## 4. ACL Data Packet (Type 0x02)

用于传输 L2CAP 数据（ATT, SMP, GAP 数据都封装在这里）。

**结构**:
`Handle & Flags (2 bytes) | Data Total Length (2 bytes) | Data (Variable)`

### 4.1 Handle & Flags
这是一个 16-bit 字段：
*   **Connection Handle**: 低 12 bit。
*   **PB Flag (Packet Boundary)**: Bit 12-13。
    *   `00`: First non-automatically-flushable packet (Start of L2CAP PDU).
    *   `01`: Continuing fragment (L2CAP PDU 后续分片).
    *   `10`: First automatically-flushable packet.
*   **BC Flag (Broadcast Flag)**: Bit 14-15。通常为 `00` (Point-to-Point)。

---

## 5. 抓包实例 (Analysis Example)

假设你在 UART Log 中看到以下 Hex 数据：
`01 03 0C 00`

**解析**:
1.  **01**: Packet Type = Command.
2.  **03 0C**: Opcode = `0x0C03` (Little Endian).
    *   OGF = `0x0C03 >> 10` = `0x03` (Controller & Baseband).
    *   OCF = `0x0C03 & 0x3FF` = `0x03` (Reset).
    *   查表得知：**HCI_Reset**.
3.  **00**: Length = 0。没有参数。

Controller 随后回复：
`04 0E 04 01 03 0C 00`

**解析**:
1.  **04**: Packet Type = Event.
2.  **0E**: Event Code = Command Complete.
3.  **04**: Length = 4 bytes.
4.  **01**: Num HCI Command Packets = 1 (Controller 还能接收 1 个命令).
5.  **03 0C**: Opcode = `0x0C03` (对应的命令是 Reset).
6.  **00**: Status = Success.

---

## 6. ISO Data Packet (Type 0x05) [LE Audio]

**v5.2+** 引入，用于 LE Audio 的流媒体传输。

**结构**:
`Handle & Flags (2 bytes) | Data Load Length (12-14 bits) | ... | ISO SDU`

*   包含 **Time Stamp** 和 **Packet Sequence Number**，用于保证音频同步。
