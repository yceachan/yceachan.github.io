# HID Report Descriptor 实战指南

**Report Descriptor (报表描述符)** 是 HID 设备的灵魂。它是一串二进制数据，告诉主机：“我是什么设备，我的数据长什么样，每个比特代表什么意思”。

如果 Report Descriptor 写错了，无论你的固件代码写得多完美，电脑都无法正确响应按键。

> **参考来源**: *USB HID Usage Tables* & *HOGP Specification*

---

## 1. 描述符基本语法 (Item Encoding)

HID 描述符不是简单的键值对，而是一种流式编码语言。每个条目（Item）由 **前缀（Prefix）** 和 **数据（Data）** 组成。

### 1.1 前缀结构解析 (Short Item Format)
前缀字节（1 Byte）决定了该 Item 的类型和随后的数据长度。

`Prefix = (Tag << 4) | (Type << 2) | Size`

*   **Tag (4 bit)**: 功能标识 (如 Usage Page, Report Count)。
*   **Type (2 bit)**: 作用域类型。
    *   `0 (Main)`: 定义条目 (Input, Output, Collection)。
    *   `1 (Global)`: 全局参数 (Usage Page, Report Size)，**状态保留**直到被覆盖。
    *   `2 (Local)`: 局部参数 (Usage)，**仅对下一个 Main Item 有效**，之后立即清除。
*   **Size (2 bit)**: 后续数据长度。
    *   `0`: 0 Bytes
    *   `1`: 1 Byte
    *   `2`: 2 Bytes
    *   `3`: 4 Bytes (注意：是 4 字节，不是 3 字节)

**示例解析**:
*   **`0x05`** (`0000 01 01`) -> Tag: Usage Page, Type: Global, Size: 1 Byte.
*   **`0x19`** (`0001 10 01`) -> Tag: Usage Min, Type: Local,  Size: 1 Byte.
*   **`0x26`** (`0010 01 10`) -> Tag: Logical Max, Type: Global, Size: 2 Bytes.

### 1.2 常用 Item 速查表

| Item Name            | Prefix Hex      | Data Bytes | Type (Scope) | 含义与行业惯例                                               |
| :------------------- | :-------------- | :--------- | :----------- | :---------------------------------------------------- |
| **Usage Page**       | `0x05` / `0x06` | 1 / 2      | **Global**   | 命名空间 (如 0x01=Generic Desktop, 0x0C=Consumer)。设置后一直有效。 |
| **Usage page**       | `0x09`          | 1          | **Local**    | 具体功能 (如 Keyboard, Mouse)。**用完即焚**。                    |
| **Usage id Min/Max** | `0x19`/`0x29`   | 1          | **Local**    | 批量定义 Usage，常用于数组或 Bitmap。                             |
| **Logical Min/Max**  | `0x15`/`0x25`   | 1 / 2      | **Global**   | 数据的逻辑值范围 (如 -127 ~ 127)。**注意符号位**。                    |
| **Report Size**      | `0x75`          | 1          | **Global**   | **位宽**。每个数据字段占用的 bit 数 (如 1 bit, 8 bits)。             |
| **Report Count**     | `0x95`          | 1          | **Global**   | **数量**。重复多少个 Report Size 的字段。                         |
| **Unit**             | `0x65`          | 1          | **Global**   | 物理单位 (如 厘米, 秒)。通常用于数字化仪或传感器。                          |
| **Collection**       | `0xA1`          | 1          | **Main**     | 开启一个分组 (Application, Physical)。                       |
| **End Collection**   | `0xC0`          | 0          | **Main**     | 关闭当前分组。                                               |
| **Input**            | `0x81`          | 1          | **Main**     | 定义输入数据 (Dev->Host)。参数掩码决定属性 (Const/Var/Abs)。          |
| **Output**           | `0x91`          | 1          | **Main**     | 定义输出数据 (Host->Dev, 如 LED)。                            |
| **Feature**          | `0xB1`          | 1          | **Main**     | 双向特征数据，通常用于配置。                                        |

---

## 2. 进阶核心概念 (Industry Insights)

在阅读或编写描述符时，新手常在以下几点“踩坑”：

### 2.1 全局 vs 局部 (Global vs Local)
*   **Global (如 Usage Page, Report Size)**: 像编程语言中的“全局变量”。一旦设置，它会一直生效，直到遇到新的 Global Item 修改它。
    *   *Bug 示例*: 在 Mouse Collection 里设置了 `Usage Page (Button)`，退出 Collection 后没有改回 `Usage Page (Generic Desktop)`，导致后续定义的键盘按键变成了“按钮”。
*   **Local (如 Usage, Usage Min)**: 像“函数参数”。它们会被下一个 `Input/Output/Feature` item **消费掉**。消费后，Local 状态清空。

### 2.2 字节对齐 (Byte Alignment)
虽然 HID 允许任意 bit 长度的数据，但在 Windows/Android 等主流系统上，**整个 Report 的总长度最好是 8 bits (1 byte) 的整数倍**。
*   *Best Practice*: 如果有效数据只有 3 bit，请务必使用 `Const` (Padding) 填充剩余的 5 bit。

