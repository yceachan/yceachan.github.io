---
title: Bluetooth 开发工具指南
tags: [Zephyr, Bluetooth, BlueZ, Debug, QEMU]
desc: 介绍 Zephyr 蓝牙协议栈开发中常用的移动端应用、Linux BlueZ 工具链及仿真调试方法。
update: 2026-02-27
---

# Bluetooth 开发工具指南

> [!note]
> **Ref:** [Bluetooth Tools — Zephyr Project Documentation](https://docs.zephyrproject.org/latest/connectivity/bluetooth/bluetooth-tools.html)

本文档整理了在 Zephyr 蓝牙协议栈或应用开发过程中，能够简化并加速开发进度的各种工具。

## 1. 移动端应用程序 (Mobile Applications)

在不编写额外代码或增加硬件的情况下，使用现有的移动端 App 与 Zephyr 硬件交互是非常高效的测试方式。

*   **Android:**
    *   `nRF Connect for Android`: 功能最全的调试工具。
    *   `nRF Mesh for Android`: 用于蓝牙 Mesh 网络配置。
    *   `LightBlue for Android`: 简洁的 GATT 客户端。
*   **iOS:**
    *   `nRF Connect for iOS`
    *   `nRF Mesh for iOS`
    *   `LightBlue for iOS`

## 2. Linux BlueZ 工具链

BlueZ 是 Linux 的蓝牙协议栈，提供了一系列用于调试和交互的强大工具。

### 2.1 环境要求
*   **Linux Kernel**: 4.10+
*   **BlueZ**: 4.45+

### 2.2 开启实验性功能
为了访问最新的蓝牙功能，需要编辑 `/lib/systemd/system/bluetooth.service`，在 `ExecStart` 行添加 `-E` 选项：
```bash
ExecStart=/usr/libexec/bluetooth/bluetoothd -E
```
修改后执行：
```bash
sudo systemctl daemon-reload
sudo systemctl restart bluetooth
```

### 2.3 核心工具
*   `btmon`: 监控 HCI 通信日志（最常用）。
*   `btproxy`: 用于将蓝牙控制器导出为 UNIX Socket。
*   `btmgmt`: 蓝牙管理工具。
*   `btattach`: 将串口连接到蓝牙堆栈。

## 3. 在 QEMU 或 native_sim 上运行

可以在模拟器中运行蓝牙应用，这需要将宿主机的蓝牙控制器（Controller）转发给模拟器。

### 3.1 使用宿主机控制器
*   **QEMU**: 通过 UNIX Socket `/tmp/bt-server-bredr` 连接。
*   **native_sim**: 通过命令行参数 `--bt-dev=hci0` 直接连接。

**操作步骤（以 QEMU 为例）：**
1. 停止宿主机蓝牙控制器：`sudo hciconfig hci0 down`
2. 使用 `btproxy` 建立 Socket：
   ```bash
   sudo btproxy -u -i 0
   ```
3. 运行 Zephyr 应用：
   ```bash
   # QEMU
   west build -b qemu_x86 samples/bluetooth/peripheral_hr -t run
   # native_sim
   sudo ./build/zephyr/zephyr.exe --bt-dev=hci0
   ```

## 4. HCI 追踪 (HCI Tracing)

### 4.1 宿主机追踪
直接在 Linux 终端运行 `btmon` 即可实时查看 Host 与 Controller 之间的 HCI 指令与事件交互。

### 4.2 嵌入式硬件 HCI 追踪
在真实硬件上开发时，默认只能看到日志。可以通过以下配置开启“二进制协议”模式，将日志与 HCI 流量交织输出到串口：

**Kconfig 配置：**
```cfg
CONFIG_BT_DEBUG_MONITOR_UART=y
CONFIG_UART_CONSOLE=n
```

**解码方式：**
```bash
$ btmon --tty <串口设备, 如/dev/ttyUSB0> --tty-speed 115200
```
*注：如果使用 Segger RTT，可配置 `CONFIG_BT_DEBUG_MONITOR_RTT=y`，并使用 `btmon --jlink` 命令。*

## 5. 虚拟控制器与 Bumble

除了物理控制器，还可以使用虚拟控制器（通过 HCI TCP 服务器连接）。

*   **Bumble**: Google 开发的 Python 模块，可创建 TCP 蓝牙虚拟控制器。
*   **Android Emulator**: 可以通过 `hci-bridge` 将 Zephyr 应用连接到 Android 模拟器的虚拟蓝牙堆栈中进行联调。

## 6. 使用 Zephyr 控制器配合 BlueZ

如果你想测试 Zephyr 运行在控制器模式（Controller-only），可以使用 `btmgmt`：
```bash
sudo btmgmt --index 0
[hci0]# auto-power
[hci0]# find -l
```
