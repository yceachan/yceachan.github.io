# HOGP 设备完整初始化流程：从广播到可用

**文档目标**: 为 HOGP (HID over GATT Profile) 设备提供一个从上到下的完整初始化流程指南。本文档关注“做什么”与“为什么”，而非底层报文细节。

**核心流程**: `GAP 发现 -> LL 连接 -> SMP 加密 -> GATT 服务发现与配置`

---

## 阶段〇：发现与识别 (GAP Layer)

在此阶段，主机(Host)对设备(Device)一无所知，需要通过广播来识别它。

*   **设备行为：广播 (Advertising)**
    设备必须在广播包中包含以下信息，以便被主机正确识别为 HID 设备：
    1.  **Flags**: `0x06` - 表明设备是“LE General Discoverable”且“BR/EDR Not Supported”。
    2.  **Appearance**: `0x03C1` (键盘) 或 `0x03C2` (鼠标) - 供主机 UI 显示正确图标。
    3.  **Service UUID List**: 必须包含 HID 服务的 UUID `0x1812`。这是主机过滤设备的核心依据。

*   **主机行为：扫描 (Scanning)**
    主机扫描广播，并专门寻找广播包中包含 UUID `0x1812` 的设备。

## 阶段一：连接与安全 (LL & SMP Layers)

当用户选择连接设备后，基础链路和安全层开始建立。

1.  **建立连接 (LL Connection)**: 主机向设备发送 `CONNECT_IND` 请求，双方建立 Link Layer 连接，进入按连接间隔同步通信的状态。

2.  **建立安全 (SMP Pairing)**: **HOGP 规范强制要求**。在进行任何GATT操作前，链路必须通过配对(Pairing)和绑定(Bonding)完成 **AES-128 加密**。这是为了防止“按键注入”等恶意攻击。

## 阶段二：服务发现 (GATT Service Discovery)

链路加密后，主机开始“查户口”，弄清设备到底提供了哪些服务。HOGP 设备不只有 HID 服务。

*   **主机行为**: 主机通过“Read By Group Type Request”遍历设备的所有服务。
*   **目标服务集**:
    *   **HID Service (`0x1812`)**: **[核心]** 提供人机交互功能。
    *   **Device Information Service (DIS, `0x180A`)**: **[强制]** 提供设备信息，如厂商、型号，特别是 `PnP_ID (0x2A50)`，供操作系统加载正确的驱动。
    *   **Battery Service (BAS, `0x180F`)**: **[推荐]** 提供电池电量信息，供操作系统 UI 显示。

## 阶段三：特征与描述符解析 (GATT Characteristic & Descriptor Parsing)

找到服务后，主机需要进一步钻取，弄清每个服务的具体功能。

1.  **读取 Report Map (`0x2A4B`)**: 这是最关键的第一步。主机必须先读取并解析 HID 服务下的 Report Map 特征。这张“地图”定义了后续 Report 数据的格式、长度和含义。**不理解地图，就无法解析数据**。

2.  **解析 Report (`0x2A4D`) 角色**:
    *   HID Report 不只有一种。主机需要查找 `Report Reference` 描述符 (`0x2908`) 来区分不同的 Report。
    *   **Report Reference** 定义了 Report 的 ID 和类型：
        *   **Type 1**: Input Report (设备 -> 主机，如按键按下)
        *   **Type 2**: Output Report (主机 -> 设备，如控制键盘 LED 灯)
        *   **Type 3**: Feature Report (可双向读写，如配置信息)

3.  **定位 CCCD (`0x2902`)**: 对于 Input Report，主机必须找到其客户端特性配置描述符 (Client Characteristic Configuration Descriptor, CCCD)。这个描述符是开启/关闭数据通知的“开关”。

## 阶段四：配置与激活 (GATT Configuration & Activation)

一切准备就绪，主机开始下发配置，激活设备的数据上报功能。

1.  **(可选) 设定 Protocol Mode (`0x2A4E`)**: 某些设备需要主机显式写入进入“Report Protocol Mode”。
2.  **使能通知 (Enable Notification)**: 主机向 Input Report 的 **CCCD 句柄**写入值 `0x0001`。此操作授权设备可以开始主动上报数据。

## 阶段五：缓存与回连 (GATT Caching & Reconnection)

为了避免每次连接都重复上述繁琐的发现过程，蓝牙引入了缓存机制。

*   **绑定 (Bonding)**: 首次配对时，如果双方进行了绑定，主机会将服务、特征、描述符的 **Handle 映射表**以及 **CCCD 的配置状态**缓存到本地非易失性存储中。
*   **快速回连**: 下次连接时，只要设备的 `Service Changed` 特征没有指示服务已变更，主机就会**跳过阶段二至阶段四**，直接使用缓存的 Handle 进行通信，实现毫秒级快速回连。

---
## 附录：完整初始化时序图

```mermaid
sequenceDiagram
    participant C as Host (Central)
    participant D as Device (Peripheral)

    D->>C: Advertising (GAP, with UUID 0x1812)
    C->>D: CONNECT_IND (LL)
    Note over C,D: Connection Established

    C->>D: Security Request (SMP)
    D-->>C: Pairing/Encryption Flow
    Note over C,D: Link Encrypted (HOGP Mandatory)

    C->>D: GATT: Discover Services (HID, DIS, BAS)
    D-->>C: GATT: Service Discovery Response

    C->>D: GATT: Discover Characteristics (Report Map, Report, PnP_ID etc.)
    D-->>C: GATT: Characteristic Discovery Response

    C->>D: GATT: Discover Descriptors (CCCD, Report Ref.)
    D-->>C: GATT: Descriptor Discovery Response

    C->>D: GATT: Read Report Map
    D-->>C: GATT: Report Map Value (may require multiple Read Blob)

    C->>D: GATT: Read PnP_ID from DIS
    D-->>C: GATT: PnP_ID Value

    C->>D: GATT: Write to CCCD (Value: 0x0001, Enable Notification)
    D-->>C: GATT: Write Response

    Note over C,D: Device is now Active & Ready!

    D->>C: GATT: Handle Value Notification (Input Report on key press)
    ...
```
