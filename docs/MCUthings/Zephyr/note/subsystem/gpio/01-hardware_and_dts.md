---
title: GPIO 子系统分析 (一)：硬件与设备树 (DTS)
tags: [GPIO, DTS, ESP32C3, LED]
desc: 从板载 LED 到 SoC GPIO 控制器的设备树映射全路径分析
update: 2026-02-10
---

# GPIO 子系统分析 (一)：硬件与设备树 (DTS)

> [!note]
> **Ref:** 
> - [esp32c3_luatos_core.dtsi](../../../sdk/source/zephyr/boards/luatos/esp32c3_luatos_core/esp32c3_luatos_core.dtsi)
> - [esp32c3_common.dtsi](../../../sdk/source/zephyr/dts/riscv/espressif/esp32c3/esp32c3_common.dtsi)

在这一阶段，我们追踪了 LuatOS ESP32C3 开发板上两个 LED 设备在设备树中的定义，并明确了它们如何连接到 SoC 的 GPIO 控制器。

## 1. 终端设备定义 (LEDs)

在板级配置文件 `esp32c3_luatos_core.dtsi` 中，定义了两个 LED 节点：

```devicetree
leds {
    compatible = "gpio-leds";

    led_d4: led_1 {
        label = "D4";
        gpios = <&gpio0 12 GPIO_ACTIVE_HIGH>;
    };

    led_d5: led_2 {
        label = "D5";
        gpios = <&gpio0 13 GPIO_ACTIVE_HIGH>;
    };
};
```

*   **Mapping**: 
    *   `led0` (D4) 映射到 `gpio0` 的 **Pin 12**。
    *   `led1` (D5) 映射到 `gpio0` 的 **Pin 13**。
*   **Active Level**: 均为 `GPIO_ACTIVE_HIGH`（高电平点亮）。

## 2. GPIO 控制器定义 (SoC Level)

LED 节点引用的 `&gpio0` 节点在 `esp32c3_common.dtsi` 中定义，属于 SoC 级的硬件资源：

```devicetree
gpio0: gpio@60004000 {
    compatible = "espressif,esp32-gpio";
    gpio-controller;
    #gpio-cells = <2>;
    reg = <0x60004000 0x800>;
    interrupts = <GPIO_INTR_SOURCE IRQ_DEFAULT_PRIORITY 0>;
    interrupt-parent = <&intc>;
    ngpios = <26>;   /* 0..25 */
    status = "okay"; /* 在板级 dtsi 中被激活 */
};
```

### 2.1 关键硬件参数
*   **兼容性 (Compatible)**: `espressif,esp32-gpio`。这决定了内核将使用哪个驱动程序（即 `drivers/gpio/gpio_esp32.c`）来管理此硬件。
*   **寄存器基地址 (Reg)**: `0x60004000`。这是 GPIO 控制器的 MMIO 起始地址，长度为 `0x800` 字节。
*   **中断配置 (Interrupts)**: 使用 `GPIO_INTR_SOURCE` 中断源，连接到内部中断控制器 `&intc`。
*   **引脚数量 (ngpios)**: ESP32-C3 的这个端口支持 26 个引脚（0-25）。

## 3. 抽象模型关联 (Verification)

对照 `note/Kernel/Device Driver Model/00-Abstract.md` 中的要点：

1.  **Memory Mapping**: 驱动程序将使用 `DEVICE_MMIO` 机制处理 `0x60004000` 这一地址。
2.  **Single Driver, Multiple Instances**: 
    *   驱动是 `espressif,esp32-gpio`。
    *   实例是 `gpio0`。
    *   如果 SoC 有多个端口（如 GPIOA, GPIOB），会有多个 `gpioX` 节点，但共享同一个驱动代码。
3.  **Initialization Levels**: GPIO 作为基础外设，其初始化级别通常很高（如 `PRE_KERNEL_1`），以供后续的 LED、传感器等设备使用。

---
**下一阶段预览**: 我们将进入 `drivers/gpio/gpio_esp32.c` 源码，查看 `DEVICE_DEFINE` 宏如何利用上述 DTS 信息生成 `struct device` 实例。
