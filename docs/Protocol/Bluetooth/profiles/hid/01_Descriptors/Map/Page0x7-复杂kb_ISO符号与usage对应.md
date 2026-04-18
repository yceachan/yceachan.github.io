---
title: 复杂 KB ISO 符号与 Usage 对应
tags: [HID, Keyboard, ISO-IEC-9995, Tech-Insight]
last_updated: 2026-02-02
---

# 复杂 KB ISO 符号与 Usage 对应指南

本文档专门用于解析在标准键盘开发中经常遇到的**特殊符号**、**K-Code** 以及它们在 HID Usage Table (Page 0x07) 中的确切对应关系。

## 1. 疑难符号对照表

| 符号 / K-Code | Usage ID (Hex) | Page | HID Official Name | 物理含义与应用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **K131** | **`0x83`** | `0x07` | **Keyboard Locking Num Lock** | **自锁 NumLock**。老式机械键盘使用，物理按键会锁定在按下状态。现代键盘极少使用。 |
| **K132** | **`0x84`** | `0x07` | **Keyboard Locking Scroll Lock** | **自锁 ScrollLock**。同上，老式自锁键。 |
| **K133** | **`0x85`** | `0x07` | **Keypad Comma** | **数字键盘逗号**。巴西 (ABNT) 等地区使用，位于数字键盘区域。不同于标准的小键盘点 (`0x63`)。 |
| **K14** | **`0x89`** | `0x07` | **Keyboard International 3** | **JIS `¥` (Yen) 键**。物理位置在 Backspace 左侧 (ISO Grid E13)。在非日文 OS 下通常无效。 |
| K29 |  |  |  |  |
| **K150** | **`0x96`** | `0x07` | **Keyboard LANG7** | **语言切换保留键**。PC 键盘通常无此物理键。专用于特定亚洲语言输入法的模式切换。 |
| **K151** | **`0x97`** | `0x07` | **Keyboard LANG8** | **语言切换保留键**。同上。 |
| **K107** | **`0x6B`** | `0x07` | **Keyboard F16** | **F16 功能键**。常见于 Apple 全尺寸键盘或专用工作站键盘。 |
| **000** | **`0xB1`** | `0x07` | **Keypad 000** | **三零键**。常见于 POS 机或财务键盘，用于快速输入千位。 |
| **00** | **`0xB0`** | `0x07` | Keypad 00 | 小键盘双零 |
| **K29** | **`0x1D`** | `0x07` | **Keyboard z and Z** | **标准 Z 键** (QWERTY)。在 AZERTY 布局中对应 W。 |
| **€** | **N/A** | - | **(No Direct Usage)** | **欧元符号**。没有独立的 HID Usage。通过组合键输入 (如 `AltGr + E` 或 `Alt + 0128`)。 |
| **Fn** | N/A | **N/A** | (Firmware Internal) | **Fn 键没有 HID Usage**。它通常由固件处理，用于触发其他层的功能。 |
