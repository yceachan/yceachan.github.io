# 蓝牙协议栈知识库项目 (Bluetooth Protocol Stack Knowledge Base)

**项目代号**: BlueGemini
**核心真理来源**: `Bluetooth Core Specification v6.2` (PDF)
**目标用户**: 蓝牙固件工程师、协议栈开发者、应用开发人员。
**输出语言**: **中文 (Chinese)** (保留英文专业术语)。

---

## 1. 项目架构 (Project Architecture)

本项目将庞大的 PDF 规范解构为三个层级：

1.  **源数据层 (`Bluetooth_Knowledge_Base/`)**: 
    *   基于 Vol/Part 结构切分后的 PDF 原文。
    *   *Agent 须知*: 严禁全量读取原始大文件。读取时必须通过索引找到对应的 `source.pdf`。
2.  **知识层 (`notebook/`)**: 
    *   经过治理、提炼、结构化的 Markdown 笔记。
    *   包含 Mermaid 图表、核心概念解析、协议交互流程。
3.  **工具层 (`.gemini/scripts/`)**: 
    *   用于自动化处理 PDF、提取文本、验证数据的 Python 脚本库。

---

## 2. 工具库清单 (Toolbox & Scripts)

新会话开始时，请优先使用以下脚本进行自动化操作。所有脚本均位于 `.gemini/scripts/`。

| 脚本名 | 功能描述 | 典型用法 |
| :--- | :--- | :--- |
| **`optimized_split_pdf.py`** | **PDF 切分器**。基于 XML 索引将 Core Spec 大文件切分为 Part 级小文件。 | `python .gemini/scripts/optimized_split_pdf.py` |
| **`validate_kb_pdfs.py`** | **完整性校验**。检查切分后的 PDF 是否损坏，必要时自动清理。 | `python .gemini/scripts/validate_kb_pdfs.py` |
| **`extract_gatt.py`** | **GATT 提取器**。从 Vol 3 Part G 提取 GATT 角色、层级和流程。 | 模板脚本，可复制修改用于其他章节提取。 |
| **`extract_l2cap.py`** | **L2CAP 提取器**。提取 Vol 3 Part A 的通道和包结构。 | 同上。 |
| **`extract_msc.py`** | **MSC 提取器**。提取 Vol 6 Part D 的时序图文本描述。 | 用于辅助绘制 Mermaid 时序图。 |
| **`extract_le_controller.py`** | **Controller 提取器**。提取 LL 状态机和空口包格式。 | - |
| **`extract_transport_arch.py`** | **架构提取器**。提取 Vol 1 的传输层级架构。 | - |

> **开发提示**: 当你需要从新的章节提取内容时，请参考 `extract_gatt.py` 作为模板，修改页码范围 (Range) 和输出路径即可。

---

## 3. 知识治理进度 (Progress Snapshot)

*最后更新: 2026-01-23*

### ✅ 已完成 (Done)
*   **Vol 0 Overview**:
    *   `notebook/overview/README.md`: 协议栈宏观架构、OSI 映射、Mermaid 架构图。
*   **Vol 1 Architecture**:
    *   `notebook/vol1_architecture/transport_hierarchy.md`: 物理信道 -> 逻辑链路 -> L2CAP 的层级映射。
*   **Vol 3 Host**:
    *   `notebook/vol3_host/l2cap_general_operation.md`: CID 分配、Basic/FlowControl/LE-Credit 模式。
    *   `notebook/vol3_host/l2cap_packet_formats.md`: B-Frame, K-Frame 结构。
    *   `notebook/vol3_host/att_protocol.md`: PDU 结构、Opcode 字典、MTU 交换与错误码。
    *   `notebook/vol3_host/gatt_overview.md`: Client/Server 角色, Attribute 结构, Service 层级。
    *   `notebook/vol3_host/gatt_procedures.md`: Read/Write/Notify/Indicate 交互流程。
    *   `notebook/vol3_host/gap_advertising_data.md`: 广播数据格式 (Flags, Local Name, UUIDs)。
    *   `notebook/vol3_host/gap_modes_procedures.md`: 发现模式 (Discoverable)、连接模式 (Connectable) 与 安全模式。
    *   `notebook/vol3_host/smp_pairing_process.md`: 配对流程 (Phase 1-3), Just Works vs Passkey。
    *   `notebook/vol3_host/smp_keys_distribution.md`: 密钥类型 (LTK, IRK, CSRK) 与分发。
*   **Vol 4 HCI**:
    *   `notebook/vol4_hci/hci_packet_structures.md`: Command, Event, ACL/ISO Data 包结构与 H4 协议。
    *   `notebook/vol4_hci/hci_initialization_flow.md`: 初始化流程与核心命令映射。
*   **Vol 6 LE Controller**:
    *   `notebook/vol6_controller/link_layer_states.md`: 7 种 LL 状态机 (Standby, Adv, Conn, etc.)。
    *   `notebook/vol6_controller/air_interface_packets.md`: Uncoded/Coded PHY 包格式, PDU Header。
    *   `notebook/vol6_controller/connection_establishment.md`: 广播与连接建立的详细 Mermaid 时序图。
    *   `notebook/vol6_controller/isochronous_channels.md`: CIS/BIS 与 ISOAL 机制 (LE Audio)。
*   **Profiles (Application Layer)**:
    *   `notebook/profiles/hid/hogp_architecture.md`: HOGP 架构与服务依赖 (v1.1 ISO Support)。
    *   `notebook/profiles/hid/hid_report_map_guide.md`: Report Descriptor 实战与字节码解析。
    *   `notebook/profiles/hid/hid_device_development.md`: 嵌入式开发指南 (扫描、上报、功耗)。

### ⏳ 待办 (To-Do)
*   **Maintenance**: 随着 Spec 更新持续维护。
*   **More Profiles**: 扩展至 HRP (Heart Rate), FTMS (Fitness Machine) 等。
*   **Advanced Controller**: Channel Sounding (v6.0) 深度实战。

---

## 4. 标准作业程序 (SOP)

在新会话中治理新章节时，请遵循以下步骤：

1.  **定位资源**:
    *   查阅根目录下的 `Bluetooth_Core_v6.2_Index.md` 或读取 `Bluetooth_Knowledge_Base/` 目录结构，找到目标 Part 的 `source.pdf` 路径。
    *   读取该 Part 目录下的 `README.md`，获取精确的**内部页码 (Internal Page Numbers)** 索引。

2.  **提取内容**:
    *   **不要**试图一次性读取整个 PDF。
    *   复制并修改 `.gemini/scripts/extract_template.py` (或参考现有的 `extract_gatt.py`)。
    *   设置准确的 `Page Range`。
    *   运行脚本将原始文本提取到 `notebook/xxx/xxx_raw.md` 或直接生成目标文件。

3.  **知识重构**:
    *   读取提取的原始文本。
    *   使用 Markdown 重写，要求：
        *   **结构清晰**: 使用 H1/H2/H3 标题。
        *   **中文输出**: 翻译并解释核心概念，但保留英文术语 (如 "Advertising Interval")。
        *   **图表化**: 遇到流程、状态机、层级结构，必须使用 **Mermaid** 绘制。
        *   **表格化**: 遇到参数列表、PDU 结构，使用 Markdown 表格。

4.  **文件归档**:
    *   将治理好的文件保存在 `notebook/` 下对应的分类目录中。