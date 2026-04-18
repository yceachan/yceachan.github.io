---
title: Sensor Subsystem Overview (传感器子系统概述)
tags: [Zephyr, Subsystem, Sensor, API, Concepts]
desc: 深入解析 Zephyr 统一的传感器驱动模型 (Sensor Subsystem)，掌握 fetch 与 get 分离的数据读取范式，以及不同物理量的数据通道表示法。
update: 2026-02-25
---

# Sensor Subsystem Overview (传感器子系统概述)

> [!note]
> **Ref:** [Zephyr Sensor Subsystem API](https://docs.zephyrproject.org/latest/hardware/peripherals/sensor.html)

Zephyr 的一大核心优势在于其强大的设备驱动抽象层。无论你使用 Bosch 的 BME280 温湿度传感器、ST 的 LIS3DH 加速度计，还是 TDK 的 MPU6050 陀螺仪，在应用层你面对的都是**同一套标准的 C 语言 API**。这就是 **Sensor Subsystem** 的价值所在。

本篇概述将带你理解 Zephyr Sensor 模型的设计哲学及其最核心的 API 流程。

## 1. 为什么需要统一的 Sensor API？

- **跨硬件移植性**: 应用代码不再与具体的传感器型号（I2C/SPI 地址、寄存器布局）绑定。更换了传感器，只需修改设备树 (DTS) 节点，应用代码无需修改（或者只需微调）。
- **统一数据表示**: 物理量有多种表示方式（浮点数、定点数、放大 100 倍等）。Sensor API 强制使用统一的 `struct sensor_value`，让应用层无需关心底层的位运算和量纲换算。
- **一致的多通道提取**: 许多传感器是多合一的（如六轴 IMU：3轴加速度 + 3轴陀螺仪）。Sensor API 提供了统一的通道枚举 (`sensor_channel`)。

## 2. 核心架构与获取数据的“两步走”策略

在 Zephyr 中读取传感器数据，不是一个简单的 `read()`，而是分为两个必须按顺序执行的步骤：**抓取 (Fetch)** 和 **获取 (Get)**。

这是一种经典的“快照 (Snapshot)”模式，可以保证你在获取多个相关通道数据（如 X、Y、Z 三轴）时的**时间一致性**。

### 2.1 第一步：抓取 (Fetch) - `sensor_sample_fetch()`

```c
int sensor_sample_fetch(const struct device *dev);
// 或更细粒度的：
int sensor_sample_fetch_chan(const struct device *dev, enum sensor_channel type);
```

- **作用**: 告诉驱动程序：“现在，去通过 I2C/SPI 读取物理硬件寄存器中的当前最新数据”。
- **底层行为**: 驱动通常会在这个函数中发起 I2C 传输，读取传感器的原始数据寄存器（例如温湿度、加速度），然后将其缓存（转换并保存）在 MCU 的内存结构体中（属于设备驱动上下文）。
- **时间消耗**: 这个过程可能相对耗时，因为它涉及总线传输和底层等待。

### 2.2 第二步：获取 (Get) - `sensor_channel_get()`

```c
int sensor_channel_get(const struct device *dev, 
                       enum sensor_channel chan, 
                       struct sensor_value *val);
```

- **作用**: 从刚才 `fetch` 缓存在 MCU 内存中的快照里，提取特定通道 (`chan`) 的数据，并填入你提供的 `val` 中。
- **时间消耗**: 这个过程极快，因为它仅仅是读取 MCU 内存，不涉及外部总线。

**为什么必须这样设计？**
考虑一个三轴加速度计，如果你用三次独立的 `read(X)`, `read(Y)`, `read(Z)`，在读 X 和读 Z 之间可能经过了几毫秒，传感器的物理状态已经改变，你读到的 X, Y, Z 就不是同一时刻的向量，这会导致姿态解算严重错误。
而采用 `fetch` + `get` 的模式：
1. `sensor_sample_fetch` 一次性原原本本地将传感器内部的 6 个字节 (X,Y,Z) 全部拉取回 MCU 内存。
2. 然后你通过三次 `sensor_channel_get` 分别获取它们，保证了它们是严格同时刻产生的物理快照。

## 3. 数据表示：`struct sensor_value`

为了避免在内核中使用浮点数（这在很多小型 MCU 上会引入大量的 FPU 指令开销，甚至需要特定的编译选项），Zephyr 发明了一个精妙的定点数结构体：

```c
struct sensor_value {
    int32_t val1; /* 整数部分 (Integer part) */
    int32_t val2; /* 微数部分 (Fractional part, 百万分之一, Millionths) */
};
```

- `val1`: 表示主单位整数（如 摄氏度 ℃, 米每二次方秒 m/s²）。
- `val2`: 表示小数部分，单位是百万分之一 (micro, 10^-6)。

**示例**:
- 物理值 `25.5 ℃`:
  - `val1 = 25`
  - `val2 = 500000`
- 物理值 `-3.14 m/s²`:
  - `val1 = -3`
  - `val2 = -140000`

Zephyr 还提供了一个辅助函数用于将它转换为标准的 C 语言 `double` 类型（如果你不介意浮点运算开销）：
```c
double sensor_value_to_double(const struct sensor_value *val);
```

## 4. 物理通道 (`enum sensor_channel`)

Zephyr 定义了几十种标准的物理通道。当你调用 `sensor_channel_get` 时，你需要指定你想要哪种通道的数据。

常用的通道包括（详细请参考 `include/zephyr/drivers/sensor.h`）：
- `SENSOR_CHAN_AMBIENT_TEMP`: 环境温度 (℃)
- `SENSOR_CHAN_HUMIDITY`: 相对湿度 (%)
- `SENSOR_CHAN_PRESS`: 环境气压 (kPa)
- `SENSOR_CHAN_ACCEL_X` / `Y` / `Z` / `XYZ`: 加速度 (m/s²)
- `SENSOR_CHAN_GYRO_X` / `Y` / `Z` / `XYZ`: 角速度 (radians/s)
- `SENSOR_CHAN_MAGN_X` / `Y` / `Z` / `XYZ`: 磁场强度 (gauss)
- `SENSOR_CHAN_LIGHT`: 光照强度 (lux)
- `SENSOR_CHAN_PROX`: 接近感应 (无量纲或距离)

## 5. 极简实战示例 (轮询读取温湿度)

假设你在 DTS 中挂载了一个 SHT3XD 温湿度传感器：

```dts
/* app.overlay */
&i2c0 {
    sht3xd@44 {
        compatible = "sensirion,sht3xd";
        reg = <0x44>;
    };
};
```

应用层代码：

```c
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(app, LOG_LEVEL_INF);

void main(void)
{
    /* 1. 获取设备绑定 */
    const struct device *const dev = DEVICE_DT_GET_ANY(sensirion_sht3xd);
    if (!device_is_ready(dev)) {
        LOG_ERR("Sensor device not ready!");
        return;
    }

    struct sensor_value temp, hum;

    while (1) {
        /* 2. 第一步：触发总线读取，更新 MCU 内存快照 */
        if (sensor_sample_fetch(dev) < 0) {
            LOG_ERR("Failed to fetch data!");
            k_sleep(K_SECONDS(1));
            continue;
        }

        /* 3. 第二步：从内存快照中提取 温度 和 湿度 */
        sensor_channel_get(dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);
        sensor_channel_get(dev, SENSOR_CHAN_HUMIDITY, &hum);

        /* 4. 打印：将定点数转为浮点数打印 (注意：需要配置 CONFIG_CBPRINTF_FP_SUPPORT=y) */
        LOG_INF("Temp: %.2f C, Hum: %.2f %%", 
                sensor_value_to_double(&temp),
                sensor_value_to_double(&hum));
                
        /* 或者手动打印定点数 (避免浮点支持开销)：*/
        /* LOG_INF("Temp: %d.%06d C", temp.val1, temp.val2); */

        k_sleep(K_SECONDS(2));
    }
}
```

## 总结
使用 Zephyr Sensor 子系统的关键在于：
1. 始终遵循 `fetch` -> `get` 的顺序。
2. 习惯使用 `struct sensor_value` 处理定点数。
3. 学会通过设备树 (`DEVICE_DT_GET_ANY`) 屏蔽具体的引脚和 I2C 地址信息。
