---
title: BLE 角色全景解析：Peripheral/Central vs Server/Client vs Advertiser/Scanner
tags: [Zephyr, Bluetooth, BLE, GAP, GATT, Link-Layer, Terminology]
desc: 深度辨析低功耗蓝牙 (BLE) 中最容易混淆的角色定义，理清 GAP 层、GATT 层与链路层 (Link Layer) 的正交关系。
update: 2026-02-27
---

# BLE 角色全景解析：哪种命名更准确？

在学习低功耗蓝牙 (BLE) 时，初学者最痛苦的莫过于被满天飞的术语包围：“我的设备到底是个 Peripheral，是个 Server，还是个 Advertiser？”

针对您的疑问：**“外设/中心 (Peripheral/Central) 和 Client/Server 哪种命名更准确？”**
**答案是：它们都极其准确，但它们描述的是 BLE 协议栈中【完全不同层级】的行为。它们是正交（互不干扰）的关系。**

要彻底搞懂，我们必须将 BLE 协议栈像千层饼一样切开，分层来看角色定义。

> [!note]
>
> 物理形态角色： 
>
> - Peripheral : 传感器，键盘，etc
> - Central : phone，pc，etc

---

## 1. 链路层角色 (Link Layer Roles) —— 谁在说话，谁在听？

链路层 (LL) 位于最底层，只关心射频芯片此刻在干什么。

*   **Advertiser (广播者)**：正在空中发送数据包的设备。它在特定的信道上“大喊大叫”。
*   **Scanner (扫描者)**：正在监听广播信道的设备。它在默默“偷听”。
*   **Master (主设备) / Slave (从设备)**：**仅在建立连接后才有的概念。** 发起连接请求的 Scanner 变成了 Master（负责控制时序和跳频），被连接的 Advertiser 变成了 Slave（听从指挥）。

> **一句话总结**：这是**物理射频层面**的角色。

---

## 2. GAP 层角色 (Generic Access Profile) —— 谁连接谁？(拓扑结构)

GAP 层建立在链路层之上，它定义了设备如何发现彼此、如何建立连接。这是我们最常用来**定义设备产品形态**的角色。

GAP 定义了 4 种标准角色，它们是按照“是否可连接”和“发起方/接收方”来划分的：

### 不建立连接的组合 (单向广播)
*   **Broadcaster (广播者)**：**只广播，不接受连接。**
    *   *底层行为*：它是一个永远的 Advertiser。
    *   *典型应用*：温度计信标 (Beacon)、苹果 AirTag（寻找模式）。
*   **Observer (观察者)**：**只扫描，不发起连接。**
    *   *底层行为*：它是一个永远的 Scanner。
    *   *典型应用*：蓝牙网关（只负责收集周围 Beacon 的数据并传给云端）。

### 建立连接的组合 (双向通信)
*   **Peripheral (外围设备 / 外设)**：**广播自己，并接受别人的连接请求。**
    *   *底层行为*：连接前是 Advertiser，连接后变成 Slave。
    *   *典型特点*：通常是低功耗的、小型的传感器。
    *   *典型应用*：心率手环、智能鼠标。
*   **Central (中心设备)**：**主动扫描，并向周边设备发起连接请求。**
    *   *底层行为*：连接前是 Scanner，连接后变成 Master。
    *   *典型特点*：通常计算能力强、电量充足，支持同时连接多个 Peripheral，呈星型拓扑。
    *   *典型应用*：智能手机、电脑。

> **一句话总结**：这是**网络拓扑与连接行为**层面的角色。决定了谁连谁。

---

## 3. GATT 层角色 (Generic Attribute Profile) —— 谁拿着数据？(数据交互)

一旦设备之间通过 GAP 建立好了连接，接下来就要交换数据了。GATT 层定义了**数据是如何组织的，以及谁向谁要数据**。

*   **Server (服务端)**：**持有数据（特征值、描述符）的设备。** 它就像一个数据库，等待别人来读写。
*   **Client (客户端)**：**向 Server 发起读取、写入或订阅请求的设备。** 它自身不存储对端关心的数据，只负责发起数据交互。

> **一句话总结**：这是**业务数据层面**的角色。决定了数据在哪。

---

## 4. 为什么会混淆？(终极解答)

大多数人之所以混淆，是因为在 95% 的消费级蓝牙产品中，这三层角色被**经典绑定**了：

*   **经典组合 (如：心率手环)**：
    *   链路层：Advertiser (一直广播) $
    ightarrow$ Slave (连上后听命于手机)
    *   GAP 层：**Peripheral** (等待被连接)
    *   GATT 层：**Server** (心率数据存在我这里，等手机来读/订阅)
*   **经典组合 (如：你的手机)**：
    *   链路层：Scanner (一直扫描) $
    ightarrow$ Master (控制连接时序)
    *   GAP 层：**Central** (主动去连接手环)
    *   GATT 层：**Client** (去手环里读取心率数据，展示在 APP 上)

**但是！它们绝对不是绑死的！**

BLE 协议允许角色反转。以**苹果的 ANCS (Apple Notification Center Service)** 为例：
你的智能手表（Peripheral）连上 iPhone（Central）后，手表希望能收到微信消息提醒。
这时候：
*   **iPhone (Central)** 变成了 **GATT Server**（因为微信消息数据存在手机里）。
*   **智能手表 (Peripheral)** 变成了 **GATT Client**（它要去订阅手机的消息）。

## 5. 结论：如何准确命名？

*   当你描述一个设备的**物理形态和谁连谁**时，使用 **Peripheral / Central** 最准确。（例如：我们要开发一个键盘外设）。
*   当你描述**某段代码在干嘛（读数据还是存数据）**时，使用 **Client / Server** 最准确。（例如：在这个 C 文件里，我要实现一个 HRS Server 供别人读取）。
*   当你描述**设备在空中的状态**时，使用 **Advertiser / Scanner** 最准确。（例如：设备断开后，立即进入 Advertiser 状态）。

Zephyr 的宏定义完美印证了这一点：
我们刚刚的心率计工程，同时开了 `CONFIG_BT_PERIPHERAL=y` (为了能被连接) 和 `CONFIG_BT_HRS=y` (内置了 GATT Server 的实现代码)。