### 2.3 逻辑范围与符号 (Logical Min/Max & Signedness)
*   HID 解析器根据 Logical Min/Max 判断数据是有符号还是无符号。
*   如果 Min < 0 (补码表示)，则数据被视为有符号整数。
*   *Trap*: `Logical Min (0x80), Logical Max (0x7F)` 在 8-bit 下表示 -128 到 127。但如果写成 `0x00, 0xFF`，则是 0 到 255。

---

## 3. 标准键盘 Report Descriptor (Boot Protocol)

这是最兼容、最常见的键盘描述符。

> **⚠️ 重要：Report ID 冲突规则**
> *   **纯键盘模式**: 如果你的设备只有键盘功能，可以不使用 `Report ID`（数据包 8 字节）。
> *   **复合设备模式**: 如果你增加了多媒体键（ID 2）或鼠标键（ID 3），你**必须**给键盘部分显式添加 `Report ID (1)`。
> *   **Packet 差异**: 一旦添加了 `Report ID (1)`，USB 链路上的数据包将变为 **9 字节**（首字节为 0x01）。但在 BLE HOGP 链路上，由于 ID 隐含在 GATT Handle 中，数据包通常维持 **8 字节**。

### 3.1 描述符代码与 Packet 映射 (以复合设备 ID 1 为例)

```c
const uint8_t keyboard_report_desc[] = {
    0x05, 0x01,        // Usage Page (Generic Desktop Ctrls)
    0x09, 0x06,        // Usage (Keyboard)
    0xA1, 0x01,        // Collection (Application)
    0x85, 0x01,        //   Report ID (1) -> **复合设备必须添加**
    
    // --- Byte 0: Modifiers (8 bits) ---
    0x05, 0x07,        //   Usage Page (Keyboard/Keypad)
    0x19, 0xE0,        //   Usage Minimum (0xE0 = Left Control)
    0x29, 0xE7,        //   Usage Maximum (0xE7 = Right GUI)
    0x15, 0x00,        //   Logical Minimum (0)
    0x25, 0x01,        //   Logical Maximum (1) -> **修正**: 1 bit 的最大值只能是 1
    0x75, 0x01,        //   Report Size (1) -> 1 bit per usage
    0x95, 0x08,        //   Report Count (8) -> 8 usages total
    0x81, 0x02,        //   Input (Data, Var, Abs) -> Variable 模式，每一位独立开关

    // ----------------------------------------------------------------
    // Byte 1: Reserved (8 bits)
    // 映射: 填充 0x00
    // ----------------------------------------------------------------
    0x95, 0x01,        //   Report Count (1)
    0x75, 0x08,        //   Report Size (8) -> 8 bits
    0x81, 0x03,        //   Input (Const, Var, Abs) -> Constant 模式，主机忽略此字节

    // ----------------------------------------------------------------
    // Byte 2-7: Key Arrays (6 bytes)
    // 映射: 6 个按键槽，每个槽填一个 Usage ID (0x00-0xFF)
    // ----------------------------------------------------------------
    0x95, 0x06,        //   Report Count (6) -> 6 个槽
    0x75, 0x08,        //   Report Size (8) -> 每个槽 8 bits
    0x15, 0x00,        //   Logical Minimum (0)
    0x25, 0xFF,        //   Logical Maximum (255) -> 允许所有 Usage ID
                       //   (注: 这里也可以写 0x65 或 0xE7，但 0xFF 更通用)
    0x05, 0x07,        //   Usage Page (Key Codes)
    0x19, 0x00,        //   Usage Minimum (0)
    0x29, 0xFF,        //   Usage Maximum (255)
    0x81, 0x00,        //   Input (Data, Array, Abs) -> Array 模式！
                       //   Array 模式下，设备发送的是 "当前按下的键的 Usage ID"，而不是位图。

    // ----------------------------------------------------------------
    // Output Report: LEDs (5 bits)
    // 主机发给设备的数据 (如 NumLock 灯状态)
    // ----------------------------------------------------------------
    0x95, 0x05,        //   Report Count (5) -> Num, Caps, Scroll, Compose, Kana
    0x75, 0x01,        //   Report Size (1)
    0x05, 0x08,        //   Usage Page (LEDs)
    0x19, 0x01,        //   Usage Min (Num Lock)
    0x29, 0x05,        //   Usage Max (Kana)
    0x91, 0x02,        //   Output (Data, Var, Abs)
    
    // Padding (3 bits) to byte boundary
    0x95, 0x01,        //   Report Count (1)
    0x75, 0x03,        //   Report Size (3)
    0x91, 0x03,        //   Output (Const)

    0xC0               // End Collection
};
```

### 3.2 Report Packet 结构对照表 (Input)

这是设备通过 Interrupt In Pipe 发送给主机的 8 字节数据。

