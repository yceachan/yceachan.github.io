# HID 多媒体键实现指南

在现代键盘开发中，除了标准的打字功能（Page 0x07），用户最常用的就是多媒体控制（音量、播放、亮度）。这些功能属于 **Consumer Page (0x0C)**。

由于标准键盘 Report（8 字节）已被占满且定义严格，多媒体键通常通过 **Report ID** 机制，在一个独立的 Report 中发送。

## 1. 核心 Usage ID 速查 (Consumer Page 0x0C)

这些 ID 定义在 `Usage Page (0x0C)` 下。

### 1.1 音频控制 (Audio Controls)

| Usage ID (Hex) | Name | Type | 行为描述 |
| :--- | :--- | :--- | :--- |
| `E0` | **Volume** | LC | 线性音量（0-100%），较少用于普通键盘。 |
| `E2` | **Mute** | OOC | 静音切换 (On/Off Control)。 |
| `E9` | **Volume Increment** | RTC | 音量加。按住持续触发 (Re-Trigger Control)。 |
| `EA` | **Volume Decrement** | RTC | 音量减。按住持续触发。 |

### 1.2 媒体传输控制 (Transport Controls)

| Usage ID (Hex) | Name | Type | 行为描述 |
| :--- | :--- | :--- | :--- |
| `B0` | **Play** | OOC | 开始播放。 |
| `B1` | **Pause** | OOC | 暂停播放。 |
| `B3` | **Fast Forward** | OOC | 快进。 |
| `B4` | **Rewind** | OOC | 快退。 |
| `B5` | **Scan Next Track** | OSC | 下一曲 (One Shot Control)。 |
| `B6` | **Scan Previous Track** | OSC | 上一曲。 |
| `B7` | **Stop** | OSC | 停止播放。 |
| `CD` | **Play/Pause** | OSC | 智能切换播放/暂停（最常用）。 |

### 1.3 应用启动与辅助 (Application Launch)

| Usage ID (Hex) | Name | 常见图标 |
| :--- | :--- | :--- |
| `183` | **AL Consumer Control Configuration** | 媒体播放器图标 |
| `18A` | **AL Email Reader** | 邮件图标 |
| `192` | **AL Calculator** | 计算器图标 |
| `194` | **AL Local Machine Browser** | 我的电脑/文件管理器 |
| `221` | **AC Search** | 搜索图标 |
| `223` | **AC Home** | 浏览器主页 |
| `224` | **AC Back** | 浏览器后退 |

---

## 2. 报表描述符实现 (Report Descriptor)

为了兼容性，建议将多媒体键定义为一个 **独立的 Report** (例如 Report ID = 2)。

### 2.1 描述符代码示例

```c
const uint8_t media_report_map[] = {
    // --- Consumer Page (Report ID 2) ---
    0x05, 0x0C,        // Usage Page (Consumer)
    0x09, 0x01,        // Usage (Consumer Control)
    0xA1, 0x01,        // Collection (Application)
    
    0x85, 0x02,        //   Report ID (2)
    
    // 定义 16 bit 的 Usage ID 输入槽
    // 允许同时按下多个多媒体键 (Array 模式) 或单一按键
    0x15, 0x00,        //   Logical Minimum (0)
    0x26, 0x3C, 0x02,  //   Logical Maximum (0x023C = 572) -> 覆盖常用 ID
    
    0x19, 0x00,        //   Usage Minimum (0)
    0x2A, 0x3C, 0x02,  //   Usage Maximum (0x023C)
    
    0x75, 0x10,        //   Report Size (16) -> 每个槽 16 bits (2 Bytes)
    0x95, 0x01,        //   Report Count (1) -> 这里的例子只支持同时按 1 个多媒体键
                       //   (若要支持多个，可增加 Count)
                       
    0x81, 0x00,        //   Input (Data, Array, Abs)
    
    0xC0               // End Collection
};
```

### 2.2 数据包发送格式

当用户按下“音量+”时，设备发送：

| Byte 0 (Report ID) | Byte 1 (Usage Low) | Byte 2 (Usage High) |
| :--- | :--- | :--- |
| `0x02` | `0xE9` | `0x00` |

当用户松开按键时，发送空包（即 Usage ID = 0）：

| Byte 0 | Byte 1 | Byte 2 |
| :--- | :--- | :--- |
| `0x02` | `0x00` | `0x00` |

> **关键点**: 对于 `RTC` (Re-Trigger Control) 类型如音量键，主机通常期望设备在按住时**持续发送**该 Report（或依靠主机的自动重复机制，但在 USB HID 中，通常是按键按下发一次，松开发 0。音量的连续调整往往由主机处理按住的时长，或者设备连续发送按下事件）。
> *实测经验*: 对于 Android/Windows，按下发送 `E9 00`，松开发送 `00 00`，主机也会处理自动重复。

---

## 3. Android/iOS 兼容性陷阱

1.  **AC vs AL**: 
    *   `AC` (Application Control) 如 `AC Back` (0x224) 在 Android 上对应物理 Back 键。
    *   `AL` (Application Launch) 用来启动 App。
2.  **Power Key**:
    *   不要用 Consumer Page 的 Power。
    *   系统电源键应使用 **Generic Desktop Page (0x01)** 的 `System Power Down (0x81)`。
3.  **音量键去抖**:
    *   机械旋钮产生的音量信号非常快，务必在固件层做去抖或限速，否则会导致主机音量跳变甚至卡死。

## 4. 复合设备架构 (Composite Device)

通常我们将键盘 (Report ID 1) 和多媒体 (Report ID 2) 放在同一个顶层 Collection 中，或者使用 **Report ID** 将它们物理分开但逻辑合并。

```mermaid
graph TD
    Host[主机 Host]
    
    subgraph HID_Device
        EP1[Endpoint 1 IN]
    end
    
    Host <--> EP1
    
    EP1 -.->|Report ID 1| Keyboard[标准键盘逻辑]
    EP1 -.->|Report ID 2| Media[多媒体控制逻辑]
    EP1 -.->|Report ID 3| Mouse[鼠标逻辑 (可选)]
```
