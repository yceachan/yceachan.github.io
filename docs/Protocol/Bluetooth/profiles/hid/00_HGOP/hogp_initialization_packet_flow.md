# HOGP 初始化与配置：ATT 报文全解析

> **前置语境**: 本文档接续 [HID Report 全栈数据流解构](hid-report_2_RF_packet_flow.md)。
> 当设备与主机（Host）完成配对（Pairing）与加密（Encryption）后，进入**服务发现与配置**阶段。
> 这是主机建立“UUID -> Handle”映射表（"查户口"）并正式启用设备的唯一过程。

---

## 1. 核心目标：构建映射表 (Handle Mapping)

在发送任何按键之前，主机必须遍历设备的所有服务，将标准 UUID 解析为具体的 16-bit Handle。

**目标映射表 (Host RAM 缓存)**:
| 逻辑功能 | 标准 UUID | 发现的 Handle (举例) |
| :--- | :--- | :--- |
| **HID Service** | `0x1812` | Range: `0x0010` - `0x0025` |
| Protocol Mode | `0x2A4E` | `0x0012` |
| Report (Input) | `0x2A4D` | **`0x0015`** (关键!) |
| CCCD (Notify 开关) | `0x2902` | `0x0016` |
| Report Map | `0x2A4B` | `0x0019` |

以下将“显微镜”移至 ATT 层，观察这一过程是如何通过报文交互完成的。

---

## 2. 阶段一：服务发现 (Primary Service Discovery)

主机问：“你有 HID 服务吗？在哪？”

### 2.1 请求：Read By Group Type Request
主机搜索 UUID 为 `0x1812` 的主服务。

*   **ATT Opcode**: `0x10` (Read By Group Type Req)
*   **Handle Range**: `0x0001` - `0xffff` (全盘搜索)
*   **UUID**: `0x1812` (HID Service)

**ATT PDU (7 Bytes)**:
```text
10 01 00 FF FF 12 18
^  ^---^ ^---^ ^---^
Op Start End   UUID(Little Endian)
```

### 2.2 响应：Read By Group Type Response
设备答：“有，在 `0x0010` 到 `0x0025` 之间。”

*   **ATT Opcode**: `0x11` (Rsp)
*   **Length**: `0x06` (每个条目的长度)
*   **Data**: `Attribute Handle (2) + End Group Handle (2) + UUID (2)`

**ATT PDU (8 Bytes)**:
```text
11 06 10 00 25 00 12 18
^  ^  ^---^ ^---^ ^---^
Op Len Start End   UUID
```
> **结论**: 主机现在知道 HID 服务的所有内容都在 Handle **`0x0010` ~ `0x0025`** 这个范围内。后续搜索只针对这个范围，大大缩小了搜索圈。

---

## 3. 阶段二：特征值发现 (Characteristic Discovery)

主机问：“在这个范围内，都有哪些具体的特征（Report, Map, Protocol Mode...）？”

### 3.1 请求：Read By Type Request
主机在锁定范围内搜索“特征声明” (UUID `0x2803`)。

*   **ATT Opcode**: `0x08` (Read By Type Req)
*   **Range**: `0x0010` - `0x0025`
*   **UUID**: `0x2803` (GATT Characteristic Declaration)

**ATT PDU (7 Bytes)**:
```text
08 10 00 25 00 03 28
^  ^---------^ ^---^
Op Range       UUID(Decl)
```

### 3.2 响应：Read By Type Response (关键!)
这是**UUID 与 Handle 绑定的时刻**。设备会返回列表。

*   **ATT Opcode**: `0x09` (Rsp)
*   **Length**: `0x07` (每个条目 7 字节)
*   **Entry 1**:
    *   **Decl Handle**: `0x0011`
    *   **Properties**: `0x06` (Read, Write No Response) -> Protocol Mode
    *   **Value Handle**: **`0x0012`** (主机记下：以后操作Protocol Mode就找它)
    *   **UUID**: `4E 2A` (`0x2A4E`)
*   **Entry 2**:
    *   **Decl Handle**: `0x0014`
    *   **Properties**: `0x12` (Read, Notify) -> Report
    *   **Value Handle**: **`0x0015`** (主机记下：以后收Input Report就看它)
    *   **UUID**: `4D 2A` (`0x2A4D`)

**ATT PDU (可变长, 假设返回两个)**:
```text
09 07 11 00 06 12 00 4E 2A 14 00 12 15 00 4D 2A ...
^  ^  ^---------------^ ^-^ ^---------------^ ^-^
Op Len    Entry 1      UUID    Entry 2       UUID
```

