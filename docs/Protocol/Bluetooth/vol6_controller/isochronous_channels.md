# Isochronous Channels & ISOAL (等时通道详解)

**Isochronous (ISO)** 是蓝牙 5.2 引入的全新传输机制，专为满足音频应用对**时间同步**和**低延迟**的严苛需求而设计。它是 LE Audio 的核心底座。

> **核心参考**: 
> *   *Vol 6, Part G (ISOAL)*
> *   *Vol 6, Part B, Section 4.5.13 (CIS/BIS)*

---

## 1. 架构与数据流 (Architecture)

在 ISO 体系中，数据流经历了从应用层的大包 (SDU) 到空口小包 (PDU) 的转换。

```mermaid
graph TD
    Codec["Audio Codec (e.g., LC3)"] -->|SDU (Service Data Unit)| ISOAL
    
    subgraph Controller
        ISOAL["ISOAL (Adaptation Layer)"] -->|ISO Data PDU| LL["Link Layer"]
        LL -->|Air Packet| PHY["Physical Layer"]
    end

    style ISOAL fill:#f9f,stroke:#333,stroke-width:2px
```

*   **SDU (Service Data Unit)**: 来自上层（如 LC3 编码器）的一帧音频数据。例如 10ms 的音频，大小可能为 40-120 字节。
*   **ISO PDU**: 经过 ISOAL 处理后，适合 Link Layer 调度的数据包。
*   **Air Packet**: 最终在射频上传输的空口包。

---

## 2. ISOAL 的核心职责

**ISOAL (Isochronous Adaptation Layer)** 位于 HCI 接口下方（Controller 内部），它的任务极其关键：**时序适配**。

音频源产生数据的速率（ISO Interval）和空口发送数据的速率（Event Interval）往往不完全一致。ISOAL 提供了两种转换模式：

### 2.1 Unframed PDU (非帧化 PDU)
*   **特点**: 简单、开销小、低延迟。
*   **机制**: 
    *   一个 SDU 被切分为一个或多个 PDU。
    *   PDU 必须在特定的时间窗口内发送完毕。
    *   **不支持** SDU 跨越 PDU 边界（即一个 PDU 只能包含属于同一个 SDU 的数据）。
*   **适用**: 固定比特率、对延迟极其敏感的应用（如助听器）。

### 2.2 Framed PDU (帧化 PDU)
*   **特点**: 灵活、开销稍大（每个分片都有 Header）。
*   **机制**:
    *   数据流被视为连续的字节流。
    *   一个 PDU 可以包含：SDU A 的末尾 + SDU B 的开头。
    *   支持 **Segmentation** (分段) 和 **Reassembly** (重组)。
*   **适用**: 可变比特率、数据产生速率与传输速率解耦的场景。

---

## 3. CIS vs BIS (连接 vs 广播)

Link Layer 定义了两种 ISO 传输拓扑：

| 特性 | CIS (Connected Isochronous Stream) | BIS (Broadcast Isochronous Stream) |
| :--- | :--- | :--- |
| **拓扑** | **点对点 (Point-to-Point)** | **点对多 (Point-to-Multipoint)** |
| **方向** | 双向 (Bi-directional) | 单向 (Unidirectional) |
| **重传** | 支持 (ACK/NAK) | 不支持 (Blind Retransmission) |
| **典型应用** | 通话、游戏耳麦 (TWS) | 公共广播 (Auracast)、音频分享 |
| **同步组** | **CIG** (Connected Isochronous Group) | **BIG** (Broadcast Isochronous Group) |

### 3.1 CIG (Connected Isochronous Group)
一个 CIG 可以包含多个 CIS（例如左耳声道 CIS 1 + 右耳声道 CIS 2）。Link Layer 保证同一个 CIG 内的所有 CIS **严格同步**（微秒级误差），从而实现 TWS 耳机的左右耳完美同步。

### 3.2 BIG (Broadcast Isochronous Group)
一个 BIG 包含多个 BIS。这允许一个发射源（如电视）同时广播多种语言的音轨（英语 BIS, 中文 BIS），或者多声道音频，任意数量的耳机都可以接收。

---

## 4. 关键参数 (Key Parameters)

在配置 ISO 通道时（参考 HCI 命令），你会遇到以下“天书”参数：

*   **ISO Interval**: SDU 产生的间隔（如 10ms）。
*   **FT (Flush Timeout)**: 数据在被丢弃前可以重传多久。FT 越大，可靠性越高，但延迟越大。
*   **BN (Burst Number)**: 每个 ISO Event 中包含的 payload 个数。
*   **NSE (Number of Sub-Events)**: 每个 ISO Interval 中实际安排的传输机会次数。
*   **ISO_Interval / SDU_Interval**: 这两者的关系决定了 ISOAL 如何切分数据。

> **调试提示**: 如果音频断断续续，首先检查 **FT** 是否太小导致重传不够，或者 **ISO Interval** 与音频采样率是否匹配。

---

## 5. 总结

*   **ISOAL** 是音频数据的“包装工”。
*   **CIS** 是双向、可靠的“专线”（电话、游戏）。
*   **BIS** 是单向、高效的“广播塔”（Auracast）。
*   **Unframed** 追求低延迟，**Framed** 追求灵活性。
