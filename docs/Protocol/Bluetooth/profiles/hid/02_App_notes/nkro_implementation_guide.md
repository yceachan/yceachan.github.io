# 机械键盘全键无冲 (NKRO) 实现指南

**NKRO (N-Key Rollover)** 是机械键盘的核心卖点之一，指键盘能够同时无冲突地注册所有按键。其技术核心在于改变 HID Report Descriptor 的定义方式。

---

## 1. 核心原理：Array vs Variable

全键无冲的本质区别在于 `Input` Item 的参数配置：从 **"数组索引 (Array)"** 变为 **"位图 (Bitmap/Variable)"**。

| 特性 | 传统 6KRO (Boot Protocol) | NKRO (全键无冲) |
| :--- | :--- | :--- |
| **Input 参数** | `Data, Array` | `Data, Variable` |
| **逻辑含义** | "告诉我当前按下的键的 **ID** 是什么" | "告诉我 **Usage ID 0~FF** 每个键的状态 (0/1)" |
| **数据结构** | 固定长度数组 (通常 6 Byte) | 长位图 (Bitmap, 每一位对应一个键) |
| **冲突表现** | 按下第 7 个键时溢出 (Phantom/ErrorRollOver) | 104 个键同时按下互不影响 |
| **带宽效率** | 高 (只传变化的 ID) | 低 (每次都要传完整的 100+ bits) |

---

## 2. 描述符实现 (The Descriptor)

以下是业界通用的 **Bitmap NKRO** 描述符结构。通常使用约 13-16 字节来覆盖标准键盘区域。

```c
0x05, 0x01,        // Usage Page (Generic Desktop)
0x09, 0x06,        // Usage (Keyboard)
0xA1, 0x01,        // Collection (Application)
0x85, 0x02,        //   Report ID (2) -> 区分于 Boot Keyboard (ID 1)

    // --- 1. Modifiers (8 bits) ---
    // 与标准键盘一致，处理 Ctrl/Shift/Alt/GUI
    0x05, 0x07,    //   Usage Page (Keyboard)
    0x19, 0xE0,    //   Usage Min (Left Ctrl)
    0x29, 0xE7,    //   Usage Max (Right GUI)
    0x15, 0x00,    //   Logical Min (0)
    0x25, 0x01,    //   Logical Max (1)
    0x75, 0x01,    //   Report Size (1 bit)
    0x95, 0x08,    //   Report Count (8)
    0x81, 0x02,    //   Input (Data, Var, Abs)

    // --- 2. The NKRO Bitmap (120 bits = 15 bytes) ---
    // 核心魔法：一次性定义从 0x00 到 0x77 的所有键
    // 涵盖了 A-Z, 0-9, F1-F24, 以及常用编辑键
    0x19, 0x00,    //   Usage Min (Reserved 0x00)
    0x29, 0x77,    //   Usage Max (0x77) -> 覆盖 120 个键
    0x15, 0x00,    //   Logical Min (0)
    0x25, 0x01,    //   Logical Max (1)
    
    0x75, 0x01,    //   Report Size (1 bit) -> 每个 Usage 占 1 bit
    0x95, 0x78,    //   Report Count (120) -> 一共 120 个 bit
    0x81, 0x02,    //   Input (Data, Var, Abs) -> 注意是 Variable!

    // (可选) 补齐字节对齐 (Padding)
    // 8 (Mods) + 120 (Keys) = 128 bits = 16 Bytes. 正好对齐，无需 Padding。

0xC0               // End Collection
```

---

## 3. 报文结构对比 (Packet Analysis)

假设用户同时按下了 `A` (Usage 0x04) 和 `S` (Usage 0x16)。

### 3.1 6KRO Packet (Array Mode)
数据精简，直接传输 Usage ID。
```text
Byte 0: Modifiers
Byte 1: Reserved
Byte 2: 0x04 (Usage ID for A)
Byte 3: 0x16 (Usage ID for S)
Byte 4-7: 0x00 (Empty)
```

### 3.2 NKRO Packet (Bitmap Mode)
数据庞大，传输的是 Bitmask。
*   **Byte 0**: Modifiers
*   **Byte 1** (Usage 0x00-0x07): `00010000` (Bit 4 set -> Usage 0x04 'A')
*   **Byte 2** (Usage 0x08-0x0F): `00000000`
*   **Byte 3** (Usage 0x10-0x17): `01000000` (Bit 6 set -> Usage 0x16 'S')
*   ... 后续字节均为 0 ...

---

## 4. 兼容性挑战与解决方案 (BIOS & Legacy)

**痛点**: 许多主板 BIOS 或老旧 KVM 切换器只支持标准的 **Boot Protocol (6KRO)**，无法解析 NKRO 的长报文。

### 解决方案 A: 复合设备 (Composite Device)
最推荐的做法。
*   **Interface 0**: 声明为 Boot Keyboard，发送 6KRO Report。用于 BIOS/启动阶段。
*   **Interface 1**: 声明为 NKRO Keyboard，发送 NKRO Report。OS 启动后优先使用。

### 解决方案 B: 动态切换 (Dynamic Switching)
*   **默认**: 上电发送 6KRO 报文 (Report ID 1)。
*   **切换**: 检测到 OS 驱动就绪，或用户按下 `Fn + N`，切换到 NKRO 模式 (Report ID 2)。

### 解决方案 C: 大数组 (The "Dirty Hack")
保持 `Input (Array)` 模式，但暴力增加数组长度。
*   `Report Count (60)` -> 允许同时按下 60 个键。
*   **优点**: 比 Bitmap 兼容性略好，且逻辑简单。
*   **缺点**: 传输效率极低（大部分是空的 0x00），且仍可能被某些严格限制包长的 Host 拒绝。
