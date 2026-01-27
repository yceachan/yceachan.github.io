# BlueGemini 蓝牙协议栈知识库 (Knowledge Base Index)

欢迎来到 **BlueGemini**。这是一个基于 *Bluetooth Core Specification v6.2* 和 *HOGP v1.1* 构建的深度技术知识库。本项目旨在为固件工程师、协议栈开发者和应用开发人员提供结构化、可搜索、实战导向的参考文档。

---

## 🗺️ 知识地图 (Knowledge Map)

### 1. 架构总览 (Overview & Architecture)
*宏观视角理解蓝牙协议栈的分层与核心组件。*
- **[协议栈架构总览](Overview/README.md)**: Host, Controller, HCI 划分与 OSI 模型映射。
- **[传输层架构](vol1_architecture/transport_hierarchy.md)**: 物理信道、逻辑链路与 L2CAP 的映射关系。

### 2. Host 层 (主机协议栈)
*运行在主处理器上的高层协议，负责业务逻辑。*

#### 🔗 L2CAP (逻辑链路控制)
- **[L2CAP 通用操作](vol3_host/l2cap_general_operation.md)**: 通道多路复用、分段重组。
- **[L2CAP 包格式](vol3_host/l2cap_packet_formats.md)**: B-Frame, K-Frame 结构解析。

#### 📡 GAP (通用访问配置)
- **[广播数据格式](vol3_host/gap_advertising_data.md)**: 解析 Flags, Local Name, Manufacturer Data。
- **[模式与过程](vol3_host/gap_modes_procedures.md)**: 发现模式、连接模式、自动回连。

#### ⚡ ATT & GATT (属性协议)
- **[ATT 协议深度解析](vol3_host/att_protocol.md)**: PDU 结构、Opcode 字典、MTU 交换。
- **[GATT 概览](vol3_host/gatt_overview.md)**: Client/Server 角色、服务/特征层级。
- **[GATT 交互流程](vol3_host/gatt_procedures.md)**: Read, Write, Notify, Indicate 时序图。

#### 🔐 SMP (安全管理)
- **[配对流程](vol3_host/smp_pairing_process.md)**: Just Works, Passkey, Numeric Comparison。
- **[密钥分发](vol3_host/smp_keys_distribution.md)**: LTK, IRK (隐私), CSRK (签名) 解析。

### 3. HCI 层 (主机-控制器接口)
*连接 Host 与 Controller 的桥梁，调试抓包的核心。*
- **[HCI 包结构](vol4_hci/hci_packet_structures.md)**: Command, Event, ACL, ISO 数据包格式 (H4)。
- **[HCI 初始化与流程](vol4_hci/hci_initialization_flow.md)**: 上电复位、广播开启、连接建立的标准命令序列。

### 4. Controller 层 (链路层与物理层)
*运行在芯片上的实时固件，负责射频交互。*
- **[链路层状态机](vol6_controller/link_layer_states.md)**: Standby, Adv, Scan, Init, Conn 状态切换。
- **[空口包格式](vol6_controller/air_interface_packets.md)**: Uncoded/Coded PHY 包结构，Preamble, Access Addr。
- **[连接建立流程](vol6_controller/connection_establishment.md)**: 详细的空口时序图 (MSC)。
- **[等时通道 (ISO)](vol6_controller/isochronous_channels.md)**: LE Audio 基石，CIS/BIS 与 ISOAL 机制。

### 5. 应用层 (Profiles)
*基于 GATT 的具体应用规范。*

#### ⌨️ HID over GATT (HOGP)
- **[HOGP 架构与规范](profiles/hid/hogp_architecture.md)**: 角色、服务构成、Boot vs Report 模式。
- **[Report Map 实战指南](profiles/hid/hid_report_map_guide.md)**: 手把手教你写 HID 描述符 (键盘/鼠标/多媒体/NKRO)。
- **[HID 设备嵌入式开发](profiles/hid/hid_device_development.md)**: 按键扫描、去抖、GATT 上报策略与功耗优化。

---

## 🛠️ 工具箱 (Toolbox)
*位于 `.gemini/scripts/` 下的自动化脚本。*

- `extract_gatt.py` / `extract_gap.py`: 提取 Core Spec 章节。
- `extract_hci.py`: 提取 HCI 命令定义。
- `extract_isoal.py`: 提取 ISOAL 机制。
- `optimized_split_pdf.py`: PDF 切分工具。

---

*Last Updated: 2026-01-27*
