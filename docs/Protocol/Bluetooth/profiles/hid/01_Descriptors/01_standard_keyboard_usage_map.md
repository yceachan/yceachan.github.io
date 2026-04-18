# 标准键盘 HID Usage Map (Page 0x07)

**Usage Page**: `0x07` (Keyboard/Keypad)

本表收录了 **Boot Keyboard** 所需的完整 Usage ID 映射 (0x00 - 0xE7)。

> **注意**: 
> *   `0x00` - `0x03` 为保留值，用于指示协议错误（如 Ghost Key）。
> *   标准键盘 Report 通常支持 6 键无冲 (6KRO)。

## 1. 核心键区 (A-Z, 0-9)

| Usage ID (Hex) | Key Name | Description |
| :--- | :--- | :--- |
| `04` | **a** | Keyboard a and A |
| `05` | **b** | Keyboard b and B |
| `06` | **c** | Keyboard c and C |
| ... | ... | (A-Z 连续) |
| `1D` | **z** | Keyboard z and Z |
| `1E` | **1** | Keyboard 1 and ! |
| `1F` | **2** | Keyboard 2 and @ |
| `20` | **3** | Keyboard 3 and # |
| `21` | **4** | Keyboard 4 and $ |
| `22` | **5** | Keyboard 5 and % |
| `23` | **6** | Keyboard 6 and ^ |
| `24` | **7** | Keyboard 7 and & |
| `25` | **8** | Keyboard 8 and * |
| `26` | **9** | Keyboard 9 and ( |
| `27` | **0** | Keyboard 0 and ) |

## 2. 功能键 (F1-F24)与 "Fn" 键的真相

### 2.1 Usage ID 映射表
| Usage ID (Hex) | Key Name      | 备注    |
| :------------- | :------------ | :---- |
| `3A` - `45`    | **F1 - F12**  | 标准功能键 |
| `68` - `73`    | **F13 - F24** |       |

### 2.2 认知矫正：F13-F24 与 Fn 键
*   **协议层 (Protocol)**: 
    *   **没有 "Fn" 键**: 在标准 HID 协议中，**不存在**名为 "Fn" 的 Usage ID。
    *   **独立地位**: `F13` - `F24` (0x68-0x73) 是与 `A`, `B`, `Enter` 平级的**独立逻辑按键**。Host 收到 `0x68` 只知道 "F13 被按下了"，完全不关心它是怎么触发的。
*   **实现层 (Implementation)**:
    *   **物理按键**: 工作站级的专业键盘（比108键方案还多），可能有物理的 F13 键。
    
    *   **组合映射**: 在主流配列108、87上，`Fn` 是**固件内部**处理的 Modifier（不上报给 Host）。固件检测到 `Fn + F1` 按下时，查表发送 `Usage ID 0x68 (F13)` 给 Host。
    
    - **区分多媒体方案**：很多厂商的`Fn+F<x>` ，并非映射到由软件决定功能的F13-F14 ，而是直接走另外的Usage Page ，去做`System Ctl (SC)` ; ` App Ctl (AC)`等硬件决定功能的逻辑。
    
 
> **结论**: F13-F24 是**目的** (Result)，Fn+Fx 是**手段** (Process)。你可以将 F13 映射给任意物理操作。

### 2.3 默认行为与驱动 (Host Side)
*   **无需驱动**: Windows/macOS/Linux 的原生 HID 驱动 (`hid-generic`, `kbdhid`) 均能直接识别 F13-F24，无需安装任何专用驱动。
*   **静默处理**: 操作系统接收这些键值后，默认**没有任何反应** (No Default Action)，除非用户安装了软件 (如 OBS, AutoHotKey) 主动监听并消费这些事件。
    *   *场景*: 它们是完美的 "无冲突宏按键"，常被映射为 "OBS 切换场景" 或 "IDE 编译" 等功能。

## 3. 控制键与编辑键

| Usage ID (Hex) | Key Name |
| :--- | :--- |
| `28` | **Enter** |
| `29` | **Escape** |
| `2A` | **Backspace** |
| `2B` | **Tab** |
| `2C` | **Space** |
| `39` | **CapsLock** |
| `4F` | **Right Arrow** |
| `50` | **Left Arrow** |
| `51` | **Down Arrow** |
| `52` | **Up Arrow** |
| `4C` | **Delete** |
| `4A` | **Home** |
| `4D` | **End** |
| `4B` | **PageUp** |
| `4E` | **PageDown** |
| `46` | Print Screen |
| `47` | Scroll Lock |
| `48` | Pause |
| `49` | Insert |

## 4. 小键盘区 (Keypad)

这是独立的小键盘区域（通常在键盘右侧）。注意 `NumLock` 状态会影响其行为。

| Usage ID (Hex) | Key Name | Description |
| :--- | :--- | :--- |
| `53` | **Num Lock** | Keypad Num Lock and Clear |
| `54` | **/** | Keypad / |
| `55` | ***** | Keypad * |
| `56` | **-** | Keypad - |
| `57` | **+** | Keypad + |
| `58` | **Enter** | Keypad ENTER |
| `59` | **1** | Keypad 1 and End |
| `5A` | **2** | Keypad 2 and Down Arrow |
| `5B` | **3** | Keypad 3 and PageDn |
| `5C` | **4** | Keypad 4 and Left Arrow |
| `5D` | **5** | Keypad 5 |
| `5E` | **6** | Keypad 6 and Right Arrow |
| `5F` | **7** | Keypad 7 and Home |
| `60` | **8** | Keypad 8 and Up Arrow |
| `61` | **9** | Keypad 9 and PageUp |
| `62` | **0** | Keypad 0 and Insert |
| `63` | **.** | Keypad . and Delete |
| `67` | **=** | Keypad = |
| `85` | **,** | Keypad Comma |

## 5. 其他特殊键 (Misc)

| Usage ID (Hex) | Key Name |
| :--- | :--- |
| `65` | Application |
| `66` | Power |
| `7F` | Mute (Keyboard Page) |
| `80` | Vol Up (Keyboard Page) |
| `81` | Vol Down (Keyboard Page) |
| `9A` | SysReq/Attention |

> **注意**: `A5` - `DF` 在 HUT v1.12+ 中均为 **Reserved**。

## 6. 系统修饰键 (Modifiers) - 0xE0 ~ 0xE7

**这部分是标准 8 字节 Report 的第一字节 (Byte 0)。**

虽然它们有 Usage ID，但在 Report Descriptor 中，通常通过 `Usage Min (E0) / Usage Max (E7)` 将其映射为 8 个独立的 **Bit (位)**，而不是像上面的键那样作为 Array 字节发送。

| Usage ID (Hex) | Key Name | Byte 0 Mask | 说明 |
| :--- | :--- | :--- | :--- |
| `E0` | **Left Control** | `0x01` (Bit 0) | |
| `E1` | **Left Shift** | `0x02` (Bit 1) | |
| `E2` | **Left Alt** | `0x04` (Bit 2) | |
| `E3` | **Left GUI** | `0x08` (Bit 3) | Windows / Command 键 |
| `E4` | **Right Control** | `0x10` (Bit 4) | |
| `E5` | **Right Shift** | `0x20` (Bit 5) | |
| `E6` | **Right Alt** | `0x40` (Bit 6) | |
| `E7` | **Right GUI** | `0x80` (Bit 7) | |