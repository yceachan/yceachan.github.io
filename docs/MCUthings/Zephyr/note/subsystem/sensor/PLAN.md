---
title: Sensor Subsystem 知识库 - TODO List
tags: [Zephyr, Subsystem, Sensor, TODO]
desc: 待完成的 Zephyr 传感器子系统 (Sensor Subsystem) 相关知识库文档清单。
update: 2026-02-25
---

# Sensor Subsystem Knowledge Base - TODO List

该列表旨在系统性梳理和学习 Zephyr 提供的标准传感器子系统。Zephyr 将不同硬件厂家（如 Bosch, ST, TDK）的温湿度、惯性、光照等传感器驱动，统一抽象到了一个标准的 API 接口下，极大地方便了应用层的跨硬件平台移植。

## Core Concepts (核心概念)

- [x] **01-Overview.md** (传感器子系统概述)
    - **目标**: 宏观理解 Sensor API 的设计理念，掌握“通道” (Channels) 和“触发器” (Triggers) 的概念。
    - **关键点**:
        - 统一的 API 接口 (`sensor_sample_fetch`, `sensor_channel_get`)。
        - 常见数据通道枚举 (`SENSOR_CHAN_AMBIENT_TEMP`, `SENSOR_CHAN_ACCEL_XYZ` 等)。
        - 轮询模式 (Polling) vs 中断触发模式 (Trigger)。

- [x] **02-Fetching_and_Reading.md** (数据的抓取与读取 - 已合并至 01-Overview)
    - **目标**: 深入分析 `fetch` 和 `get` 两步分离设计的初衷。
    - **关键点**:
        - `sensor_value` 结构体的定点数表示法 (`val1` 整数部分, `val2` 微数部分) 及其转换函数 (`sensor_value_to_double`)。
        - 一次 `fetch` 操作抓取所有通道，多次 `get` 获取不同通道数据的并发一致性。

## Advanced Mechanisms (进阶机制)

- [x] **03-Triggers_and_Interrupts.md** (触发器与硬件中断)
    - **目标**: 学习如何利用传感器的硬件中断（如数据就绪中断 Data Ready, 阈值报警中断）来降低 MCU 功耗。
    - **关键点**:
        - `sensor_trigger_set` 的用法。
        - 触发类型 (`SENSOR_TRIG_DATA_READY`, `SENSOR_TRIG_THRESHOLD` 等)。
        - 在中断回调中执行 `fetch` 和 `get` 的限制（通常需要交接给工作队列处理）。

- [x] **04-Attributes_and_Configuration.md** (属性配置)
    - **目标**: 掌握如何在应用层动态修改传感器的硬件配置参数（而不是只能在设备树里写死）。
    - **关键点**:
        - `sensor_attr_set` 和 `sensor_attr_get` 的使用。
        - 常见属性枚举（量程 `SENSOR_ATTR_FULL_SCALE`, 采样率 `SENSOR_ATTR_SAMPLING_FREQUENCY`, 滤波阈值等）。

## Integration & Best Practices (集成与实战)

- [x] **05-MPU6050_Sample_Deep_Dive.md** (官方示例工程剖析)
    - **目标**: 从 Zephyr 官方的 MPU6050 传感器示例工程出发，全方位剖析设备树配置、轮询/中断双模式架构以及应用层数据处理逻辑。
    - **关键点**:
        - 设备树中的 `int-gpios` 与 `smplrt-div` 配置。
        - 轮询模式与触发模式 (`CONFIG_MPU6050_TRIGGER_NONE`) 在应用层的分歧处理。
        - 回调函数中的打印性能陷阱。

- [ ] **06-Sensor_to_Zbus_Integration.md** (Sensor 采集与 zbus 的联动)
    - **目标**: 实现解耦的数据采集架构，让复杂的 UI、网络或日志线程异步消费传感器数据。
    - **关键点**:
        - 创建专门的“传感器轮询线程”或“传感器中断处理工作项”。
        - 将读取到的 `sensor_value` 转换为应用层结构体，并通过 `zbus_chan_pub` 发布。

- [ ] **07-Custom_Sensor_Driver.md** (编写自定义传感器驱动)
    - **目标**: 了解如何将一个没有现成驱动的外部传感器接入 Zephyr 标准 Sensor 模型。
    - **关键点**:
        - 实现 `sensor_driver_api` 结构体中的回调函数。
        - 解析 I2C/SPI 寄存器数据并封装为 `sensor_value`。

---

> [!TIP]
> **学习建议**: 建议首先通过 `01-Overview.md` 建立概念，并找一块实际的 I2C 传感器（如 SHT3x 或 MPU6050）结合 `02-Fetching_and_Reading.md` 进行代码实操。随后重点研究 **05-Sensor_to_Zbus_Integration.md**，它也是后续构建复杂应用架构的核心。
