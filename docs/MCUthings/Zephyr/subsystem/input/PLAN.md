---
title: Input Subsystem 知识库 - TODO List
tags: [Zephyr, Subsystem, Input, TODO]
desc: 待完成的 Zephyr 输入子系统 (Input Subsystem) 相关知识库文档清单。
update: 2026-02-25
---

# Input Subsystem Knowledge Base - TODO List

该列表旨在系统性梳理和学习 Zephyr 提供的输入子系统 (Input Subsystem)。相比于底层硬中断和 GPIO 回调，Input 子系统提供了标准化的事件模型（如按键、坐标、滚轮等）和内置的去抖机制。

## Core Concepts (核心概念)

- [x] **01-Overview.md** (输入子系统概述 & GPIO Keys)
    - **目标**: 理解输入子系统架构，掌握如何通过 Device Tree (DTS) 配置 `gpio-keys`，以及应用层如何通过 `INPUT_CALLBACK_DEFINE` 接收标准事件。
    - **关键点**:
        - `gpio-keys` 节点的设备树属性 (`zephyr,code`, `gpios`)。
        - 硬件中断到 Input Core 的转换。
        - `struct input_event` 结构体解析。

- [x] **02-Event_Types_and_Handling.md** (输入事件类型与高级处理)
    - **目标**: 深入分析不同类型的输入事件（绝对坐标、相对坐标、同步事件）以及 Input Core 的分发机制。
    - **关键点**:
        - `INPUT_EV_KEY`, `INPUT_EV_ABS` (触摸屏坐标), `INPUT_EV_REL` (鼠标/编码器相对位移)。
        - `INPUT_EV_SYNC` (同步事件) 的作用：处理多轴数据的原子性更新。
        - 了解 Input 线程模式 (`CONFIG_INPUT_MODE_THREAD` vs `CONFIG_INPUT_MODE_SYNCHRONOUS`) 及其对上下文的影响。

## Advanced Devices (进阶外设)

- [ ] **03-Matrix_Keypad_and_Encoders.md** (矩阵键盘与旋转编码器)
    - **目标**: 学习如何配置和使用比单个 GPIO 按键更复杂的输入外设。
    - **关键点**:
        - `gpio-kbd-matrix`: 矩阵扫描原理与 DTS 配置（行线、列线）。
        - 旋转编码器 (Rotary Encoders) 和 `sensor` 到 `input` 的映射机制。

- [ ] **04-Touch_Panels.md** (触摸屏输入)
    - **目标**: 掌握 I2C/SPI 接口电容触摸IC（如 FT5336, GT911）的驱动与 Input 事件上报流程。
    - **关键点**:
        - DTS 中配置触摸屏控制器节点及中断引脚。
        - 多点触控数据的解析与上报 (X, Y, Track ID)。

## Integration & Best Practices (集成与实战)

- [x] **05-Input_to_Zbus_Integration.md** (Input 子系统与 zbus 的联动)
    - **目标**: 解决 Input Callback 在 ISR 或内核线程上下文中直接处理复杂业务的局限性，实现完美的架构解耦。
    - **关键点**:
        - 在 `INPUT_CALLBACK_DEFINE` 中将按键事件打包发布 (Publish) 到 `zbus` 通道。
        - 业务逻辑线程作为 `zbus` 观察者 (Observer) 异步处理按键动作（如长按、短按、双击逻辑的实现）。

- [ ] **06-Input_to_GUI_LVGL.md** (Input 与 LVGL 图形库的对接)
    - **目标**: 了解如何将 Zephyr 原生的 Input 事件送入上层 GUI 框架。
    - **关键点**:
        - Zephyr LVGL 模块如何注册 Input Listener (`lv_indev` 的对接机制)。
        - 将物理按键映射为 LVGL 的导航键 (`LV_KEY_NEXT`, `LV_KEY_ENTER`)。

---

> [!TIP]
> **学习建议**: 掌握基础的 `01-Overview.md` 之后，强烈建议优先攻克 **05-Input_to_Zbus_Integration.md**。在实际的高质量 RTOS 应用中，输入事件通常作为系统状态机的“触发源”，通过 zbus 将输入事件桥接到业务线程是解耦的黄金法则。
