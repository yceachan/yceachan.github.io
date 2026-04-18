# HID 认知体系构建：从协议定义到内核实现
---
**Tags**: `HID`, `Protocol`, `Kernel`, `Report Descriptor`
**Source**: `USB Device Class Definition for HID 1.11`, `Linux Kernel HID Documentation`

---

## 1. 核心隐喻：HID 的本质

HID 协议的核心不仅仅是数据传输，而是一种 **"自描述的脚本语言"**。

*   **Report Descriptor (报表描述符)**：一段 "源代码"。
*   **HID Parser (Host 端)**：一个 "虚拟机/解释器",基于desc，生成并运行**对report报文解读的状态机。**
*   **Report (报表)**：运行时产生的 "数据流"。

理解 HID 的关键在于理解 **Parser 的状态机模型**。

---

## 2. 协议层：描述符的语法 (The Desc Grammar)

基于 *HID Spec 1.11 Section 6.2.2*

### 2.1 Item 格式：指令集详解 (Bytecode & Truth Tables)
HID 描述符由一系列 **Item** 组成。每个 Short Item 的首字节 (Prefix) 结构严谨，决定了后续数据的解析方式。

**字节码公式**: `Prefix = (Tag << 4) | (Type << 2) | Size`

#### A. bSize (最低 2 bits)
指示随后的数据字节数（Data Payload）。
| Value (`b1b0`) | Meaning | Note |
| :--- | :--- | :--- |
| `00` (0) | 0 Bytes | 无数据 (e.g., End Collection) |
| `01` (1) | 1 Byte | `uint8` / `int8` |
| `10` (2) | 2 Bytes | `uint16` / `int16` |
| `11` (3) | 4 Bytes | `uint32` / `int32` (**注意**: 不是 3 bytes) |

#### B. bType (中间 2 bits)
决定指令的作用域和生命周期。
| Value (`b3b2`) | Type | Description |
| :--- | :--- | :--- |
| `00` (0) | **Main** | **动词**。定义 Item，生成数据字段或集合 (Input, Collection)。 |
| `01` (1) | **Global** | **环境**。修改全局状态表 (Usage Page, Report Size)。持久有效。 |
| `10` (2) | **Local** | **参数**。修改局部状态，仅对下一个 Main Item 有效 (Usage)。 |
| `11` (3) | *Reserved* | 保留。 |

#### C. bTag (高 4 bits) - 核心真值表
不同 Type 下，Tag 的含义完全不同。下表列出了最常用的指令：

| Tag (`b7..b4`) | **Main** Item (Type=0) | **Global** Item (Type=1) | **Local** Item (Type=2) |
| :---: | :--- | :--- | :--- |
| `0000` (0) | *Reserved* | **Usage Page** | **Usage** |
| `0001` (1) | *Reserved* | Logical Minimum | Usage Minimum |
| `0010` (2) | *Reserved* | Logical Maximum | Usage Maximum |
| `0011` (3) | *Reserved* | Physical Minimum | Designator Index |
| `0100` (4) | *Reserved* | Physical Maximum | Designator Minimum |
| `0101` (5) | *Reserved* | Unit Exponent | Designator Maximum |
| `0110` (6) | *Reserved* | Unit | *Reserved* |
| `0111` (7) | *Reserved* | **Report Size** | String Index |
| `1000` (8) | **Input** | **Report ID** | String Minimum |
| `1001` (9) | **Output** | **Report Count** | String Maximum |
| `1010` (A) | **Collection** | Push | Delimiter |
| `1011` (B) | **Feature** | Pop | *Reserved* |
| `1100` (C) | **End Collection** | *Reserved* | *Reserved* |

### 2.2 Parser 状态机 (The State Machine)
*Section 5.4 Item Parser* 明确指出：Parser 维护一个 **Global Item State Table**。

1.  **Global Items (全局指令)**：修改全局状态表 (如 `Usage Page`, `Report Size`)。这些设置会**一直保留**，直到被新的 Global Item 覆盖。
2.  **Local Items (局部指令)**：仅对**下一个** Main Item 有效 (如 `Usage`)。处理完 Main Item 后，Local 状态被清空。
3.  **Main Items (执行指令)**：触发 Parser 根据当前的 Global + Local 状态，创建一个新的字段定义 (Field Definition)。

