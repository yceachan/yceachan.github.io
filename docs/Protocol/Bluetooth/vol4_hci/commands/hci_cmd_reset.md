---
Title: HCI Command - Reset
Tags: HCI, Command, Reset, Controller & Baseband
---

# HCI Command: Reset

> [!note]
> **Ref:** Bluetooth Core Specification v6.2 - Vol 4, Part E, Section 7.3.2

`HCI_Reset` 是最基础的 HCI 控制器与基带命令（Controller & Baseband commands），用于重置 Controller 以及 Link Manager (BR/EDR) 或 Link Layer (LE)。如果控制器同时支持 BR/EDR 和 LE，该命令将重置链路管理器、基带和链路层。

## 1. 命令定义

| Command | OGF | OCF | Opcode |
| :--- | :--- | :--- | :--- |
| `HCI_Reset` | `0x03` (Controller & Baseband) | `0x0003` | `0x0C03` |

## 2. 参数与返回值

**Command Parameters (命令参数)**:
无 (None)

**Return Parameters (返回参数)**:

| 返回参数 | 大小 | 说明 |
| :--- | :--- | :--- |
| `Status` | 1 octet | `0x00` 表示成功；<br>`0x01` ~ `0xFF` 表示错误码 (详见 Controller Error Codes)。 |

## 3. 执行行为与约束

1. **状态清除与恢复默认**: Reset 完成后，Controller 当前的所有操作状态都会丢失，自动进入待机模式 (Standby mode)，且规范中定义了默认值的所有参数都将**自动恢复为默认值**。
2. **硬件重置无关**: `HCI_Reset` 并不必然执行底层硬件级 Reset，这是由具体实现 (Implementation defined) 决定的。
3. **传输层独立性**: 该命令**不会**影响正在使用的 HCI 传输层（如 H4、H5、USB 等），因为传输层可能拥有自己的重置机制（例如 H5 协议自身的复位）。
4. **严格的时序约束**: 在收到该命令对应的 `HCI_Command_Complete` 事件之前，Host **绝不能**发送任何额外的 HCI 命令。

## 4. 典型交互时序图

```mermaid
sequenceDiagram
    autonumber
    actor Host
    participant Controller
    
    Host->>Controller: HCI_Reset Command (Opcode: 0x0C03)
    note right of Controller: 1. 清除当前操作状态
2. 恢复参数默认值
3. 进入 Standby 模式
    Controller-->>Host: HCI_Command_Complete Event (Status: 0x00)
    note over Host: 收到 Complete 事件后，才允许发送后续命令 (如初始化)
```
