# 进阶 HID 多媒体与系统键开发指南

本文档是 `multimedia_keys_implementation.md` 的进阶补充，聚焦于**系统电源管理**、**屏幕亮度**以及**应用快捷键**的 HID 实现。

这些功能通常需要组合使用 **Generic Desktop Page (0x01)** 和 **Consumer Page (0x0C)**。

---

## 1. 系统电源控制 (System Controls)

**坑点预警**: 电源键（Power）、睡眠（Sleep）和唤醒（Wake）**不属于** Consumer Page (0x0C)，而是属于 **Generic Desktop Page (0x01)**。这意味着你不能直接把它们塞进多媒体 Report 中，除非你在描述符里显式切换了 Usage Page。

### 1.1 核心 Usage ID (Page 0x01)

| Usage ID (Hex) | Name                    | Type | 描述              |
| :------------- | :---------------------- | :--- | :-------------- |
| `81`           | **System Power Down**   | OSC  | 关机。触发操作系统的关机流程。 |
| `82`           | **System Sleep**        | OSC  | 睡眠/待机。          |
| `83`           | **System Wake Up**      | OSC  | 唤醒。             |
| `8F`           | **System Cold Restart** | OSC  | 冷重启（较少用）。       |

### 1.2 推荐实现方案 (独立 Report ID)

为了兼容性，建议为系统控制分配一个独立的 **Report ID** (例如 ID = 3)。

**描述符片段**:
```c
// --- System Control (Report ID 3) ---
0x05, 0x01,        // Usage Page (Generic Desktop)
0x09, 0x80,        // Usage (System Control)
0xA1, 0x01,        // Collection (Application)
0x85, 0x03,        //   Report ID (3)

0x15, 0x00,        //   Logical Minimum (0)
0x25, 0x01,        //   Logical Maximum (1)
0x75, 0x01,        //   Report Size (1 bit)
0x95, 0x03,        //   Report Count (3) -> Power, Sleep, Wake

0x09, 0x81,        //   Usage (System Power Down)
0x09, 0x82,        //   Usage (System Sleep)
0x09, 0x83,        //   Usage (System Wake Up)
0x81, 0x02,        //   Input (Data, Var, Abs) -> 3 bits

0x95, 0x01,        //   Report Count (1)
0x75, 0x05,        //   Report Size (5 bits) -> Padding
0x81, 0x03,        //   Input (Const) -> 补齐 8 bits

0xC0               // End Collection
```

**Packet 构造 (1 Byte Payload)**:

| 动作 | Report ID | Byte 1 (Binary) | Hex Packet |
| :--- | :--- | :--- | :--- |
| **Power Down** | `03` | `0000 0001` | `03 01` |
| **Sleep** | `03` | `0000 0010` | `03 02` |
| **Wake** | `03` | `0000 0100` | `03 04` |
| **松开 (Release)**| `03` | `0000 0000` | `03 00` |

---

## 2. 屏幕亮度控制 (Display Brightness)

亮度控制属于 **Consumer Page (0x0C)**。Windows 8/10/11 和 Android 均原生支持。

### 2.1 核心 Usage ID (Page 0x0C)

| Usage ID (Hex) | Name | Type | 描述 |
| :--- | :--- | :--- | :--- |
| `6F` | **Display Brightness Increment** | RTC | 亮度增加 (Re-Trigger)。 |
| `70` | **Display Brightness Decrement** | RTC | 亮度降低 (Re-Trigger)。 |
| `79` | **Keyboard Brightness Increment**| RTC | 键盘背光增加 (部分系统支持)。 |
| `7A` | **Keyboard Brightness Decrement**| RTC | 键盘背光降低。 |

### 2.2 实现方式

可以将亮度键混入通用的 Consumer Report (Report ID 2) 中。只要你的 Logical Max 足够大（覆盖到 0x70），且使用 Array 模式，就不需要改动描述符结构。

**Packet 构造 (假设使用通用 Consumer Report)**:
*   Report ID: 02
*   Payload: 16-bit Usage ID

