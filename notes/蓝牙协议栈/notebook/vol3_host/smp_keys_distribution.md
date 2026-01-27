# SMP Key Distribution (密钥分发与管理)

在配对的 **Phase 3**，双方会交换一系列密钥，用于后续的加密通信、隐私地址解析和数据签名。理解这些密钥的用途对于管理设备绑定关系 (Bonding Information) 至关重要。

> **核心参考**: *Bluetooth Core Spec v6.2, Vol 3, Part H, Section 2.4*

---

## 1. 密钥类型详解 (Key Types)

BLE 安全模型中定义了三种核心的分布式密钥：

| Key | Full Name | Size | Purpose |
| :--- | :--- | :--- | :--- |
| **LTK** | **Long Term Key** | 128-bit | **数据加密**。用于生成会话密钥 (Session Key)，加密链路层的数据包。 |
| **IRK** | **Identity Resolving Key** | 128-bit | **隐私地址解析**。用于解析对方的 Resolvable Private Address (RPA)，识别设备真实身份。 |
| **CSRK** | **Connection Signature Resolving Key** | 128-bit | **数据签名**。用于对未加密链路上的数据进行签名验证 (Signed Write)。 |

> **注意**: 在 **LE Secure Connections** 模式下，LTK 是在 Phase 2 通过 ECDH 算法生成的，不会在 Phase 3 空口传输。Phase 3 只分发 IRK 和 CSRK。而在 **Legacy Pairing** 中，LTK 可能通过空口分发。

---

## 2. 辅助数据 (Auxiliary Data)

除了密钥本身，还有一些辅助数据用于索引或验证：

*   **EDIV (Encrypted Diversifier)**: 16-bit
*   **Rand (Random Number)**: 64-bit
*   **用途**: 在 Legacy Pairing 中，LTK 存储在数据库中，Controller 使用 `EDIV` 和 `Rand` 来查找对应的 LTK。
*   **Identity Address**: 设备的真实 MAC 地址（Public 或 Static Random），与 IRK 一起分发，将“可变地址”与“固定身份”绑定。

---

## 3. 密钥分发流程 (Distribution Flow)

在 `Pairing Request` 和 `Pairing Response` 数据包中，有两个字段定义了双方希望分发/接收哪些密钥：

*   `Initiator Key Distribution` (1 Byte)
*   `Responder Key Distribution` (1 Byte)

| Bit | Key |
| :--- | :--- |
| 0 | EncKey (LTK + EDIV + Rand) |
| 1 | IdKey (IRK + Identity Address) |
| 2 | SignKey (CSRK) |
| 3-7 | Reserved |

**典型交互**:

1.  **Negotiation**: 手机 (Initiator) 说：“我要给你我的 IRK，你也给我你的 IRK。”
2.  **Phase 3 Execution**: 链路加密后，双方轮流发送：
    *   Central -> Peripheral: `Identity Information (IRK)`
    *   Central -> Peripheral: `Identity Address Information (Addr)`
    *   Peripheral -> Central: `Identity Information (IRK)`
    *   Peripheral -> Central: `Identity Address Information (Addr)`

---

## 4. 隐私地址解析 (Privacy & IRK)

这是 IRK 最核心的用途。现代 BLE 设备（如 iPhone, Android 手机）为了防止被追踪，会使用 **Resolvable Private Address (RPA)**，即每隔一段时间（如 15 分钟）变换一次 MAC 地址。

**原理**:
1.  设备生成 RPA: `Hash = aes128(IRK, prand)`。
2.  设备广播 RPA。
3.  已绑定的手机收到 RPA。
4.  手机遍历本地存储的所有 IRK，尝试计算 Hash。
5.  如果 `Calculated Hash == Received Hash`，则匹配成功，确认是“老朋友”。

> 这就是为什么只有配对过的手机才能在设备地址变化后依然认出它。

---

## 5. 开发者建议

1.  **必须存储**: 配对成功后，必须将 LTK, IRK, Peer Address, EDIV, Rand 写入非易失性存储器 (Flash)。丢失任何一个都可能导致回连失败。
2.  **删除绑定**: 如果在手机上选择了“忽略设备”，意味着手机删除了你的 LTK/IRK。此时外设如果还保留着旧密钥，重连时会报错（通常是 PIN or Key Missing），外设端必须提供机制（如长按按钮）清除旧绑定。
