# HID Report Map 实战指南

**Report Map (报表描述符)** 是 HID 设备的灵魂。它是一串二进制数据，告诉主机：“我是什么设备，我的数据长什么样，每个比特代表什么意思”。

如果 Report Map 写错了，无论你的固件代码写得多完美，电脑都无法正确响应按键。

> **参考来源**: *USB HID Usage Tables* & *HOGP Specification*

---

## 1. 描述符基本语法

HID 描述符是一种基于 **Item** 的语言。每个 Item 包含前缀（Tag）和数据。

| Item | 含义 | 示例 | 解释 |
| :--- | :--- | :--- | :--- |
| **Usage Page** | 用途页 | `0x05, 0x01` | 通用桌面控制 (Generic Desktop) |
| **Usage** | 用途 | `0x09, 0x06` | 键盘 (Keyboard) |
| **Collection** | 集合开始 | `0xA1, 0x01` | 应用集合 (Application) |
| **Usage Min/Max** | 用途范围 | `0x19, 0xE0` | 左 Ctrl |
| **Logical Min/Max** | 逻辑值范围 | `0x15, 0x00` | 最小值 0 |
| **Report Size** | 数据位宽 | `0x75, 0x01` | 每个数据占 1 bit |
| **Report Count** | 数据个数 | `0x95, 0x08` | 一共 8 个数据 |
| **Input** | 输入属性 | `0x81, 0x02` | 变量 (Variable), 绝对值 (Absolute) |
| **End Collection** | 集合结束 | `0xC0` | - |

---

## 2. 标准键盘 Report Map (8 字节)

这是最兼容、最常见的键盘描述符。对应的数据包长度固定为 **8 字节**。

### 2.1 描述符代码解析

```c
const uint8_t keyboard_report_map[] = {
    0x05, 0x01,        // Usage Page (Generic Desktop Ctrls)
    0x09, 0x06,        // Usage (Keyboard)
    0xA1, 0x01,        // Collection (Application)
    
    // --- Byte 0: Modifiers (Ctrl, Shift, Alt, GUI) ---
    0x05, 0x07,        //   Usage Page (Keyboard/Keypad)
    0x19, 0xE0,        //   Usage Minimum (0xE0 = Left Control)
    0x29, 0xE7,        //   Usage Maximum (0xE7 = Right GUI)
    0x15, 0x00,        //   Logical Minimum (0)
    0x25, 0x01,        //   Logical Maximum (1)
    0x75, 0x01,        //   Report Size (1) -> 1 bit
    0x95, 0x08,        //   Report Count (8) -> 8 bits
    0x81, 0x02,        //   Input (Data, Var, Abs) -> 变量，每一位独立

    // --- Byte 1: Reserved (保留字节) ---
    0x95, 0x01,        //   Report Count (1)
    0x75, 0x08,        //   Report Size (8) -> 8 bits
    0x81, 0x03,        //   Input (Const, Var, Abs) -> 常量，通常填 0

    // --- Byte 2-7: Key Arrays (普通按键) ---
    0x95, 0x06,        //   Report Count (6) -> 6 个按键槽
    0x75, 0x08,        //   Report Size (8) -> 每个槽 8 bits
    0x15, 0x00,        //   Logical Minimum (0)
    0x25, 0x65,        //   Logical Maximum (101)
    0x05, 0x07,        //   Usage Page (Key Codes)
    0x19, 0x00,        //   Usage Minimum (0)
    0x29, 0x65,        //   Usage Maximum (101)
    0x81, 0x00,        //   Input (Data, Array, Abs) -> 数组模式！

    // --- Output Report (LEDs) ---
    0x95, 0x05,        //   Report Count (5) -> Num, Caps, Scroll, Compose, Kana
    0x75, 0x01,        //   Report Size (1)
    0x05, 0x08,        //   Usage Page (LEDs)
    0x19, 0x01,        //   Usage Min (Num Lock)
    0x29, 0x05,        //   Usage Max (Kana)
    0x91, 0x02,        //   Output (Data, Var, Abs) -> 主机发给设备
    
    0x95, 0x01,        //   Report Count (1)
    0x75, 0x03,        //   Report Size (3) -> Padding to byte boundary
    0x91, 0x03,        //   Output (Const)

    0xC0               // End Collection
};
```

### 2.2 数据包结构 (Payload)

| Byte | 内容 | 说明 |
| :--- | :--- | :--- |
| 0 | **Modifiers** | Bit 0: L-Ctrl, Bit 1: L-Shift ... Bit 7: R-GUI |
| 1 | **Reserved** | 总是 `0x00` (OEM 也可以用来传私有数据，但不推荐) |
| 2 | **Key 1** | 第一个按下的键的 Usage ID (如 `0x04` = 'A') |
| 3 | **Key 2** | 第二个按下的键 |
| ... | ... | ... |
| 7 | **Key 6** | 第六个按下的键 |

> **限制**: 这种模式最多只能同时报告 6 个普通按键。如果你按了 7 个，设备通常会发送 `0x01` (Error Roll Over)。

---

## 3. 全键无冲 (NKRO) 与 Bitmap

要实现 104 键全无冲，不能使用 `Array` 模式，必须使用 `Variable` (Bitmap) 模式。

**原理**: 发送一个 13 字节（104 bit）的包，每一位对应一个键。如果 'A' 键按下，则第 4 位置 1。

```c
// NKRO 描述符片段
0x05, 0x07,    // Usage Page (Keyboard)
0x19, 0x00,    // Usage Min (0)
0x29, 0x7F,    // Usage Max (127) -> 覆盖 128 个键
0x15, 0x00,    // Logical Min (0)
0x25, 0x01,    // Logical Max (1) -> 0 或 1
0x75, 0x01,    // Report Size (1)
0x95, 0x80,    // Report Count (128) -> 16 字节
0x81, 0x02,    // Input (Data, Variable, Abs)
```

---

## 4. 多媒体键 (Consumer Page)

音量加减、播放暂停不属于 Keyboard Page (0x07)，而是 **Consumer Page (0x0C)**。通常使用 **Report ID** 将其与普通键盘数据区分开。

**示例**:
*   Report ID 1: 普通键盘数据 (8 Bytes)。
*   Report ID 2: 多媒体数据 (2 Bytes)。

**多媒体描述符片段**:
```c
0x05, 0x0C,        // Usage Page (Consumer)
0x09, 0x01,        // Usage (Consumer Control)
0xA1, 0x01,        // Collection (Application)
0x85, 0x02,        //   Report ID (2)
0x19, 0x00,        //   Usage Min
0x2A, 0x3C, 0x02,  //   Usage Max (0x023C = AC Format)
0x15, 0x00,        //   Logical Min (0)
0x26, 0x3C, 0x02,  //   Logical Max (0x023C)
0x95, 0x01,        //   Report Count (1)
0x75, 0x10,        //   Report Size (16) -> 16 bit Usage ID
0x81, 0x00,        //   Input (Data, Array, Abs)
0xC0               // End Collection
```

**数据包示例 (音量+)**:
`02 E9 00`
*   `02`: Report ID
*   `E9 00`: Usage ID `0x00E9` (Volume Increment)