| 动作 | Hex Packet |
| :--- | :--- |
| **亮度+** | `02 6F 00` |
| **亮度-** | `02 70 00` |
| **松开** | `02 00 00` |

---

## 3. 进阶导航与应用启动 (App Launch & Nav)

这些功能极大提升用户体验，同样属于 **Consumer Page (0x0C)**。

### 3.1 导航控制 (AC - Application Control)

| Usage ID (Hex) | Name | 作用 (Windows/Android) |
| :--- | :--- | :--- |
| `223` | **AC Home** | 打开浏览器主页 / 回到桌面 |
| `224` | **AC Back** | 浏览器后退 / **Android 返回键** (非常重要) |
| `225` | **AC Forward** | 浏览器前进 |
| `226` | **AC Stop** | 停止加载网页 |
| `227` | **AC Refresh** | 刷新网页 |
| `22A` | **AC Bookmarks**| 打开收藏夹 |

### 3.2 应用启动 (AL - Application Launch)

| Usage ID (Hex) | Name | 作用 |
| :--- | :--- | :--- |
| `183` | **AL Consumer Control Config** | 打开媒体播放器 (Media Player) |
| `18A` | **AL Email Reader** | 打开邮件客户端 |
| `192` | **AL Calculator** | 打开计算器 |
| `194` | **AL Local Machine Browser** | 打开文件资源管理器 (My Computer) |
| `196` | **AL Internet Browser** | 打开默认浏览器 |

### 3.3 Packet 构造示例

假设使用 16-bit Array 模式的 Consumer Report (Report ID 2)。

*   **打开计算器**: `02 92 01` (注意：0x0192 的低字节是 92，高字节是 01)
*   **Android 返回**: `02 24 02` (0x0224)
*   **浏览器刷新**: `02 27 02` (0x0227)

---

## 4. 终极整合：All-in-One Report Descriptor

如果你希望在一个设备中支持上述所有功能（键盘 + 多媒体 + 系统 + 亮度），下面是一个工业级的参考描述符结构。

它包含 3 个 Report ID：
1.  **ID 1**: Standard Keyboard (Boot Compatible)
2.  **ID 2**: Consumer Control (Media, Brightness, Apps)
3.  **ID 3**: System Control (Power, Sleep)

### 4.1 完整描述符代码 (Reference)

```c
const uint8_t hid_report_desc[] = {
    // -------------------------------------------------
    // Report ID 1: Keyboard (Standard 6-byte keycodes)
    // -------------------------------------------------
    0x05, 0x01,        // Usage Page (Generic Desktop)
    0x09, 0x06,        // Usage (Keyboard)
    0xA1, 0x01,        // Collection (Application)
    0x85, 0x01,        //   Report ID (1)
    // ... (省略标准键盘部分，见 ref_keyboard_usage_map.md) ...
    0xC0,              // End Collection

    // -------------------------------------------------
    // Report ID 2: Consumer Control (Media, Brightness, Apps)
    // -------------------------------------------------
    0x05, 0x0C,        // Usage Page (Consumer)
    0x09, 0x01,        // Usage (Consumer Control)
    0xA1, 0x01,        // Collection (Application)
    0x85, 0x02,        //   Report ID (2)
    
    // 我们采用 "Array" 模式，允许发送任意 Consumer Usage
    // 范围覆盖从 0x00 到 0x02FF，足以包含所有媒体、亮度和应用键
    0x15, 0x00,        //   Logical Min (0)
    0x26, 0xFF, 0x02,  //   Logical Max (0x02FF)
    0x19, 0x00,        //   Usage Min (0)
    0x2A, 0xFF, 0x02,  //   Usage Max (0x02FF)
    
    0x75, 0x10,        //   Report Size (16 bits) -> 支持 >255 的 ID
    0x95, 0x01,        //   Report Count (1) -> 每次只报一个键 (可改为 N 实现多键)
    0x81, 0x00,        //   Input (Data, Array, Abs)
    
    0xC0,              // End Collection

    // -------------------------------------------------
    // Report ID 3: System Control (Power, Sleep, Wake)
    // -------------------------------------------------
    0x05, 0x01,        // Usage Page (Generic Desktop)
    0x09, 0x80,        // Usage (System Control)
    0xA1, 0x01,        // Collection (Application)
    0x85, 0x03,        //   Report ID (3)
    
    // 使用 "Variable" (Bitmap) 模式，因为一共就这 3 个键，方便按位控制
    0x15, 0x00,        //   Logical Min (0)
    0x25, 0x01,        //   Logical Max (1)
    0x75, 0x01,        //   Report Size (1 bit)
    0x95, 0x03,        //   Report Count (3)
    
    0x09, 0x81,        //   Usage (Power Down)
    0x09, 0x82,        //   Usage (Sleep)
    0x09, 0x83,        //   Usage (Wake Up)
    0x81, 0x02,        //   Input (Data, Var, Abs)
    
    // Padding (5 bits) to byte boundary
    0x95, 0x01,        //   Report Count (1)
    0x75, 0x05,        //   Report Size (5)
    0x81, 0x03,        //   Input (Const)
    
    0xC0               // End Collection
};
```