> **推论**：这就是为什么 `Usage Page` 写一次可以用很久，而 `Usage` 必须在每个 `Input` 前重新定义（除非用 Usage Min/Max）。

### 2.3 核心 Item 分类与参数约定

#### A. Main Items (动词：执行定义)
用于生成 Report 中的实际字段。核心指令 `Input`, `Output`, `Feature` 共享一套**位域参数 (Bit Flags)**。

**参数位定义表 (Item Data Payload)**:

| Bit | Flag Name | Value = `0` | Value = `1` | 典型应用场景 |
| :---: | :--- | :--- | :--- | :--- |
| **Bit 0** | **Data Type** | **Data** (有效) | **Constant** (填充) | `Cnst` 用于补齐字节对齐 (Padding) |
| **Bit 1** | **Structure** | **Array** (数组) | **Variable** (变量) | `Var`: 按键位图; `Arr`: 键盘扫描码 |
| **Bit 2** | **Coordinate** | **Absolute** (绝对) | **Relative** (相对) | `Abs`: 触摸屏/摇杆; `Rel`: 鼠标 XY |
| **Bit 3** | **Wrapping** | **No Wrap** | **Wrap** | 仪表盘数值回环 |
| **Bit 4** | **Linearity** | **Linear** | **Non Linear** | 非线性传感器数据 |
| **Bit 5** | **Preference** | **Preferred** | **No Preferred** | 按钮松开自动复位 vs 自锁开关 |
| **Bit 6** | **Null State** | **No Null** | **Null State** | 是否有“未触控”状态 |
| **Bit 7** | *Reserved* | - | - | 必须为 0 |
| **Bit 8** | **Buffer Mode** | **Bit Field** | **Buffered Bytes** | `Size=2` 时有效; 用于透传原始字节流 |

*   **Input**: 设备 -> 主机 (e.g., 键盘按键, 鼠标坐标)。
*   **Output**: 主机 -> 设备 (e.g., 键盘 LED, 游戏手柄震动)。
*   **Feature**: 双向配置 (e.g., 复位设备, 设置回报率)。
*   **Collection**: 逻辑分组 (不使用上述 Flag)。
    *   `Application (0x01)`: 顶层应用 (如 Mouse, Keyboard)。
    *   `Physical (0x00)`: 物理部件 (如 Pointer, Hand)。

#### B. Global Items (环境：定义上下文)
*   **Usage Page (语义页)**: 定义 Usage ID 的高位含义。
    *   `0x01`: **Generic Desktop** (Mouse, Keyboard, Joystick, System Control)。
    *   `0x07`: **Keyboard/Keypad** (具体键值)。
    *   `0x09`: **Button** (按键 1, 2, 3...)。
    *   `0x0C`: **Consumer** (多媒体键, 音量, 播放控制)。
    *   `0x0D`: **Digitizers** (触控板, 触摸屏)。
*   **Logical Min/Max**: 变量的逻辑取值范围 (Parser 视角的数值)。
    *   *注意*: 对于有符号数 (如 -127)，需使用补码表示。
*   **Report Size**: 字段位宽 (Bits)。
*   **Report Count**: 字段重复次数。
*   **Report ID**: 多报表标识符 (非零值)。

#### C. Local Items (名词：具体对象)
*   **Usage (语义 ID)**: 具体的能指。
    *   需查阅《HID Usage Tables》文档。
    *   *Example*: 在 Generic Desktop Page 下，Usage `0x30` = X, `0x31` = Y。
*   **Usage Min/Max**: 批量定义，常与 Array 类型的 Input 配合使用。
    *   *Example*: `Usage Min(1), Usage Max(3)` 等价于 `Usage(1), Usage(2), Usage(3)`。

---

## 3. 实现层：数据的流动 (The Implementation)

### 3.0 描述符上报机制 (Discovery & Enumeration)

开发者在实现 HID 功能时，必须完成以下 Checklist，确保 Host 能正确“认知”设备。

#### [TODO] 开发者必读：3.0 描述符集成检查项
在代码中填入 Report Descriptor 只是第一步，你必须完善以下周边设施：

