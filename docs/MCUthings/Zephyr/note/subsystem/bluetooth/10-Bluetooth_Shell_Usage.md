---
title: Zephyr Bluetooth Shell 实战与调试指南
tags: [Zephyr, Bluetooth, BLE, Shell, Debugging, native_sim, WSL]
desc: 详细介绍被誉为蓝牙协议栈“瑞士军刀”的 Bluetooth Shell 工具。包含在物理开发板(ESP32-C3)和 PC/WSL 原生环境下的编译部署，以及常用交互命令清单。
update: 2026-02-27
---

# Zephyr Bluetooth Shell 实战与调试指南

> [!note]
> **Ref:** `$ZEPHYR_BASE/tests/bluetooth/shell/`
> **Doc:** [Zephyr Bluetooth Shell Documentation](https://docs.zephyrproject.org/latest/connectivity/bluetooth/bluetooth-shell.html)

Zephyr **Bluetooth Shell** 是一个基于 `shell` 模块的交互式命令行应用程序（CLI）。它将复杂的蓝牙协议栈操作（GAP, GATT, L2CAP, Audio 等）封装成了简易的命令，允许开发者无需编写 C 代码即可实时操控底层协议栈。

它是验证硬件射频功能、排查互操作性 Bug 的终极探测器。

## 1. 部署方案一：嵌入式目标板 (以 ESP32-C3 为例)

将 Shell 作为一个普通的 App 烧录到目标板上，通过串口进行交互。这是验证特定物理芯片（及其底层固件、天线设计）的最直接方式。

### 编译与烧录
```bash
# 1. 编译 (指定开发板)
west build -b esp32c3_luatos_core tests/bluetooth/shell

# 2. 烧录
west flash

# 3. 连接串口 (波特率 115200)
west espressif monitor
```

## 2. 部署方案二：PC 原生环境 (Linux / WSL)

利用 Zephyr 强大的硬件解耦特性，我们可以将完整的 Host 协议栈和 Shell 逻辑编译成一个原生的 Linux 可执行文件 (`native_sim`)，配合 USB 蓝牙 Dongle，打造一个极客版的 **BLE 上位机**。

### 2.1 硬件与 WSL 直通准备
- **硬件**：可以编译一个controller only 的zephyr 嵌入式固件，然后把开发板挂载到wsl里，作为蓝牙网卡。
- **WSL 穿透**：在 Windows PowerShell 中使用 `usbipd-win` 工具将该 USB 蓝牙适配器挂载给 WSL。
  ```powershell
  usbipd list
  usbipd bind --busid <BUSID>
  usbipd attach --wsl --busid <BUSID>
  ```
- **验证**：在 WSL 中执行 `hciconfig`，应能看到 `hci0`。

### 2.2 编译与运行原生程序
```bash
# 1. 编译 native_sim 目标
west build -b native_sim tests/bluetooth/shell

# 2. 独占蓝牙接口 (停止 Linux 原生的 BlueZ 服务以防抢占)
sudo systemctl stop bluetooth

# 3. 运行原生程序，接管 hci0
sudo ./build/zephyr/zephyr.exe --bt-dev=hci0
```

---

## 3. 核心交互命令速查 (Cheat Sheet)

成功启动并看到 `uart:~$` 提示符后，可以执行以下高频命令进行调试：

### 3.1 协议栈初始化
- **`bt init`**: 【必选】初始化蓝牙协议栈。观察输出确认 Controller 是否握手成功、是否获取到了 MAC 地址。

### 3.2 角色：扫描者 (Scanner)
- **`bt scan on`**: 开启扫描。终端会实时打印周围设备的 MAC 地址、地址类型 (public/random) 和信号强度 (RSSI)。
- **`bt scan off`**: 关闭扫描。

### 3.3 角色：广播者 (Advertiser)
- **`bt name "MyDevice"`**: 动态修改设备名称。
- **`bt advertise on`**: 开启默认的可连接广播。

### 3.4 角色：中心设备 (Central) 与 GATT 客户端
假设你在扫描时发现了一个设备 `EB:BF:36:26:42:09 (random)`：
- **`bt connect EB:BF:36:26:42:09 random`**: 发起连接。
- **`gatt discover`**: （连接成功后）执行服务发现，打印出对端所有的 Service 和 Characteristic 树状结构及 Handle。
- **`gatt read 0x0012`**: 读取 Handle 为 `0x0012` 的属性值。

### 3.5 动态日志追踪 (Dynamic Logging)
Shell 允许在不重新编译的情况下动态开启特定协议层的日志：
- **`log status`**: 查看所有支持日志的模块及其当前级别。
- **`log enable dbg bt_hci_core`**: 开启最底层的 HCI 交互十六进制报文调试。
- **`log enable err bt_att`**: 仅显示 ATT 层的错误日志过滤噪音。

## 4. 总结与应用场景

- **隔离验证法**：如果自己写的 App 无法连接手机，先烧录 Bluetooth Shell。如果 Shell 也连不上，说明是底层驱动、射频或环境干扰问题；如果 Shell 能连上，说明是应用层的逻辑或 Kconfig 配置写错了。
- **快速原型验证**：在编写复杂的 GATT 交互代码前，先用 Shell 模拟读取序列，确认逻辑通顺后再写 C 代码。