| Byte Offset | Bit Offset | 内容 | 对应 Desc Item | 示例值 |
| :--- | :--- | :--- | :--- | :--- |
| **Byte 0** | 0 | L-Ctrl | Usage 0xE0 (Var) | `0x02` (L-Shift) |
| | 1 | L-Shift | Usage 0xE1 (Var) | |
| | 2 | L-Alt | Usage 0xE2 (Var) | |
| | 3 | L-GUI | Usage 0xE3 (Var) | |
| | 4 | R-Ctrl | Usage 0xE4 (Var) | |
| | 5 | R-Shift | Usage 0xE5 (Var) | |
| | 6 | R-Alt | Usage 0xE6 (Var) | |
| | 7 | R-GUI | Usage 0xE7 (Var) | |
| **Byte 1** | 0-7 | Reserved | Constant Padding | `0x00` |
| **Byte 2** | 0-7 | Key Code 1 | Usage 0x00-0xFF (Array) | `0x04` ('a') |
| **Byte 3** | 0-7 | Key Code 2 | Usage 0x00-0xFF (Array) | `0x00` |
| **Byte 4** | 0-7 | Key Code 3 | Usage 0x00-0xFF (Array) | `0x00` |
| **Byte 5** | 0-7 | Key Code 4 | Usage 0x00-0xFF (Array) | `0x00` |
| **Byte 6** | 0-7 | Key Code 5 | Usage 0x00-0xFF (Array) | `0x00` |
| **Byte 7** | 0-7 | Key Code 6 | Usage 0x00-0xFF (Array) | `0x00` |

---

## 4. 多媒体键盘 Report Descriptor (Consumer)

多媒体键（音量、播放、亮度）通常使用 **Consumer Page (0x0C)**。由于标准键盘 Report (ID 1) 已经被定义死了，我们需要引入 **Report ID**。

### 4.1 描述符代码 (Report ID 2)

```c
const uint8_t consumer_report_desc[] = {
    0x05, 0x0C,        // Usage Page (Consumer)
    0x09, 0x01,        // Usage (Consumer Control)
    0xA1, 0x01,        // Collection (Application)
    0x85, 0x02,        //   Report ID (2) -> 关键！区分于键盘数据
    
    // ----------------------------------------------------------------
    // 16-bit Array 模式 (推荐)
    // 允许发送任意 Consumer Usage ID (0x0000 - 0x02FF)
    // ----------------------------------------------------------------
    0x15, 0x00,        //   Logical Min (0)
    0x26, 0xFF, 0x02,  //   Logical Max (0x02FF = 767) -> 覆盖常用多媒体键
    
    0x19, 0x00,        //   Usage Min (0)
    0x2A, 0xFF, 0x02,  //   Usage Max (0x02FF)
    
    0x75, 0x10,        //   Report Size (16) -> 每个槽 16 bits (2 Bytes)
    0x95, 0x01,        //   Report Count (1) -> 只有一个槽 (单按键)
                       //   (若需同时支持多键，可增加 Count)
                       
    0x81, 0x00,        //   Input (Data, Array, Abs)
    
    0xC0               // End Collection
};
```

### 4.2 Report Packet 结构对照表 (ID 2)

这是设备发送的 3 字节数据（1 Byte ID + 2 Bytes Data）。

| Byte Offset | 内容 | 对应 Desc Item | 说明 |
| :--- | :--- | :--- | :--- |
| **Byte 0** | Report ID | `0x85 0x02` | 固定为 `0x02` |
| **Byte 1** | Usage ID (Low) | Report Size 16, Array | Usage ID 的低字节 |
| **Byte 2** | Usage ID (High)| Report Size 16, Array | Usage ID 的高字节 |

**实战示例**:

1.  **按下 "Volume Up" (Usage ID 0x00E9)**:
    *   Packet: `02 E9 00`
2.  **按下 "Play/Pause" (Usage ID 0x00CD)**:
    *   Packet: `02 CD 00`
3.  **按下 "Browser Home" (Usage ID 0x0223)**:
    *   Packet: `02 23 02` (注意字节序: 0x0223 -> Low:23, High:02)
4.  **松开按键 (Key Release)**:
    *   Packet: `02 00 00` (发送 Usage ID 0 表示空)

---

## 5. 总结：如何构造 Packet

在固件中发送 HID 数据时，你的核心任务就是填充这些 Packet buffer。

1.  **确定 Report ID**: 
    *   如果是标准键 (A-Z, Ctrl)，通常用 ID 1（或无 ID）。
    *   如果是多媒体键，用 ID 2。
    *   如果是系统键 (关机)，用 ID 3。
2.  **查表找 Usage ID**: 
    *   去 `ref_keyboard_usage_map.md` 找键盘码。
    *   去 `advanced_multimedia_and_system_keys.md` 找多媒体码。
3.  **填充 Buffer**:
    *   **Keyboard**: `[Modifiers, 00, Key1, Key2, Key3, Key4, Key5, Key6]`
    *   **Multimedia**: `[ID=02, UsageLow, UsageHigh]`
4.  **调用协议栈 API**:
    *   `ble_hogp_send_report(conn_handle, report_id, buffer, len)`

这就是 Report Descriptor 与 Packet 的完整对应逻辑。