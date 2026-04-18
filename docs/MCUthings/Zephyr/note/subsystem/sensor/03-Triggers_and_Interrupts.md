---
title: Sensor Triggers & Interrupts (触发器与硬件中断)
tags: [Zephyr, Subsystem, Sensor, Interrupt, Trigger, DRDY]
desc: 深入解析 Zephyr 传感器子系统中的 Trigger 机制，学习如何利用硬件中断（如 Data Ready）取代轮询，以及回调函数的执行上下文分析。
update: 2026-02-26
---

# Sensor Triggers & Interrupts (触发器与硬件中断)

> [!note]
> **Ref:** `include/zephyr/drivers/sensor.h` -> `sensor_trigger_set()`

在 `01-Overview.md` 中，我们看到了通过 `k_sleep` 和 `while(1)` 循环去不断轮询 (Polling) 传感器的状态。这种方式虽然简单，但在实际的低功耗物联网设备中是不可接受的，它会让 MCU 频繁醒来，浪费大量电能。

现代传感器（如 IMU、温湿度计）通常都带有专门的硬件中断引脚（如 `INT1`, `INT2`）。当数据准备好（Data Ready）或物理量超过设定阈值（Threshold）时，传感器会拉高/拉低这个引脚，主动唤醒 MCU。

Zephyr 将这种机制抽象为了 **Sensor Triggers (传感器触发器)**。

## 1. 核心数据结构与类型

要使用触发器，你需要先定义一个 `struct sensor_trigger` 结构体，它指定了你要监听“什么通道”的“什么事件”。

```c
struct sensor_trigger {
	enum sensor_trigger_type type; /* 触发类型 */
	enum sensor_channel chan;      /* 关联的物理通道 */
};
```

**常见的 Trigger 类型 (`enum sensor_trigger_type`):**
- `SENSOR_TRIG_DATA_READY`: 数据就绪 (DRDY)。传感器内部的 ADC 转换完毕，可以安全地通过 `fetch` 读取最新数据了。
- `SENSOR_TRIG_THRESHOLD`: 阈值报警。例如环境温度超过 50℃，或者加速度（跌落）超过 2g。
- `SENSOR_TRIG_TAP`: 敲击/双击事件 (常见于 IMU 加速度计)。
- `SENSOR_TRIG_MOTION`: 运动检测事件。

## 2. 注册触发器 (`sensor_trigger_set`)

应用层通过 `sensor_trigger_set` API 将触发器与你的回调函数绑定：

```c
int sensor_trigger_set(const struct device *dev,
				       const struct sensor_trigger *trig,
				       sensor_trigger_handler_t handler);
```

### ⚠️ 内存生命周期陷阱 (Container Of 技巧)

**这是一个非常容易踩坑的地方！** Zephyr 底层驱动并**不会拷贝**你传入的 `struct sensor_trigger` 的内容，而是**直接保存了它的指针**。
这意味着，**你绝对不能将 `struct sensor_trigger` 分配在栈 (Stack) 上**（即不能定义为函数的局部变量），否则函数退出后指针就悬空了！

**正确做法（全局变量或分配在堆/内存池）：**
```c
/* 全局变量，生命周期与程序相同 */
static struct sensor_trigger data_ready_trig = {
    .type = SENSOR_TRIG_DATA_READY,
    .chan = SENSOR_CHAN_ALL,
};

// ... 在初始化函数中 ...
sensor_trigger_set(dev, &data_ready_trig, my_sensor_handler);
```

更进阶的用法是利用 `CONTAINER_OF` 宏，将 trigger 嵌入到你的应用层上下文结构体中，这样可以在回调函数中反向解析出你的业务上下文：

```c
struct my_app_ctx {
    int config_id;
    struct sensor_trigger trig; // 嵌入
};

void my_handler(const struct device *dev, const struct sensor_trigger *trig) {
    // 从 trig 指针反推上下文指针！
    struct my_app_ctx *ctx = CONTAINER_OF(trig, struct my_app_ctx, trig);
    LOG_INF("Received data for config %d", ctx->config_id);
}
```

