---
title: Sensor Attributes & Configuration (属性配置与动态调整)
tags: [Zephyr, Subsystem, Sensor, Attributes, Configuration]
desc: 深入解析如何使用 Zephyr Sensor Attributes API (sensor_attr_set / get) 在运行时动态调整传感器的采样率、量程等参数，以及它与设备树静态配置的差异。
update: 2026-02-26
---

# Sensor Attributes & Configuration (属性配置与动态调整)

> [!note]
> **Ref:** 
> - [Zephyr Sensor Attributes](https://docs.zephyrproject.org/latest/hardware/peripherals/sensor/attributes.html)
> - `include/zephyr/drivers/sensor.h` -> `enum sensor_attribute`

在构建真实的传感器应用时，仅仅能够“读取数据”往往是不够的。不同的应用场景对传感器的性能要求截然不同：
- **静态休眠时**：你可能希望加速度计的采样率降到最低（如 1Hz），量程设为 ±2g，以极致省电。
- **运动检测时**：你可能需要将采样率提高到 200Hz，量程设为 ±16g，以捕捉剧烈的撞击或震动。

这些参数如果写死在设备树 (DeviceTree, DTS) 中，虽然能在系统启动时自动完成初始化，但**缺乏运行时的灵活性**。Zephyr 通过 **Sensor Attributes (传感器属性) API** 解决了这一痛点，它允许你在代码中动态修改底层硬件的寄存器配置。

## 1. 静态配置 (DeviceTree) vs 动态配置 (Attributes API)

### 1.1 设备树 (DTS) 静态配置
设备树定义了传感器的**初始默认状态**。通常在系统的启动阶段，Zephyr 的传感器驱动初始化函数会自动读取这些值并写入硬件寄存器。
```dts
/* 示例: mpu6050 节点 */
mpu6050@68 {
    compatible = "invensense,mpu6050";
    reg = <0x68>;
    /* 静态配置初始参数 */
    gyro-fs = <250>;      /* 陀螺仪量程 ±250 deg/s */
    accel-fs = <2>;       /* 加速度计量程 ±2g */
    gyro-sr-div = <255>;  /* 采样率分频 */
};
```
**优点**: 零代码，系统上电即配置好，适合那些参数永远不变的简单应用。
**缺点**: 无法在程序运行中途更改。

### 1.2 动态配置 (Attributes API)
如果需要在运行时改变参数（如进入低功耗模式前降低采样率），就需要使用 `sensor_attr_set` 和 `sensor_attr_get`。

## 2. 核心 API: `sensor_attr_set` & `sensor_attr_get`

```c
int sensor_attr_set(const struct device *dev,
                    enum sensor_channel chan,
                    enum sensor_attribute attr,
                    const struct sensor_value *val);

int sensor_attr_get(const struct device *dev,
                    enum sensor_channel chan,
                    enum sensor_attribute attr,
                    struct sensor_value *val);
```

### 关键参数解析：
- **`chan` (通道)**：你要配置的物理量通道。有些属性是全局的（影响整个芯片，通常传入 `SENSOR_CHAN_ALL`），有些则是针对特定通道的（如单独设置 X 轴的阈值）。
- **`attr` (属性类型)**：你要修改的具体参数枚举。
- **`val` (值)**：配置的数值，同样使用万能的定点数结构体 `struct sensor_value`。

## 3. 常用属性 (`enum sensor_attribute`)

Zephyr 预定义了许多标准属性，最常用的包括：

1. **`SENSOR_ATTR_SAMPLING_FREQUENCY` (采样频率)**
   - **说明**: 传感器每秒采集数据的次数 (Hz)。
   - **`val` 表示**: `val1` 为 Hz 的整数部分，`val2` 为小数部分（微赫兹）。

2. **`SENSOR_ATTR_FULL_SCALE` (满量程/范围)**
   - **说明**: 传感器能测量的最大物理量范围。设置合适的量程可以提高测量分辨率并防止数据截断（溢出）。
   - **`val` 表示**: 采用 SI 国际单位制。例如，对于加速度计通道 (`SENSOR_CHAN_ACCEL_XYZ`)，单位是 `m/s²`（注意：不是 g！1g ≈ 9.80665 m/s²）。对于陀螺仪，单位是 `rad/s`。

3. **`SENSOR_ATTR_OVERSAMPLING` (过采样率)**
   - **说明**: 传感器内部进行多次采样并求平均以降低噪声的倍数（常见于温湿度气压计如 BME280）。
   - **`val` 表示**: `val1` 通常为整数倍数（如 1, 2, 4, 8, 16），`val2` 为 0。

4. **触发相关属性**:
   - `SENSOR_ATTR_UPPER_THRESH`: 触发器上限阈值。
   - `SENSOR_ATTR_LOWER_THRESH`: 触发器下限阈值。
   - `SENSOR_ATTR_HYSTERESIS`: 阈值回差（迟滞），防止在临界点频繁触发。

5. **`SENSOR_ATTR_OFFSET` (偏移量校准)**
   - **说明**: 在传感器原始数据上叠加一个偏移量，用于软件校准零点。

## 4. 实战示例：动态切换运动检测模式

假设我们有一个可穿戴设备，正常情况下为了省电，我们让加速度计以 1Hz 运行；当用户点击屏幕唤醒设备时，我们将采样率提高到 100Hz，量程设为 ±4g。

```c
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(sensor_config, LOG_LEVEL_INF);

/* 辅助宏：将 g 转换为 m/s^2 定点数 */
#define G_TO_MS2_VAL1(g) ((g) * 9)
#define G_TO_MS2_VAL2(g) (((g) * 806650)) // 9.80665

void set_sensor_active_mode(const struct device *accel_dev)
{
    struct sensor_value val;
    int ret;

    /* 1. 设置采样率为 100 Hz */
    val.val1 = 100;
    val.val2 = 0;
    ret = sensor_attr_set(accel_dev, SENSOR_CHAN_ACCEL_XYZ, 
                          SENSOR_ATTR_SAMPLING_FREQUENCY, &val);
    if (ret < 0) {
        LOG_ERR("Failed to set sampling frequency: %d", ret);
    }

    /* 2. 设置量程为 4g (必须换算为 m/s^2) */
    /* 4g = 4 * 9.80665 = 39.2266 m/s^2 */
    val.val1 = 39;
    val.val2 = 226600;
    ret = sensor_attr_set(accel_dev, SENSOR_CHAN_ACCEL_XYZ, 
                          SENSOR_ATTR_FULL_SCALE, &val);
    if (ret < 0) {
        LOG_ERR("Failed to set full scale: %d", ret);
    }

    LOG_INF("Sensor configured to ACTIVE mode (100Hz, 4g)");
}

void set_sensor_sleep_mode(const struct device *accel_dev)
{
    struct sensor_value val;
    
    /* 设置采样率为 1 Hz */
    val.val1 = 1;
    val.val2 = 0;
    sensor_attr_set(accel_dev, SENSOR_CHAN_ACCEL_XYZ, 
                    SENSOR_ATTR_SAMPLING_FREQUENCY, &val);

    /* 设置量程为 2g */
    /* 2g = 19.6133 m/s^2 */
    val.val1 = 19;
    val.val2 = 613300;
    sensor_attr_set(accel_dev, SENSOR_CHAN_ACCEL_XYZ, 
                    SENSOR_ATTR_FULL_SCALE, &val);

    LOG_INF("Sensor configured to SLEEP mode (1Hz, 2g)");
}
```

## 5. 驱动限制与错误处理

**非常重要**：`sensor_attr_set` 是一个很容易返回错误码的函数（通常返回 `-ENOTSUP`，即“不支持此操作”）。
这主要有以下几个原因：

1. **硬件不支持**: 不是所有传感器硬件都支持所有属性。例如，一个简单的开关型温控器就不支持动态修改 `SAMPLING_FREQUENCY`。
2. **驱动未实现**: 即便硬件支持，如果 Zephyr 的底层驱动编写者偷懒，没有在 `sensor_driver_api` 结构体中实现 `attr_set` 回调，调用此 API 也会失败。
3. **离散值不匹配**: 很多传感器寄存器只允许有限的几个离散值（例如采样率只能选 12.5Hz, 25Hz, 50Hz, 100Hz）。如果你传入 `val1 = 33`，驱动会怎么做？
   - 好的驱动会自动为你选择“最接近但不大于”的值（例如 25Hz）。
   - 严格的驱动可能会直接返回 `-EINVAL` (Invalid Argument)。
   - **最佳实践**：查阅该传感器芯片的 Datasheet，尽量传入其硬件寄存器天然支持的精确数值。
