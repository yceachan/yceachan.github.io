--- 
title: International Physical Key Naming & HID Mapping
tags: [Hardware, ISO-IEC-9995, HID, Keyboard-Layout]
last_updated: 2026-01-28

--- 

# International Physical Key Naming & HID Mapping

在键盘固件开发和物理矩阵映射中，业界通常采用 **ISO/IEC 9995** 标准定义的网格坐标来命名物理键位，以区别于具体语言的逻辑字符。

## 1. 物理坐标网格 (The Grid System)

ISO 标准将键盘划分为行（Row）和列（Column）：
*   **行 (Rows)**: 
    *   **E**: 数字行 (Number Row)
    *   **D**: QWERTY 行
    *   **C**: ASDF 行 (Home Row)
    *   **B**: ZXCV 行
    *   **A**: 空格行 (Space/Modifiers)
*   **列 (Columns)**: 从左向右编号，通常为 `00` 到 `15`。

### 示例映射
*   `C01`: 字母 **A** 的物理位置。
*   `E00`: 数字行最左侧的键（通常是 **` / ~**）。
*   `B00`: 左 **Shift** 键。

---

## 2. 国际化特有键位 (ISO/JIS/ABNT)

标准 101/104 配列之外的物理按键，在不同国家有专门的命名和 Usage ID。

### 2.1 ISO 布局 (欧洲/英国)
ISO 键盘比 ANSI 键盘多一个物理键，位于 `Left Shift` (B00) 和 `Z` (B01) 之间。

| 物理命名 | 描述 | Usage ID (Hex) | HID 官方名称 |
| :--- | :--- | :--- | :--- |
| **B00** | ISO 左侧附加键 | `0x64` | Keyboard Non-US \ and \| |
| **C12** | ISO Enter 键上方 | `0x31` | Keyboard \ and \| (ISO Enter 占位) |
| **D13** | 英国布局 # 键 | `0x32` | Keyboard Non-US # and ~ |

### 2.2 JIS 布局 (日本)
日本键盘有大量特有的物理按键用于输入法切换。

| 物理命名 | 描述 | Usage ID (Hex) | HID 官方名称 |
| :--- | :--- | :--- | :--- |
| **E13** | ¥ 键 (Yen) | `0x89` | Keyboard International 3 |
| **B11** | \ 键 (Ro) | `0x87` | Keyboard International 1 |
| **A01** | 无变换 (Muhenkan)| `0x8B` | Keyboard International 5 |
| **A03** | 变换 (Henkan) | `0x8A` | Keyboard International 4 |
| **A04** | 平假名/片假名 | `0x88` | Keyboard International 2 |

---

## 3. 特殊物理按键 (K-Codes)

在某些 ABNT (巴西) 或 Legacy 设备中，会使用 K131 等特殊编号。

| 物理命名 | Usage ID (Hex) | HID 官方名称 | 备注 |
| :--- | :--- | :--- | :--- |
| **K131** | `0x83` | Keyboard Locking Num Lock | 硬件自锁 NumLock |
| **K132** | `0x84` | Keyboard Locking Scroll Lock | 硬件自锁 ScrollLock |
| **K133** | `0x85` | Keypad Comma | 巴西布局小键盘逗号 |
| **K56** | `0x87` | Keyboard International 1 | 对应 JIS _/ \ 键 |
| **K14** | `0x89` | Keyboard International 3 | 对应 JIS ¥ 键 |

---

## 4. 修饰键与功能键的国际化

| Usage ID (Hex) | 名称 | 常见别名 | 
| :--- | :--- | :--- |
| `0xE2` | Left Alt | Option (macOS) |
| `0xE6` | Right Alt | **AltGr** (用于输入欧洲二级字符) |
| `0xE3` | Left GUI | Windows / Command / Meta / Super |
| `0x65` | Application | Menu / Context Menu |

## 5. 填表建议 (Matrix Implementation)

在为 Yichip 开发 `Matrix Map` 时：
1.  **优先遵循 ANSI/ISO 通用 ID**: 即使是多国语言键盘，主键区的 ID（0x04-0x38）是不变的。
2.  **处理 AltGr**: 如果你的键盘有 AltGr，映射物理键到 `0xE6` (Right Alt)。
3.  **处理 ISO 差异**: 如果设计 105 键配列，务必在 `B00` 位置添加 `0x64` 的映射，否则在欧洲语言设置下将无法输入部分符号。
