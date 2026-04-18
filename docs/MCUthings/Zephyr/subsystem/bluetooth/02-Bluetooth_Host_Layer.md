---
title: Zephyr 蓝牙主机层 (Host Layer) 剖析
tags: [Zephyr, Subsystem, Bluetooth, BLE, Host, GAP, GATT]
desc: 深入解析 Zephyr 蓝牙主机层架构，包括 HCI 驱动抽象、GAP 四大核心角色、安全等级与配对机制，以及 L2CAP 数据单元模型与持久化存储方案。
update: 2026-02-26
---

# Zephyr 蓝牙主机层 (Host Layer) 剖析

> [!note]
> **Ref:** [Zephyr Bluetooth LE Host](https://docs.zephyrproject.org/latest/connectivity/bluetooth/bluetooth-le-host.html)
> **Source:** `$ZEPHYR_BASE/doc/connectivity/bluetooth/bluetooth-le-host.rst`

蓝牙 Host 层负责实现所有高级协议和 Profile，并为应用程序提供高层级的 API。它是开发者在编写基于 Zephyr 的蓝牙应用时交互最频繁的层级。

## 1. 架构总览与 HCI 驱动层

在 Host 栈的最底端是 **HCI Driver (HCI 驱动)**，它的核心职责是抽象和屏蔽不同物理总线（UART、SPI、USB 或基于 RAM 的单芯片虚拟总线）的传输细节。它提供了一套基础的 API，用于在 Host 层与 Controller 之间双向传递命令、事件和数据。

## 2. 通用访问规范 (GAP, Generic Access Profile)

GAP 是紧挨着 HCI 层之上的关键模块，它通过定义四大不同的“蓝牙使用角色”，极大地简化了低功耗蓝牙的访问和管理机制。

### 2.1 面向连接的角色 (Connection-oriented)

- **外设角色 (Peripheral)**
  - **典型场景**: 智能传感器、智能手表（通常具有有限的 UI）。
  - **行为**: 执行可连接的广播 (Connectable Advertising)，并暴露一个或多个 GATT 服务。等待并接受其他设备的连接请求。
  - **API**: `bt_le_adv_start()` 启动广播，`bt_gatt_service_register()` 注册服务。
  - **Kconfig**: `CONFIG_BT_PERIPHERAL=y` (隐式开启 Broadcaster 角色)。

- **中心角色 (Central)**
  - **典型场景**: 智能手机、PC、网关。
  - **行为**: 扫描并发现周围的 Peripheral 设备，主动发起连接。连接建立后，通常作为 GATT Client 去发现和读写对方暴露的 GATT 服务。
  - **API**: `bt_le_scan_start()` 扫描，`bt_le_scan_stop()` 停止，`bt_conn_le_create()` 发起连接。
  - **Kconfig**: `CONFIG_BT_CENTRAL=y` (隐式开启 Observer 角色)。

### 2.2 无连接的角色 (Connection-less)

- **广播者角色 (Broadcaster)**
  - **典型场景**: 智能信标 (Beacon)、防丢器。
  - **行为**: 仅发送不可连接的广播报文 (Non-connectable advertising)，单向对外播发数据，拒绝任何连接请求。
  - **Kconfig**: `CONFIG_BT_BROADCASTER=y`。

- **观察者角色 (Observer)**
  - **典型场景**: 蓝牙网关的扫描组件、资产定位基站。
  - **行为**: 仅扫描和监听空中的广播报文，不发起连接。通过提取广播包内的载荷和信号强度 (RSSI) 运作。
  - **Kconfig**: `CONFIG_BT_OBSERVER=y`。

*注：蓝牙 Mesh (Bluetooth Mesh) 是一种特殊情况，它强制要求同时开启 Observer 和 Broadcaster 角色。*

## 3. 安全与配对 (Security & Pairing)

为了在两个蓝牙设备间建立安全的通信信道，需要进行**配对 (Pairing)**。这一过程可以被 GATT 服务的security properties隐式触发，或通过对 connection 对象调用 `bt_conn_set_security()` 显式触发。

如果设备具有 UI（如屏幕或键盘），推荐在配对阶段引入人机交互（带外信道），以防范中间人攻击 (MITM)。可以通过 `bt_conn_auth_cb_register()` 注册设备的能力回调（如 `passkey_display`，`passkey_entry` 等）。

Zephyr Host 支持以下四种安全等级 (Security Levels)：
1. `BT_SECURITY_L1`: 无加密，无认证。
2. `BT_SECURITY_L2`: 有加密，但无认证 (没有 MITM 防护)。
3. `BT_SECURITY_L3`: 使用蓝牙 4.0/4.1 传统配对机制 (Legacy Pairing) 的加密与认证。
4. `BT_SECURITY_L4`: 使用蓝牙 4.2 引入的安全连接 (LE Secure Connections, LESC) 机制，提供最高级别的加密与认证。

## 4. 逻辑链路控制和适配协议 (L2CAP)

L2CAP (Logical Link Control and Adaptation Protocol) 是所有蓝牙连接通信的公共层。应用层通常只有在需要使用面向连接的通道 (CoC) 时才会直接与它交互。

核心概念：
- **SDU (Service Data Unit)**: L2CAP 与**上层**（应用或高级协议）交换的数据包。其最大尺寸受限于 **MTU (Maximum Transmission Unit)**。
- **PDU (Protocol Data Unit)**: L2CAP 组装的带有 Header 并在**下层** (HCI) 交换的数据包。其最大载荷受限于 **MPS (Maximum Payload Size)**。
  - **B-frame**: 基础 L2CAP 模式下使用的 PDU。
  - **K-frame**: 开启基于信用的流控 (Credit Based Flow Control) 模式时使用的分段机制 PDU。

**相关 Kconfig 调优**:
- `CONFIG_BT_BUF_ACL_RX_SIZE` = MPS (影响底层 PDU 接收缓冲)
- `CONFIG_BT_L2CAP_TX_MTU` = MTU (影响上层 SDU 传输阈值)

## 5. 通用属性规范 (GATT)

GATT 是 LE 连接中最常见的通信手段。其架构基于 Attribute (属性)，定义了 Service (服务) 和 Characteristic (特征值) 的层次关系。

**ATT 超时机制**:
当发送 ATT 请求（如 Read/Write）后，如果对端设备未能在超时时间内响应，Host 层会自动断开底层连接 (Disconnect)。这个机制简化了应用层的异常处理逻辑，开发者只需统一在 Disconnect 回调中处理网络掉线即可，无需为每个 ATT 请求编写特殊的超时容错代码。

## 6. 持久化存储 (Persistent Storage)

蓝牙 Host 栈深度集成了 Zephyr 的 `settings` 子系统，用于将配对信息、密钥、GATT 客户端配置等持久化保存到 Flash 中。典型的配置如下：

```kconfig
CONFIG_BT_SETTINGS=y
CONFIG_FLASH=y
CONFIG_FLASH_PAGE_LAYOUT=y
CONFIG_FLASH_MAP=y
CONFIG_NVS=y
CONFIG_SETTINGS=y
```

**关键机制**:
一旦启用了 `BT_SETTINGS`，在应用层调用 `bt_enable()` 完成蓝牙栈初始化后，**必须手动调用 `settings_load()`**，Host 才会将 Flash 中的历史配对与密钥信息加载回 RAM 中。