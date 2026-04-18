---
title: Zephyr 板级差异化配置 (Boards Overlay) 指南
tags: [Zephyr, Build System, Kconfig, Devicetree, Board-Specific]
desc: 阐述 Zephyr 构建系统中 boards 目录下 .conf 与 .overlay 文件的作用、加载机制及最佳实践。
update: 2026-02-26
---

# Zephyr 板级差异化配置 (Boards Overlay) 指南

在 Zephyr 工程中，`boards/` 目录是实现“一套代码，处处运行”的核心枢纽。它允许开发者针对不同硬件平台的差异性，在不修改主应用代码和全局配置的情况下，进行外科手术式的精准补偿。

## 1. 加载机制概览

当执行 `west build -b <BOARD_NAME>` 命令时，Zephyr 构建系统会自动扫描当前工程的 `boards/` 目录。如果发现与 `<BOARD_NAME>` 同名的文件，它会按照以下逻辑进行合并：

- **`<BOARD_NAME>.conf`** $\rightarrow$ 合并并覆盖应用根目录的 `prj.conf`。
- **`<BOARD_NAME>.overlay`** $\rightarrow$ 合并并覆盖开发板原生的 `.dts` (Devicetree) 定义。

## 2. 文件角色与职责

### 2.1 .conf (Kconfig 软件配置覆盖)
用于修改软件层面的宏定义。
- **核心目的**：调整特定架构的堆栈大小、内存缓冲池数量、或开启/关闭仅在特定 SoC 上存在的驱动特性。
- **示例分析**：`nrf5340bsim_nrf5340_cpuapp.conf`
  - 该文件调整了 `CONFIG_BT_BUF_ACL_RX_SIZE`。由于 nRF5340 是双核架构，其 Host 与 Controller 之间通过 IPC 通信，必须确保两端的缓冲区尺寸严格对齐。这种调整若放在全局 `prj.conf` 会浪费单核芯片（如 ESP32）的内存，因此放在板级 `.conf` 中最为合适。

### 2.2 .overlay (Devicetree 硬件设备树覆盖)
用于修改硬件层面的描述。
- **核心目的**：重新映射 GPIO 引脚、开启特定的外设实例（如 I2C1/SPI2）、定义特定平台的低功耗电源状态（Power States）。
- **示例分析**：`stm32wba_stdby.overlay`
  - 该文件为 CPU 节点增加了 `standby` 状态，并开启了 `lptim1`（低功耗定时器）。这是为了让 STM32WBA 在运行心率计示例时，能够演示在蓝牙广播间隙进入深度睡眠的硬件特性。

## 3. 最佳实践：适配新板子 (如 ESP32C3)

当你准备将此工程适配到新的开发板（例如你的 `esp32c3_luatos_core`）并需要特定的微调时，请遵循以下步骤：

1. **严禁** 在全局 `prj.conf` 中编写针对特定板子的 `ifdef` 逻辑。
2. **在该目录下创建文件**：
   - `boards/esp32c3_luatos_core.conf`：用于调整 ESP32 特有的栈大小（如 `CONFIG_BT_RX_STACK_SIZE=2048`）。
   - `boards/esp32c3_luatos_core.overlay`：用于修改板载 LED 的引脚映射或开启特定的 UART 实例。
3. **优势**：这种做法保证了应用主逻辑的纯净，极大地提高了代码的可维护性和跨平台移植能力。

---
> [!note]
> **Ref:** [Zephyr Documentation - Set board-specific configuration](https://docs.zephyrproject.org/latest/develop/application/index.html#set-board-specific-configuration)