---

## 4. 阶段三：描述符发现 (Descriptor Discovery)

对于 `Report (0x2A4D)` 这种复杂的特征，主机还需要知道：“这是 Input 还是 Output？ID 是多少？我有权开启 Notify 吗？”
这需要搜索特征值 Handle (`0x0015`) 之后的描述符。

### 4.1 发现 CCCD 和 Report Reference
主机搜索 `0x0015` 之后的内容。

*   **Find Information Response** (简化展示):
    *   Handle `0x0016`: UUID `0x2902` (CCCD - 开关)
    *   Handle `0x0017`: UUID `0x2908` (Report Reference - ID定义)

---

## 5. 阶段四：读取报表描述符 (Read Report Desc)

在配置设备之前，主机必须知道 Report 的具体格式（8字节还是2字节？）。
这通过读取 UUID `0x2A4B` (Report Desc) 来完成。由于描述符通常长达上百字节，远超单包 MTU (23字节)，**分包读取**是必然发生的。

### 5.1 首包读取：Read Request
主机尝试读取 Map 的 Handle（假设为 `0x0019`）。

*   **ATT Opcode**: `0x0A` (Read Req)
*   **Handle**: `0x0019`

**ATT PDU (3 Bytes)**:
```text
0A 19 00
```

**响应 (Read Rsp)**:
设备返回前 22 字节数据（假设 MTU=23）。
```text
0B 05 01 09 06 A1 01 ... (22 Bytes Data)
^  ^-------------------^
Op Data
```

### 5.2 后续读取：Read Blob Request (长读)
主机发现没读完（返回长度 = MTU-1），发起“断点续传”。

*   **ATT Opcode**: `0x0C` (Read Blob Req)
*   **Handle**: `0x0019`
*   **Offset**: `0x0016` (22)

**ATT PDU (5 Bytes)**:
```text
0C 19 00 16 00
^  ^---^ ^---^
Op Handle Offset(22)
```

**响应 (Read Blob Rsp)**:
设备返回接下来的数据。此过程循环直至读完。

> **缓存机制 (Caching)**: 这一步仅在**首次配对**或**服务变更**时发生。回连时，主机直接使用本地缓存的 Map，完全跳过此阶段。

---

## 6. 阶段五：配置与使能 (Configuration)

地图绘制完毕，主机开始下发指令，正式“激活”设备。

### 5.1 步骤一：切换模式 (Set Protocol Mode)
进入 OS 环境，主机要求切换到 Report Protocol Mode。

*   **Action**: Write Without Response to Handle `0x0012` (Protocol Mode).
*   **Value**: `0x01` (Report Mode).

**ATT PDU (4 Bytes)**:
```text
52 12 00 01
^  ^---^ ^
Op Handle Data
```
*(Opcode 0x52 = Write Command)*

### 5.2 步骤二：开启通知 (Enable Notification - CCCD)
这是**最关键**的一步。主机告诉设备：“我准备好了，你可以推数据了。”

*   **Action**: Write Request to Handle `0x0016` (CCCD).
*   **Value**: `0x0001` (Bit 0 = Notify Enable).

**ATT PDU (Req) (5 Bytes)**:
```text
12 16 00 01 00
^  ^---^ ^---^
Op Handle Data(0001)
```
*(Opcode 0x12 = Write Request)*

**ATT PDU (Rsp) (1 Byte)**:
```text
13
^
Op (Write Response)
```
> **注意**: 只有收到这个 `0x13` 响应后，设备才有权发送 `0x1B` (Notification) 报文。否则会被视为违反协议断开连接。

---

## 6. 固化与缓存 (Caching & Bonding)

上述过程非常繁琐，涉及几十次交互。为了体验，BLE 引入了 **GATT Caching**。

1.  **Bonding (绑定)**: 如果设备与主机进行了配对并绑定（Bonding）。
2.  **Service Changed CCCD**: 只要设备的 `Service Changed` 特征没被触发（即固件没升级、GATT表没变）。
3.  **结果**: 主机在**第二次连接时**，会**跳过**上述所有 Discovery 步骤（阶段 1-3），直接使用上次存在 Flash 里的 Handle 映射表。
4.  **CCCD 状态**: 甚至连“阶段四（开启通知）”都可以跳过，因为 CCCD 的状态也是必须持久化存储的。

这就是为什么第一次连接慢，后面重连只需几百毫秒的原因。
