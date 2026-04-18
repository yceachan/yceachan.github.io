这正是嵌入式工程师需要的“庖丁解牛”式视角。我们自底向上，从字节码定义到协议栈传输，层层剥开。

---

### 第一层：定义世界 —— Report Descriptor (报文描述符)

在 USB/HID 协议中，设备不直接发送 "A" 或 "B"，而是发送一串二进制数据（Payload）。**Report Descriptor** 就是一本“字典”，告诉主机如何翻译这串二进制数据。它是一种基于 Item 的[[嵌入式HID设备开发——自底向上视角_v0]]字节码语言。

#### 1. 标准键盘 (Boot Keyboard) 的描述符解析

这是最兼容的 8 字节结构：`[Modifier] [Reserved] [Key1] [Key2] [Key3] [Key4] [Key5] [Key6]`。

C

```
// 伪代码/Hex 对照
0x05, 0x01,        // Usage Page (Generic Desktop Ctrls)
0x09, 0x06,        // Usage (Keyboard)
0xA1, 0x01,        // Collection (Application) -> 开始

    // --- 第1字节：修饰键 (Ctrl, Shift, Alt, GUI) ---
    0x05, 0x07,    //   Usage Page (Keyboard/Keypad)
    0x19, 0xE0,    //   Usage Minimum (0xE0 = Left Control)
    0x29, 0xE7,    //   Usage Maximum (0xE7 = Right GUI)
    0x15, 0x00,    //   Logical Minimum (0)
    0x25, 0x01,    //   Logical Maximum (1)
    0x75, 0x01,    //   Report Size (1) -> 每个数据占1 bit
    0x95, 0x08,    //   Report Count (8) -> 一共8个
    0x81, 0x02,    //   Input (Data, Var, Abs) -> 这是一个变量，不是数组

    // --- 第2字节：保留字节 (Reserved) ---
    0x95, 0x01,    //   Report Count (1)
    0x75, 0x08,    //   Report Size (8) -> 8 bits
    0x81, 0x03,    //   Input (Const, Var, Abs) -> 常量，主机忽略

    // --- 第3-8字节：普通键值数组 (Key Array) ---
    0x95, 0x06,    //   Report Count (6) -> 6个按键槽
    0x75, 0x08,    //   Report Size (8) -> 每个槽 8 bits
    0x15, 0x00,    //   Logical Minimum (0)
    0x25, 0x65,    //   Logical Maximum (101) -> 覆盖大部分常用键
    0x05, 0x07,    //   Usage Page (Key Codes)
    0x19, 0x00,    //   Usage Minimum (0)
    0x29, 0x65,    //   Usage Maximum (101)
    0x81, 0x00,    //   Input (Data, Array, Abs) -> 关键！Array类型表示只上报按下的索引

0xC0               // End Collection
```

#### 2. 全键无冲 (NKRO) 的本质区别

标准键盘用 `Array`，只能存 6 个 Usage ID。NKRO 键盘必须将 `Input` 定义为 `Bitmap`（位图）。

- **逻辑**：不是“发回按下的键的ID”，而是“发回一张巨大的表，每一位代表一个键，1表示按下，0表示抬起”。
  
- **代价**：报文会变长（例如 104 键至少需要 13 字节）。
  

C

```
// NKRO 描述符片段
0x05, 0x07,    // Usage Page (Keyboard)
0x19, 0x00,    // Usage Min (0)
0x29, 0x7F,    // Usage Max (127) -> 覆盖128个键
0x15, 0x00,    // Logical Min (0)
0x25, 0x01,    // Logical Max (1) -> 只有0/1状态
0x75, 0x01,    // Report Size (1) -> 1 bit per key
0x95, 0x80,    // Report Count (128) -> 128 bits total
0x81, 0x02,    // Input (Data, Variable, Absolute) -> 关键：Variable 而非 Array
```

#### 3. 组合键与多媒体 (Consumer Page)

多媒体键（音量、播放）不属于 Keyboard Page (0x07)，而是属于 **Consumer Page (0x0C)**。通常会引入 **Report ID** 来在一个设备中区分不同类型的数据包。

- **Report ID 1**: 键盘数据
  
- **Report ID 2**: 多媒体数据
  

C

```
// 多媒体描述符片段
0x05, 0x0C,        // Usage Page (Consumer)
0x09, 0x01,        // Usage (Consumer Control)
0xA1, 0x01,        // Collection (Application)
0x85, 0x02,        //   Report ID (2) -> 只要发多媒体，开头第一个字节必须是0x02
0x09, 0xE9,        //   Usage (Volume Up)
0x09, 0xEA,        //   Usage (Volume Down)
0x09, 0xE2,        //   Usage (Mute)
...
0x75, 0x01,        //   Report Size (1)
0x95, 0x03,        //   Report Count (3)
0x81, 0x02,        //   Input (Data, Var, Abs)
...
```

---

### 第二层：时间与触发 —— 扫描与上报机制

这里有一个常见的误区。我们需要区分 **MCU 内部的采集** 和 **对 PC 的上报**。

#### 1. 扫描：中断还是轮询？

- **按键检测**：虽然你可以用 GPIO 中断来唤醒 MCU（低功耗需要），但为了去抖和矩阵扫描，**定时器轮询 (Timer Polling)** 是主流。例如每 5ms 扫描一次整个矩阵。
  
