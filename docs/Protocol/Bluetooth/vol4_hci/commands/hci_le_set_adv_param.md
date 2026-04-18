---
Title: HCI Command - LE Set Advertising Parameters
Tags: HCI, Command, LE, Advertising
---

# HCI Command: LE Set Advertising Parameters

> [!note]
> **Ref:** Bluetooth Core Specification v6.2 - Vol 4, Part E, Section 7.8.5

`HCI_LE_Set_Advertising_Parameters` 是 BLE 广播最核心的配置命令。它用于主机 (Host) 向低功耗蓝牙 (LE) 控制器配置传统广播 (Legacy Advertising) 的各项参数。

> **前置要求**：修改广播参数前，必须先关闭广播（`LE_Set_Advertising_Enable` = 0），否则将返回 `Command Disallowed (0x0C)` 错误。
> **演进注意**：如果设备或场景正在使用扩展广播 (Extended Advertising) 或周期性广播，应使用新的 `HCI_LE_Set_Extended_Advertising_Parameters` 命令。

## 1. 命令定义

| Command | OGF | OCF | Opcode |
| :--- | :--- | :--- | :--- |
| `HCI_LE_Set_Advertising_Parameters` | `0x08` (LE Controller) | `0x0006` | `0x2006` |

## 2. 参数结构 (Command Parameters)

| 参数名 | 字节数 | 说明 | 范围 / 典型值 |
| :--- | :--- | :--- | :--- |
| `Advertising_Interval_Min` | 2 | 最小广播间隔 | 计算公式：$Time = N 	imes 0.625 \, 	ext{ms}$<br>范围: `0x0020` ~ `0x4000` (20 ms ~ 10.24 s)<br>默认: `0x0800` (1.28 s) |
| `Advertising_Interval_Max` | 2 | 最大广播间隔 | 同上。强制要求：$Min \le Max$ |
| `Advertising_Type` | 1 | 广播类型 | `0x00`: **ADV_IND** (可连接可扫描非定向广播，默认)<br>`0x01`: **ADV_DIRECT_IND** (高占空比定向广播)<br>`0x02`: **ADV_SCAN_IND** (可扫描非定向)<br>`0x03`: **ADV_NONCONN_IND** (不可连接非定向)<br>`0x04`: **ADV_DIRECT_IND** (低占空比定向) |
| `Own_Address_Type` | 1 | 本地地址类型 | `0x00`: Public Device Address (默认)<br>`0x01`: Random Device Address<br>`0x02`: RPA (Resolvable Private Address)，解析失败退化为 Public<br>`0x03`: RPA，解析失败退化为 Random |
| `Peer_Address_Type` | 1 | 对端地址类型 | `0x00`: Public Identity Address<br>`0x01`: Random (static) Identity Address |
| `Peer_Address` | 6 | 对端 MAC 地址 | 仅在定向广播或启用 RPA (解析列表) 时必须提供有效值 |
| `Advertising_Channel_Map` | 1 | 广播信道位图 | Bit 0: Ch 37<br>Bit 1: Ch 38<br>Bit 2: Ch 39<br>默认: `0x07` (全信道轮询) |
| `Advertising_Filter_Policy` | 1 | 广播过滤策略<br>(白名单机制) | `0x00`: 处理所有扫描和连接请求 (默认)<br>`0x01`: 连接全放行，扫描限 Filter Accept List (白名单)<br>`0x02`: 扫描全放行，连接限 Filter Accept List<br>`0x03`: 扫描和连接全限 Filter Accept List |

## 3. 返回事件与错误码

收到命令后，Controller 验证参数合法性，并回复 `HCI_Command_Complete` 事件。

**典型错误码 (Error Codes)**:
*   `Command Disallowed (0x0C)`: 控制器当前正在广播中（广播开启状态下不允许修改参数）。
*   `Unsupported Feature or Parameter Value (0x11)`: 设定的广播间隔超出了 Controller 硬件支持的范围，或者参数组合不合法。

## 4. 关键特性的底层逻辑

### 4.1 定向广播约束 (Directed Advertising)
当 `Advertising_Type` 设为 `0x01`（高占空比定向广播）时，规范对其有极其严格的特殊处理：
1.  `Advertising_Interval_Min` 和 `Advertising_Interval_Max` 参数会被直接**忽略**。Controller 会以尽量密集的频率 (通常 3.75 ms) 狂发广播。
2.  必须提供有效的 `Peer_Address` 及其类型。
3.  `Advertising_Filter_Policy` 会被忽略，因为定向广播只针对特定的 Peer。

### 4.2 隐私机制与动态地址 (RPA Generation)
如果 `Own_Address_Type` 被设为 `0x02` 或 `0x03`，说明 Host 希望启用 Controller 级别的隐私解析：
*   Controller 将利用本地 resolving list（解析列表）中匹配的 IRK，为自己动态生成可解析私有地址 (Resolvable Private Address, RPA)。
*   这依赖于 `Peer_Address` 和 `Peer_Address_Type` 参数来在 resolving list 中索引寻找对应的 IRK 键值对。