**Case A: 传统 USB-HID 设备**
- [ ] **Interface Descriptor**: 确保 `bInterfaceClass` 设为 `0x03` (HID Class)。
- [ ] **HID Descriptor**: 在 Interface 描述符后紧跟 HID Descriptor (Type `0x21`)，其中明确指定 Report Desc 的长度。
- [ ] **Endpoint Descriptor**: 必须包含一个 Interrupt IN 端点用于数据上报。
- [ ] **Control Request Handle**: 在 `SETUP` 阶段响应 `Get_Descriptor(Type=0x22, Index=0)` 请求，返回具体的 Report Descriptor 字节流。

**Case B: BLE HOGP 设备 (HID over GATT)**
- [ ] **HID Service**: 实例化 `0x1812` 服务。
- [ ] **Protocol Mode**: 实现 `0x2A4E` (Protocol Mode)，支持 Boot/Report 模式切换（通常默认 Report）。
- [ ] **Report Map**: 实现 `0x2A4B` (Report Map) 特征值。
    - **Property**: Read Only (部分情况需加密)。
    - **Value**: 原始的 Report Descriptor 二进制数据。
- [ ] **HID Information**: 实现 `0x2A4A`，填写 `bcdHID` (e.g., `0x0111`) 和 `bCountryCode`。
- [ ] **External Report Reference**: (可选) 如果引用了 Battery Service，需在 Report Map 旁添加 Descriptor 指向 Battery Level。

### 3.1 report 比特流处理
Host 接收到数据后，是根据描述符的定义来**切分比特流**的。

*   **规则**: `Total Bits = Report Size * Report Count`。
*   **对齐**: 虽然协议允许非对齐传输，但为了固件处理方便，通常使用 `Padding` (填充) 补齐到 8 bits (1 byte) 边界。
    *   *技巧*: 使用 `Input (Constant)` 来声明填充位，不分配 Usage。

### 3.2 引导协议 (Boot Protocol)
*Appendix B*
为了在无驱动环境（BIOS）下工作，HID 定义了强制的标准报表格式。
*   **Keyboard**: 8 Bytes (Modifiers, Reserved, Key1...Key6)。
*   **Mouse**: 3 Bytes (Buttons, X, Y)。
*   *关键点*: 如果声明支持 Boot Protocol (`bInterfaceSubClass=1`)，设备必须能够发送这种固定格式，**无论** Report Descriptor 如何描述。

---

## 4. 内核层：Linux HID 子系统解析

基于 *Linux Kernel HID Introduction*

### 4.1 从 Descriptor 到 Event 的映射
Kernel 的核心工作是将 HID 语义转化为 Linux Input Event (`evdev`)。

1.  **Parsing**: `hid-core` 读取 Descriptor，建立 `hid_field` 结构体树。
2.  **Mapping**:
    *   `HID_UP_GENDESK` (Generic Desktop) -> `EV_REL` / `EV_ABS` (鼠标移动/摇杆)。
    *   `HID_UP_KEYBOARD` -> `EV_KEY` (键盘按键)。
    *   `HID_UP_BUTTON` -> `EV_KEY` (鼠标按键)。
3.  **Transport**:
    *   **Interrupt IN**: 周期性轮询 Input Report (低延迟)。
    *   **Control Pipe**: 传输 Feature Report 或 Output Report (如点亮 LED)。


---

## 5. 认知总结：固件开发的指导原则

1.  **State Machine 思维**：写描述符时，脑子里要有一个 Parser，记住当前的 Global State 是什么。不要重复写 `Report Size(8)` 如果它没变。
2.  **Usage 是核心**：Host 根本不关心你的第 3 个字节是 X 还是 Y，它只关心哪个字节被标记为了 `Usage(X)`。你甚至可以把 X 轴放在 Y 轴后面，只要描述符写对，驱动就能识别。
3.  **Boot Protocol 兼容性**：做键盘鼠标时，首个 Report 必须兼容 Boot 格式，否则进不了 BIOS 设置界面。
4.  **Padding 的艺术**：善用 `Constant` Input 来填充字节，让固件里的 `struct` 能够字节对齐，避免痛苦的位操作。