- **状态维护**：MCU 内存中维护一个 `Current_State` 和 `Previous_State`。只有当状态发生变化（Diff）时，才触发上报逻辑。
  

#### 2. 上报：固定回报率 (Polling Rate) 的真相

在 USB 时代，是 Host 主动轮询 Device (Polling)。

在 **BLE (Bluetooth Low Energy)** 时代，机制变了：

- **Notification (通知)**：键盘不需要等 PC 问，而是主动“推”数据给 PC。
  
- **Connection Interval (连接间隔)**：这是蓝牙射频的物理心跳。
  
    - 即使你代码里写了 `while(1) { send_report(); }`，数据也只会在每一个 **Connection Event**（锚点）被射频发出去。
      
    - **电竞模式**：将 Connection Interval 协商到最小（通常 7.5ms）。
      
    - **节能模式**：Interval 可能高达 50ms - 100ms。
      

**结论**：MCU 是 **“事件驱动”** 地调用发送 API（只在按键变化时调用），但数据最终是 **“按时间切片”**（由连接间隔决定）离开射频天线的。所谓的“1000Hz 回报率”在 BLE 上通常做不到（BLE 极限约 133Hz，即 7.5ms 一次），除非使用非标准私有协议。

---

### 第三层：协议栈穿梭 —— 从 App 到 Antenna

当你的固件调用 `ble_hids_inp_rep_send()` (Nordic SDK 为例) 时，数据经历了漫长的旅程。

#### 1. Application Layer (App)

- **动作**：MCU 组装好 `uint8_t report[8]`。
  
- **API**：调用协议栈提供的 GATT Server API，指定 Handle（对应 Report Characteristic）。
  

#### 2. Host Layer (L2CAP & ATT/GATT)

这是运行在 MCU 里的软件协议栈核心。

- **ATT (Attribute Protocol)**：将你的 `report` 包装成一个 **OpCode 为 Notification (0x1B)** 的包。
  
- **L2CAP (Logical Link Control and Adaptation Protocol)**：
  
    - 这是多路复用层。它给 ATT 包加上头部，指定 **Channel ID (CID = 4)**，表示这是 ATT 协议的数据。
      
    - 如果数据过长（超过 MTU），L2CAP 负责分片（Segmentation）。
      

#### 3. HCI (Host Controller Interface)

这是软硬件的分界线。

- **位置**：在单芯片方案（如 nRF52/ESP32）中，HCI 是虚拟的函数调用；在双芯片方案中，它是 UART/USB 线路。
  
- **封包**：L2CAP 数据被封装进 **HCI ACL Data Packet**。
  
- **指令**：Host 告诉 Controller：“把这堆数据放到 Handle x 的连接里发出去”。
  

#### 4. Controller Layer (Link Layer & PHY)

这是硬件/射频固件层。

- **Buffer**：数据进入 TX FIFO。
  
- **Anchor Point**：Controller 等待下一个时隙（Time Slot）到来。
  
- **Air**：调制解调器将二进制转为 2.4GHz 无线电波发出。
  

---

### 第四层：身份与认可 —— Pairing & HOGP

蓝牙键盘要能用，必须让 PC 认出它是“键盘”。

#### 1. Pairing (SMP - Security Manager Protocol)

HID 设备对安全性要求高，必须加密。

1. **Feature Exchange**：键盘告诉 PC “我有输入输出能力，支持加密”。
   
2. **Key Generation**：使用 ECDH 算法协商共享密钥。
   
3. **Authentication**：
   
    - **Just Works**：没有屏幕的键盘常用，静默配对。
      
    - **Passkey Entry**：PC 弹出一串数字（如 123456），用户在蓝牙键盘上盲打并回车。这是最安全的。
    
4. **Key Distribution**：交换 **LTK (Long Term Key)**。以后重连直接用 LTK 加密，不需要重新配对（Bonding）。
   

#### 2. HOGP (HID over GATT Profile)

这是 BLE 模拟 USB HID 的标准化流程。

当 PC 连接上键盘后，会进行 **Service Discovery**（服务发现）：

1. **Find Service**: PC 搜索 UUID `0x1812` (Human Interface Device)。
   
2. **Read Map**: PC 读取 `Report Map` Characteristic。**这就是你第一步写的 Report Descriptor 被传给 PC 的时刻！**
   
3. **Parse**: PC 的 HID 驱动解析描述符，生成虚拟的 HID 设备节点。
   
4. **Enable CCCD**: PC 向 `Report` Characteristic 的 CCCD (Client Characteristic Configuration Descriptor) 写入 `0x0001`。
   
    - **含义**：“我准备好了，允许你发送 Notification”。
    
5. **Ready**: 此时，MCU 才有权限调用发送 API 推送按键数据。
   

### 总结图谱

- **定义 (Descriptor)**: 决定了 PC 认为你是键盘还是鼠标，是 6 键还是全键无冲。
  
- **触发 (Scan)**: 硬件定时器去抖，变化时触发逻辑。
  
- **传输 (Stack)**: App -> GATT/ATT -> L2CAP -> HCI -> Link Layer。
  
- **注册 (HOGP)**: 通过 GATT 读取描述符，通过 SMP 保证链路加密。
  

这套体系打通后，你就能理解为什么有时候键盘连上了但不能打字（可能是 CCCD 没开），或者为什么某些键没反应（Report Descriptor 里的 Usage Max 没覆盖到）。