## 3. 回调函数的执行上下文 (Thread Safe!)

当你收到一个中断触发时，你的回调函数 (`sensor_trigger_handler_t`) 中需要调用 `sensor_sample_fetch()` 来读取数据。
但我们知道，`fetch` 通常涉及到 I2C 或 SPI 总线传输，而 **总线传输是阻塞操作，绝对不能在硬件 ISR (中断服务程序) 中执行！**

**Zephyr 的优雅解法：自动线程转移**

阅读 `sensor.h` 中的官方注释：
> "The handler will be called from a thread, so I2C or SPI operations are safe. However, the thread's stack is limited..."

Zephyr 的 Sensor 子系统（结合具体驱动的实现）在底层拦截了硬件中断。驱动的硬件 ISR 仅仅会发出一个信号量 (Semaphore) 或提交一个工作项 (Work Item) 到系统的**系统工作队列 (System Workqueue)**，或者是驱动自己维护的专门 Trigger 线程中。

因此，**当你的 `handler` 被调用时，它已经安全地运行在一个线程上下文中了！**
你可以放心地在里面调用 `sensor_sample_fetch()`，甚至调用 `k_msleep()` 或 `k_mutex_lock()`，完全不用担心引发内核崩溃。

**注意限制**：
虽然是线程，但这个线程的栈空间（Stack Size）通常是由驱动或 Kconfig (`CONFIG_SENSOR_WORKQ_STACK_SIZE` 等) 静态分配的，往往不大（可能只有 1024 字节）。**请不要在回调函数中分配巨大的局部数组，或执行过深的递归调用，否则会导致 Stack Overflow。**

## 4. 完整的 Data Ready 示例

```c
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(sensor_trig, LOG_LEVEL_INF);

/* 1. 静态分配 trigger，防止栈释放导致野指针 */
static struct sensor_trigger drdy_trigger = {
    .type = SENSOR_TRIG_DATA_READY,
    .chan = SENSOR_CHAN_ALL,
};

/* 2. 中断回调函数 (运行在线程上下文！) */
static void sensor_drdy_handler(const struct device *dev,
                                const struct sensor_trigger *trig)
{
    struct sensor_value temp, hum;

    /* 放心调用 fetch，底层是 I2C 阻塞传输也不会崩溃 */
    if (sensor_sample_fetch(dev) < 0) {
        LOG_ERR("Fetch failed in trigger handler");
        return;
    }

    sensor_channel_get(dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);
    sensor_channel_get(dev, SENSOR_CHAN_HUMIDITY, &hum);

    LOG_INF("Trig! Temp: %.2f C, Hum: %.2f %%", 
            sensor_value_to_double(&temp),
            sensor_value_to_double(&hum));
}

void main(void)
{
    const struct device *const dev = DEVICE_DT_GET_ANY(sensirion_sht3xd);
    if (!device_is_ready(dev)) {
        return;
    }

    /* 3. 注册触发器 */
    if (sensor_trigger_set(dev, &drdy_trigger, sensor_drdy_handler) < 0) {
        LOG_ERR("Failed to set sensor trigger. Check Kconfig and DTS interrupts!");
        return;
    }

    LOG_INF("Sensor trigger set. Main thread going to sleep...");
    
    /* 主线程可以永远睡眠，完全依赖中断唤醒执行 */
    k_sleep(K_FOREVER);
}
```

> **硬件依赖提示**: 
> 要想让上述代码工作，仅仅调用 API 是不够的。你必须在设备树 (DTS) 中为该传感器正确配置 `interrupts` 属性（将 MCU 的 GPIO 引脚连接到传感器的 INT 引脚），并且可能需要在 Kconfig 中开启类似 `CONFIG_XXX_TRIGGER_GLOBAL_THREAD=y` 这样的底层支持。
