# LE Audio 知识库概览

> [!note]
> **Ref:** [Docs/LE-Audio/manifests.md](Docs/LE-Audio/manifests.md)

LE Audio 是基于蓝牙低功耗 (Bluetooth Low Energy) 的下一代音频标准，引入了全新的架构和编解码器，支持更高音质、更低功耗以及多流/广播音频功能。

---

## 1. 核心治理路径 (Governance Roadmap)

按照技术依赖关系，我们将按照以下顺序进行知识固化：

1.  **[Codec] LC3 (Low Complexity Communication Codec)**: 基础编解码器规范。
2.  **[Architecture] BAP (Basic Audio Profile)**: 核心单播与广播流程。
3.  **[Common] CAP (Common Audio Profile)**: 通用音频流控制与组管理。
4.  **[Coordination] CSIS (Coordinated Set Identification Service)**: TWS 双耳协同基础。
5.  **[Service] PACS & ASCS**: 发布音频能力与流控制服务。
6.  **[Application] VCP/MCP/CCP**: 音量、媒体、通话控制规范。

---

## 2. 文档资源状态 (Resource Status)

| 规范名称 | 源文件路径 | 状态 | 治理进度 |
| :--- | :--- | :--- | :--- |
| **LC3 v1.0.1** | `Docs/LE-Audio/LC3_v1.0.1.pdf` | 🟢 已就绪 | 待提取 |
| **BAP** | `Docs/LE-Audio/Basic Audio Profile ... .html` | 🟡 HTML版 | 待分析 |
| **CAP/CAS** | `Docs/LE-Audio/Common Audio Service ... .html` | 🟡 HTML版 | 待分析 |
| **Core (ISOC)** | `Docs/Bt-core/` | 🟢 已分片 | 已在 Vol 6 涉及 |

## 2.1 结构化文档索引

- [Codec] `codec/lc3_overview.md`: LC3 编解码器核心特性、延迟与采样率映射。
- [Codec] `codec/lc3_technical_details.md`: LC3 编码器高层架构、MDCT/SNS/TNS 模块解析。
- [Architecture] `overview/bap_architecture.md`: BAP 角色定义 (Unicast/Broadcast) 与 ASCS 状态机。
- [Unicast] `unicast/ascs_ase_control_operations.md`: ASCS 的 ASE 控制指令详解 (Config Codec, Config QoS, Enable, Disable, Release)。

---

## 3. 核心概念 (Key Concepts)

- **ISOC (Isochronous Channels)**: 底层等时传输通道（CIS/BIS）。
- **PACS (Published Audio Capabilities Service)**: 宣告设备支持的 Codec 能力。
- **ASCS (Audio Stream Control Service)**: 控制单播音频流的状态机（ASE）。
- **BAP Unicast**: 一对一连接下的双向音频流。
- **BAP Broadcast (Auracast™)**: 一对多的单向音频广播。
