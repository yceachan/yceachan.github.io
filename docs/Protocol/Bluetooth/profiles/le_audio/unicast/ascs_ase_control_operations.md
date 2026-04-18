# BAP 单播音频流控制 (ASE Control Operations)

> [!note]
> **Ref:** [Docs/LE-Audio/Basic Audio Profile ... .html](Docs/LE-Audio/Basic Audio Profile _ Bluetooth® Technology Website.html) (Section 5.6)

在 LE Audio 单播模式中，**Unicast Client** 通过写入 **Unicast Server** 暴露的 **ASE Control Point** (Audio Stream Endpoint Control Point) 特征来发起对 ASE 的状态控制。

这些控制操作遵循 ASCS (Audio Stream Control Service) 定义的状态机，实现对音频编码器、QoS 和数据流生命周期的管理。

---

## 1. 核心控制操作概览 (Control Operations)

Unicast Client 可以发起以下操作，每次操作可能触发 ASE 状态机的转移：

| 操作名称 | 目标状态要求 | 主要功能 |
| :--- | :--- | :--- |
| **Config Codec** | Idle, Codec Configured, QoS Configured | 提交设备支持的音频编解码器参数（如 LC3 的采样率、帧时长）。 |
| **Config QoS** | Codec Configured, QoS Configured | 提交服务质量 (QoS) 参数（如 SDU 间隔、最大延迟、重传次数），并**绑定 CIS (CIG_ID / CIS_ID)**。 |
| **Enable** | QoS Configured | 使能 ASE，可提供 `Streaming_Audio_Contexts` (如 Media, Conversational) 供 Server 验证。 |
| **Update Metadata**| Enabling, Streaming | 动态更新元数据（如改变音频上下文类型），无需断开音频流。 |
| **Disable** | Enabling, Streaming | 禁用 ASE，准备停止流。可选择是否断开底层 CIS。 |
| **Release** | Codec Config, QoS Config, Enabling, Disabling, Streaming | 释放 ASE 及其所有关联资源，并**必须断开关联的 CIS**。 |

---

## 2. 状态转移详解 (State Transitions)

### 2.1 Codec Configuration (配置编解码器)
- **触发条件**: 客户端发起 `Config Codec` 操作。
- **流程**:
    1. Client 读取 Server 支持的参数，向 ASE Control Point 写入配置。
    2. Server 接受后，通过 Notification 通知客户端，此时 ASE 进入 `Codec Configured` 状态。
    3. 在此状态下，Server 会暴露出其偏好的 QoS 范围（Preferred QoS Range）。

### 2.2 QoS Configuration (配置 QoS 与绑定 CIS)
- **触发条件**: 客户端发起 `Config QoS` 操作。
- **前置动作**: 客户端必须在底层 Controller 配置好 CIS（通过 HCI `LE Set CIG Parameters`）。
- **流程**:
    1. Client 写入 QoS 参数，同时将 `CIG_ID` 和 `CIS_ID` 绑定到该 ASE。
    2. Server 接受并通知 Client，ASE 进入 `QoS Configured` 状态。
- **注意**: 一个 CIS 只能绑定到一个 Sink ASE 和/或一个 Source ASE（双向音频）。

### 2.3 Enabling (使能 ASE 与 CIS 建立)
- **触发条件**: 客户端发起 `Enable` 操作。
- **流程**:
    1. Client 提供 `Metadata`（包含 `Streaming_Audio_Contexts`）。
    2. Server 检查上下文是否支持且可用。若通过，ASE 进入 `Enabling` 状态。
    3. **CIS Establishment**: 在此时，Client 将通过 HCI `LE Create CIS` 命令真正建立底层的等时连接。
    4. 建立完成后，双端设置音频数据路径（Data Path Setup），Server 进入 `Streaming` 状态 (针对 Sink) 或等待 `Receiver Start Ready`。

### 2.4 Update Metadata (更新元数据)
- **触发条件**: 客户端发起 `Update Metadata` 操作。
- **场景**: 在 `Enabling` 或 `Streaming` 状态下，Client 需要更改音频类型（例如从听音乐切换到打电话），只需发送新 Metadata 而不中断流。

### 2.5 Disabling & Releasing (禁用与释放)
- **Disable**:
    - 将状态退回到 `QoS Configured` (Sink) 或 `Disabling` (Source)。
    - **不强制**要求断开底层的 CIS，保留了快速恢复音频流的能力。
- **Release**:
    - 无论 ASE 处于何种活跃状态，强制退回到 `Releasing` 然后回到 `Idle`。
    - **强制要求** Client 终止底层的 CIS，并移除所有音频数据路径。

---

## 3. 并发控制与响应超时

- **批量操作**: Client 可以通过一次写操作（如需可使用 Write Long Characteristic Values）对多个 ASE (如同一个 CIG 内的左右耳) 同时发起 `Config QoS`。
- **超时机制**: Client 发起操作后，如果在合理时间（建议最小 1 秒）内没有收到 Server 的 Notification，Client 应当主动读取 ASE 特征值来确认状态。
- **合法性**: Client 绝对不允许发起非法的状态跳转请求，必须严格遵循 ASCS 的状态机。
