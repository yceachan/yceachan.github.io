---
title: 使用 nRF Connect 调试 Zephyr 蓝牙外设 (以 Heart Rate 为例)
tags: [Zephyr, Bluetooth, BLE, nRF Connect, Debugging, Tutorial]
desc: 图文并茂的教程，指导开发者如何使用 nRF Connect for Mobile APP 扫描、连接并与 Zephyr peripheral_hr 示例工程进行交互。
update: 2026-02-27
---

# nRF Connect for Mobile 实战调试指南

> [!note]
> **前提条件**：
> 1. 您已将 `peripheral_hr` 固件烧录至您的开发板（如 ESP32-C3）。
> 2. 开发板已上电运行（可通过串口日志确认 `Advertising successfully started`）。
> 3. 您的手机已安装 **nRF Connect for Mobile** APP (iOS App Store 或 Android 各大应用商店均可下载)。

**nRF Connect for Mobile** 是由 Nordic Semiconductor 开发的瑞士军刀级低功耗蓝牙 (BLE) 调试工具。它不仅能发现设备，更能解析极其复杂的 GATT 服务树。

以下是使用该 APP 调试 Zephyr `peripheral_hr` 示例的完整流程：

## 第一步：扫描与发现 (Scan & Discover)

1. **打开 APP 并授权**：首次打开需授予蓝牙和定位权限（Android 扫描 BLE 必须开启定位）。
2. **启动扫描**：在底部的 **Scanner** 选项卡中，点击右上角的 **SCAN** 按钮。
3. **识别目标设备**：
   - 寻找名称为 **"Zephyr Heartrate Sensor"** 的设备。
   - 在该设备的条目中，您可以看到它广播的信号强度 (RSSI，如 -50 dBm)。
   - 展开详情，您可以看到它广播了三个服务的 UUID 简写：
     - `0x180D` (Heart Rate)
     - `0x180F` (Battery Service)
     - `0x180A` (Device Information)
   - 这正是我们在 `main.c` 的 `ad[]` 数组中定义的！

## 第二步：建立连接 (Connect)

1. **点击 CONNECT**：在 "Zephyr Heartrate Sensor" 条目右侧点击 **CONNECT** 按钮。
2. **观察连接过程**：
   - 此时，您的开发板串口应该会打印出类似 `Connected` 的日志。
   - APP 界面会自动跳转到 **Client** 选项卡。

## 第三步：服务发现与交互 (GATT Discovery & Interaction)

在 Client 页面，APP 会自动执行服务发现流程 (Service Discovery)，列出设备提供的所有服务。

### 3.1 探索设备信息服务 (Device Information)
1. 找到 **Device Information** (UUID `0x180A`) 服务并展开它。
2. 您会看到多个特征 (Characteristics)，例如：
   - **Manufacturer Name String** (制造商名称)
   - **Model Number String** (型号)
3. **读取操作**：点击特征右侧的 **单向下箭头 (Read)** 图标。
   - 此时，下方会显示读取到的 ASCII 字符串，这通常由 Zephyr 的 Kconfig (如 `CONFIG_BT_DIS_MANUF`) 静态定义。

### 3.2 接收心率数据 (Heart Rate Service)
这是我们此行的核心目的。
1. 找到 **Heart Rate** (UUID `0x180D`) 服务并展开它。
2. 找到名为 **Heart Rate Measurement** 的特征。
   - 注意其属性 (Properties) 包含 `Notify`，意味着它支持主动推送。
3. **开启通知 (Enable Notifications)**：
   - 点击该特征右侧的 **三个向下箭头 (Enable/Disable Notifications)** 图标。
   - 这相当于向设备的 CCCD (Client Characteristic Configuration Descriptor) 写入 `0x0001`。
   - 此时，您的开发板串口会打印 `HRS notification status changed: enabled`。
4. **观察数据跳变**：
   - 您会看到该特征下方的值开始 **每秒更新一次**，数值从 90 逐渐递增到 160，然后再回到 90。
   - 点击特征名称进入图表视图 (如果 APP 支持)，您甚至能看到心率跳动的波形！

### 3.3 读取电池电量 (Battery Service)
1. 找到 **Battery Service** (UUID `0x180F`) 服务并展开它。
2. 找到 **Battery Level** 特征。
   - 其属性通常包含 `Read` 和 `Notify`。
3. **读取与订阅**：
   - 您可以点击 Read 按钮获取当前电量百分比（如 `0x64` 代表 100%）。
   - 同样，您可以点击 Notify 按钮订阅它，观察它随时间递减。

## 第四步：断开连接 (Disconnect)

1. 点击 APP 右上角的 **DISCONNECT** 按钮。
2. **观察开发板状态**：
   - 串口会打印断开原因，如 `Disconnected, reason 0x13 (Remote User Terminated Connection)`。
   - 紧接着打印 `Starting Legacy Advertising...`。
   - 开发板重新进入广播状态，等待下一次连接。

## 总结

通过 nRF Connect 的实战演练，我们直观地验证了 Zephyr 代码的执行逻辑：
- `ad[]` 数组决定了 Scanner 页面能看到什么。
- `bt_hrs_notify()` 和 `bas_notify()` 是 Client 页面数据跳变的幕后推手。
- `BT_CONN_CB_DEFINE` 宏定义的回调函数，精确捕捉了我们点击 Connect/Disconnect 按钮的瞬间。

这是验证自定义 BLE 服务最强大的方法。
