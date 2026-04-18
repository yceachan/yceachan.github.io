---
title: LuatOS ESP32C3-CORE 最终合并设备树 (DTS) 简报
tags: [zephyr, dts, esp32c3, luatos]
update: 2026-02-08

---

# LuatOS ESP32C3-CORE 最终合并设备树 (DTS) 简报

本文档摘录自构建生成的 `build/zephyr/zephyr.dts`，反映了该板卡在合并所有 SoC、板级及 Overlay 配置后的最终硬件视图。

## 1. 系统核心配置 (Chosen)

这些节点定义了 Zephyr 内核首选的系统硬件资源。

```dts
chosen {
    zephyr,sram = &sram1;
    zephyr,console = &uart0;        // 控制台打印输出
    zephyr,shell-uart = &uart0;     // Shell 交互串口
    zephyr,flash = &flash0;
    zephyr,code-partition = &slot0_partition; // 代码存放分区
    zephyr,bt-hci = &esp32_bt_hci;  // 蓝牙 HCI 接口
};
```

## 2. 硬件资源别名 (Aliases)

别名是应用程序与底层硬件节点之间的桥梁。

| 别名 (Alias) | 指向节点 (Node) | 物理含义 |
| :--- | :--- | :--- |
| `led0` | `&led_d4` | 板载蓝色 LED (D4) |
| `led1` | `&led_d5` | 板载蓝色 LED (D5) |
| `sw0` | `&user_button1` | 板载 BOOT 按键 |
| `watchdog0` | `&wdt0` | 硬件看门狗 |
| `i2c-0` | `&i2c0` | I2C0 接口 |

## 3. 关键外设节点详细描述

### 3.1 蓝色 LED (GPIO-LEDs)
```dts
leds {
    compatible = "gpio-leds";
    led_d4: led_1 {
        label = "D4";
        gpios = <&gpio0 12 GPIO_ACTIVE_HIGH>; // GPIO 12, 高电平点亮
    };
    led_d5: led_2 {
        label = "D5";
        gpios = <&gpio0 13 GPIO_ACTIVE_HIGH>; // GPIO 13, 高电平点亮
    };
};
```

### 3.2 用户按键 (GPIO-Keys)
```dts
gpio_keys {
    compatible = "gpio-keys";
    user_button1: button_1 {
        label = "User SW1";
        gpios = <&gpio0 9 (GPIO_PULL_UP | GPIO_ACTIVE_LOW)>; // GPIO 9, 内部上拉, 低电平触发
        zephyr,code = <INPUT_KEY_0>;
    };
};
```

### 3.3 串口配置 (UART0)
```dts
&uart0 {
    status = "okay";
    current-speed = <115200>;
    pinctrl-0 = <&uart0_default>; // 引脚映射见 pinctrl 节点
    pinctrl-names = "default";
};
```

## 4. 总结

- **源码与硬件解耦**：应用程序通过 `DT_ALIAS(led0)` 引用 LED，而该别名在 DTS 中最终绑定到 `GPIO 12`。
- **配置透明化**：通过查看 `zephyr.dts` 中的注释（如 `/* in .../esp32c3_luatos_core.dtsi:35 */`），可以清晰追溯每一项配置的来源文件及行号。
