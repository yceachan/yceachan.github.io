---
title: LuatOS ESP32C3-CORE 开发板支持详情
tags: [Zephyr, Board, ESP32-C3, LuatOS, RISC-V]
update: 2026-02-08
---

# LuatOS ESP32C3-CORE 开发板支持详情

**LuatOS ESP32C3-CORE** 是一款基于乐鑫（Espressif）ESP32-C3 SoC 的核心开发板。ESP32-C3 搭载了开源的 RISC-V 架构单核处理器，集成了 Wi-Fi 和 Bluetooth 5 (LE)。

## 1. 硬件规格 (Hardware Specifications)

| 特性 | 详情 |
| :--- | :--- |
| **SoC** | ESP32-C3 (RISC-V 32-bit Single-Core) |
| **主频** | 高达 160 MHz |
| **存储** | 384 KB ROM, 400 KB SRAM, 4 MB SPI Flash (板载) |
| **Wi-Fi** | IEEE 802.11 b/g/n (2.4 GHz) |
| **蓝牙** | Bluetooth 5 (LE) |
| **GPIO** | 22 个可编程 GPIO |
| **接口** | SPI, UART, I2C, I2S, LED PWM, USB Serial/JTAG, TWAI (兼容 ISO 11898-1 CAN 2.0) |
| **外设** | ADC, 温度传感器, 系统定时器, 看门狗定时器 |

## 2. Zephyr 支持特性 (Supported Features)

Zephyr OS 为该开发板提供了广泛的驱动支持：

| 接口/功能 | Zephyr 驱动支持 | 说明 |
| :--- | :--- | :--- |
| **Kernel** | 多线程, 中断, 内存管理 | 基础 OS 功能 |
| **GPIO** | `gpio_esp32` | 通用输入输出 |
| **UART** | `uart_esp32` | 串口通信 |
| **SPI** | `spi_esp32` | 串行外设接口 |
| **I2C** | `i2c_esp32` | Inter-Integrated Circuit |
| **I2S** | `i2s_esp32` | 音频接口 |
| **ADC** | `adc_esp32` | 模数转换 |
| **Wi-Fi** | `esp32_wifi` | 无线网络 |
| **Bluetooth** | `esp32_bt` | 蓝牙低功耗 (HCI) |
| **Watchdog** | `wdt_esp32` | 看门狗 |
| **Timer** | `counter_esp32` | 硬件定时器 |
| **PWM** | `pwm_esp32` | 脉冲宽度调制 |
| **TRNG** | `entropy_esp32` | 真随机数生成器 |
| **USB** | `usb_esp32` | USB Serial / JTAG |
| **TWAI** | `can_esp32` | CAN 总线支持 |

## 3. 编程与调试 (Programming & Debugging)

### 3.1 构建与烧录

使用 `west` 工具可以轻松构建和烧录应用程序。

**构建 Hello World 示例：**

```bash
west build -b esp32c3_luatos_core samples/hello_world
```

**烧录 (Flashing)：**

ESP32-C3 支持通过 USB Serial 进行烧录。通常使用 `esptool` (Zephyr SDK 集成)。

```bash
west flash
```

> **注意**: 首次烧录或无法自动进入 Bootloader 模式时，可能需要按住板上的 `BOOT` 键，然后按一下 `RESET` 键，再松开 `BOOT` 键以进入下载模式。

### 3.2 调试 (Debugging)

ESP32-C3 内置了 USB JTAG 控制器，可以直接通过 USB 线进行调试，无需外部调试器（如 J-Link）。

**启用 OpenOCD 调试：**

```bash
west debug
```

Zephyr 支持使用 OpenOCD 连接 ESP32-C3 的内置 JTAG 接口进行断点调试和单步执行。

## 4. 引脚映射 (Pinout)

开发板的引脚映射遵循 Zephyr 的设备树 (Device Tree) 定义。

- **LED**: 通常映射到板载 LED (GPIO 12 或 13，具体视版本而定，需查阅 `esp32c3_luatos_core.dts`)。
- **USB**: 直接连接到 SoC 的 USB 控制器引脚。

更多详细信息可参考官方文档：[Zephyr Documentation - ESP32C3_LUATOS_CORE](https://docs.zephyrproject.org/latest/boards/luatos/esp32c3_luatos_core/doc/index.html)