### 4.2 数据流实战 (Traffic Simulation)

假设用户进行了一系列操作，蓝牙链路上传输的数据如下：

1.  **用户按下 "计算器" 键**:
    *   Host 收到: `02 92 01` (Report ID 2, Usage 0x0192)
2.  **用户松开**:
    *   Host 收到: `02 00 00`
3.  **用户按下 "睡眠" 键**:
    *   Host 收到: `03 02` (Report ID 3, Bit 1 set -> Sleep)
4.  **用户松开**:
    *   Host 收到: `03 00`
5.  **用户按下 "亮度+"**:
    *   Host 收到: `02 6F 00` (Report ID 2, Usage 0x006F)
    *   (按住不放) Host 收到: `02 6F 00` ... (重复发送)
6.  **用户松开**:
    *   Host 收到: `02 00 00`

---

## 6. 物理映射：Fn + Fx 的真相 (Firmware Logic)

与 `F13-F24` 类似，大多数多媒体和系统键在笔记本或紧凑型键盘上是通过 **Fn 组合键** 实现的。

### 6.1 常见映射关系示例
| 物理操作 (用户感知) | 固件逻辑映射 (HID Usage) | 报文 ID & Payload (示例) |
| :--- | :--- | :--- |
| **Fn + F1** | **Mute** (Page 0x0C, Usage 0xE2) | `02 E2 00` |
| **Fn + F2** | **Vol Down** (Page 0x0C, Usage 0xEA) | `02 EA 00` |
| **Fn + F3** | **Vol Up** (Page 0x0C, Usage 0xE9) | `02 E9 00` |
| **Fn + F11** | **Brightness -** (Page 0x0C, Usage 0x70) | `02 70 00` |
| **Fn + F12** | **Brightness +** (Page 0x0C, Usage 0x6F) | `02 6F 00` |
| **Fn + Del** | **System Sleep** (Page 0x01, Usage 0x82) | `03 02` |

### 6.2 Fn-Lock (多媒体优先模式)
现代键盘（如 ThinkPad, Logitech）通常支持 **Fn-Lock** 模式：

1.  **Standard Mode (F-Keys First)**:
    *   直接按下 F1: 发送 `Usage 0x3A` (Standard F1)。
    *   按下 Fn + F1: 映射发送 `Usage 0xE2` (Consumer Mute)。
2.  **Media Mode (Multimedia First)**:
    *   直接按下 F1: 映射发送 `Usage 0xE2` (Consumer Mute)。
    *   按下 Fn + F1: 发送 `Usage 0x3A` (Standard F1)。

> **开发要点**: 
> *   **透明性**: Host 并不关心 Fn-Lock 是否开启，它只关心收到的 `Usage ID` 是什么。
> *   **状态管理**: Fn-Lock 状态通常由固件本地维护。如果需要 OS 联动，可能需要 Vendor Specific Report，但这超出了标准 HID 的范围。

