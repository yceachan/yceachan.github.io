# 蓝牙传输架构层级 (Transport Architecture Hierarchy)

蓝牙数据传输系统采用分层架构。从底层的无线电波到高层的应用通道，蓝牙定义了一套严密的映射关系。

---

## 1. 通用传输架构 (Generic Transport Architecture)

根据 **Figure 3.1**，蓝牙传输系统分为以下四个核心层级：

1.  **L2CAP 层 (L2CAP Layer)**: 
    *   提供 L2CAP 通道 (L2CAP Channels)。这是面向应用协议（如 ATT, SMP）的直接接口。
2.  **逻辑层 (Logical Layer)**:
    *   **逻辑链路 (Logical Links)**: 提供两个或多个设备间独立的通信路径。
    *   **逻辑传输 (Logical Transports)**: 描述逻辑链路间的相互依赖关系（由于共享资源如 LT_ADDR 或 ARQ 重传机制）。
3.  **物理层 (Physical Layer)**:
    *   **物理链路 (Physical Links)**: 两个设备间建立的物理连接。
    *   **物理信道 (Physical Channels)**: 基础的空中接口（射频频率、跳频序列、时序等）。

---

## 2. 核心层级详解

### 2.1 物理信道 (Physical Channels) - 最底层
物理信道是蓝牙连接的“土壤”，定义了数据如何在空中传输。
*   **BR/EDR**: 包括基本微网信道 (Basic Piconet Channel)、适配微网信道、扫描信道 (Inquiry/Page Scan) 等。
*   **LE**: 包括广播物理信道 (Advertising Channels) 和数据物理信道 (Data Channels)。

### 2.2 物理链路 (Physical Links)
物理链路代表了设备间的一种**双向连接关系**。它与特定的物理信道相关联。
*   例如，在两个连接的设备之间，存在一条活跃的物理链路。

### 2.3 逻辑传输 (Logical Transports) - 关键区分
逻辑传输层是为了解决资源共享和历史兼容性而设计的子层。
*   **常见类型**:
    *   **ACL (Asynchronous Connection-Oriented)**: 异步连接，用于可靠的数据传输（L2CAP 等）。
    *   **SCO (Synchronous Connection-Oriented)**: 同步连接，用于语音等实时性要求高但允许丢包的数据。
    *   **eSCO (Extended SCO)**: 增强型同步连接，支持重传以提高语音质量。
    *   **CIS (Connected Isochronous Stream)**: [LE] 连接态等时流，用于高质量音频传输。
    *   **BIS (Broadcast Isochronous Stream)**: [LE] 广播态等时流。

### 2.4 逻辑链路 (Logical Links)
逻辑链路是逻辑传输之上的抽象，直接承载不同类型的数据流。
*   **ACL-C / LE-C**: 控制逻辑链路，用于链路管理器 (LMP) 或链路层 (LL) 协议信令。
*   **ACL-U / LE-U**: 用户逻辑链路，承载 L2CAP 数据。
*   **SCO-S / eSCO-S**: 用户同步逻辑链路，承载语音数据。

---

## 3. 流量承载映射关系 (Traffic Bearers)

在 **Figure 3.2** 中，蓝牙描述了数据流量类型如何通过这一系列层级进行映射。

| 流量类型 (Traffic Type) | 逻辑链路 (Logical Link) | 逻辑传输 (Logical Transport) |
| :--- | :--- | :--- |
| **可靠分帧用户数据** | LE-U / ACL-U | LE ACL / BR/EDR ACL |
| **高层协议信令** | LE-C / ACL-C | LE ACL / BR/EDR ACL |
| **恒定速率等时用户数据 (语音)** | SCO-S / eSCO-S | SCO / eSCO |
| **LE 广播数据** | ADVB-U / ADVB-C | ADVB (Advertising Broadcast) |
| **LE 音频流 (等时流)** | LE-S / LE-F | CIS / BIS |

---

## 4. 为什么要区分这么多层？ (治理思考)

1.  **多路复用**: 允许在同一物理连接（Physical Link）上同时跑多种逻辑传输（如一边通电话 SCO，一边同步通讯录 ACL）。
2.  **资源管理**: 不同的逻辑传输有不同的调度策略（实时优先 vs. 可靠优先）。
3.  **技术演进**: 每一代的演进（从 BR 到 EDR 再到 LE）往往是在物理信道或逻辑传输层做文章，而保持 L2CAP 通道层相对稳定，降低了软件栈的开发难度。