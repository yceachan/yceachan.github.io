---
title: ESP32-C3 (Zephyr) 蓝牙 HCI 控制器移植笔记
tags: [Zephyr, ESP32-C3, Bluetooth, HCI, UART, Porting]
desc: 记录在 ESP32-C3 平台上编译和运行 Zephyr 蓝牙 HCI 控制器 (controller_hci_uart) 固件遇到的踩坑点及解决方法。
update: 2026-02-27
---

# ESP32-C3 蓝牙 HCI 控制器移植笔记

> [!note]
> **Ref:** 本地工程 `prj/05-dual-chip-tester/controller_hci_uart` 的编译调试记录。

在将 Zephyr 的 `controller_hci_uart` 示例移植到基于 ESP32-C3 的开发板（如 `esp32c3_luatos_core`）时，由于 ESP32 蓝牙硬件体系结构的特殊性，会遇到一些 Kconfig 依赖冲突和设备树缺失问题。本文记录了关键的移植与配置要点。

## 1. Kconfig 配置适配：专有链路层 vs 开源链路层

Zephyr 默认的蓝牙控制器示例通常为原生的开源链路层（Link Layer）设计。然而，**ESP32 系列芯片（包括 ESP32-C3）使用的是乐鑫闭源的专有蓝牙控制器库（VHCI）**。

因此，所有带有 `BT_CTLR_*` 前缀（针对 Zephyr 原生控制器）的配置项在 ESP32 平台上都是不适用或不兼容的。

### 1.1 典型报错与解决：加密与隐私支持冲突
如果在板级配置（如 `boards/esp32c3_luatos_core.conf`）中启用了以下原生控制器特性，会导致严重的 Kconfig 依赖冲突（例如 `BT_RPA` 无法解析加密依赖）：

```ini
# 错误配置示例：会导致依赖树解析失败
CONFIG_BT_CTLR_CRYPTO=y
CONFIG_BT_CTLR_PRIVACY=y
```

**解决方案：**
在针对 ESP32 的配置文件中，必须显式禁用这些与原生链路层绑定的高级特性（或者不配置它们，因为底层的闭源库会自动处理相关硬件逻辑）：

```ini
# 正确配置：在 ESP32 平台上禁用原生控制器的特性声明
CONFIG_BT_CTLR_PRIVACY=n
# 移除所有 CONFIG_BT_CTLR_* 的强制启用
```

## 2. 设备树 (Device Tree) 适配：HCI UART 节点映射

`controller_hci_uart` 固件通过 UART 接口与宿主（Host）通信。该示例在代码中硬性要求设备树提供一个名为 `zephyr,bt-c2h-uart` 的 `chosen` 节点，用于指定作为 HCI 物理通道的串口。

如果开发板默认的设备树（`.dts`）没有定义该 chosen 节点，编译时会报错：
`error: '__device_dts_ord_DT_CHOSEN_zephyr_bt_c2h_uart_ORD' undeclared`

**解决方案：**
创建一个板级 overlay 文件（如 `boards/esp32c3_luatos_core.overlay`），将物理串口（通常是 `uart0`）映射给 HCI UART，并配置合适的波特率：

```dts
/ {
	chosen {
		zephyr,bt-c2h-uart = &uart0;
	};
};

&uart0 {
	status = "okay";
	current-speed = <115200>;
};
```
*(注意：配置后，请确保 `prj.conf` 中关闭了 `CONFIG_CONSOLE` 和 `CONFIG_UART_CONSOLE`，防止系统日志的 ASCII 字符污染 HCI 二进制数据流。)*

## 3. 烧录与运行时的 UART 复用说明

ESP32-C3 的 `uart0` 接口在开发和运行中扮演双重角色，属于分时复用，完全不会产生冲突：

1. **下载烧录模式 (Download Mode)**：
   开发板复位并进入 Bootloader 时（拉低 BOOT 引脚），`uart0` 由内部 ROM 接管，专门用于通过 `esptool` 等工具接收和烧录固件。
   
2. **正常运行模式 (Normal Mode)**：
   Zephyr 固件启动后，根据设备树的配置，Zephyr 驱动将重新初始化 `uart0`，并将其独占为**蓝牙 HCI 二进制数据通道**。
   
   **注意：** 此时串口输出的是纯粹的 HCI 协议数据流。如果使用常规串口助手连接，只会看到乱码。正确的测试方法是在 Linux 宿主机上使用 BlueZ 工具链进行挂载：
   
   ```bash
   sudo btattach -B /dev/ttyUSB0 -S 115200 -R
   ```
   挂载成功后，ESP32-C3 就成为了 Linux 宿主机上的一个标准底层蓝牙适配器（例如被识别为 `hci1`），你可直接使用宿主机的 `bluetoothctl` 或 `btmgmt` 工具与其进行标准协议交互。
