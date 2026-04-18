---
Title: HCI Command - Read Local Version Information
Tags: HCI, Command, Version, Informational
---

# HCI Command: Read Local Version Information

> [!note]
> **Ref:** Bluetooth Core Specification v6.2 - Vol 4, Part E, Section 7.4.1

`HCI_Read_Local_Version_Information` 属于信息参数命令 (Informational parameters)，主要用于主机 (Host) 读取本地控制器 (Controller) 的版本、制造商、HCI/LMP 层协议版本等固定信息。这类参数由硬件制造商硬编码，Host 无法修改。

## 1. 命令定义

| Command | OGF | OCF | Opcode |
| :--- | :--- | :--- | :--- |
| `HCI_Read_Local_Version_Information` | `0x04` (Informational) | `0x0001` | `0x1001` |

## 2. 参数与返回值

**Command Parameters (命令参数)**: 
无 (None)

**Return Parameters (返回参数)**:

在成功执行后，该命令会通过 `HCI_Command_Complete` 事件返回以下结构化信息：

| 字段名称 | 大小 | 说明 |
| :--- | :--- | :--- |
| `Status` | 1 octet | `0x00` 表示成功；其他值代表错误码。 |
| `HCI_Version` | 1 octet | 标识 HCI 层的规范版本（如 `0x0C` 代表 Core Spec 5.3, `0x0D` 代表 5.4）。 |
| `HCI_Subversion` | 2 octets | 厂商自定义的 HCI 子版本号 (Vendor-specific)。 |
| `LMP_Version` / `PAL_Version` | 1 octet | LMP 层或 PAL 层规范版本（通常与 `HCI_Version` 保持一致）。 |
| `Company_Identifier` | 2 octets | 蓝牙 SIG 为各芯片厂商分配的唯一制造商 ID。<br>(例如: `0x000F` 为 Broadcom, `0x005D` 为 Realtek, `0x0002` 为 Intel 等)。 |
| `LMP_Subversion` / `PAL_Subversion` | 2 octets | 厂商自定义的底层子版本号 (Vendor-specific)。常用于确认 Controller 的固件 Patch 版本。 |

## 3. 典型应用场景

在蓝牙协议栈初始化（Initialization）期间，紧随 `HCI_Reset` 之后，Host 通常会立即下发此命令。
主要目的包括：
1. **握手与心跳确认**: 验证 Controller 是否完全存活并能正确处理返回多参数的命令。
2. **特性规避 (Workaround)**: Host 协议栈（如 Linux BlueZ, Android Fluoride）可以根据读取到的 `Company_Identifier` 和 `LMP_Subversion`，判断该芯片是否存在已知的 Bug，并加载特定的固件补丁 (Vendor Patch) 或启用兼容性规避策略。

## 4. 时序图

```mermaid
sequenceDiagram
    autonumber
    actor Host
    participant Controller
    
    Host->>Controller: HCI_Read_Local_Version_Information (Opcode: 0x1001)
    note right of Controller: 内部读取硬件及固件标识
    Controller-->>Host: HCI_Command_Complete Event
    note left of Controller: 携带: Status, HCI_Version, Company_ID, etc.
    note over Host: Host 根据 Company ID 和版本号
决定后续的初始化流程
```
