---
title: MPU6050 Sample Deep Dive (官方示例工程剖析)
tags: [Zephyr, Subsystem, Sensor, MPU6050, DeviceTree, Trigger]
desc: 从 Zephyr 官方的 MPU6050 传感器示例工程出发，全方位剖析设备树配置、轮询/中断双模式架构以及应用层数据处理逻辑。
update: 2026-02-26
---

# MPU6050 Sample Deep Dive (官方示例工程剖析)

> [!note]
> **Ref:** 
> - 示例源码路径: `$ZEPHYR_BASE/samples/sensor/mpu6050/`
> - MPU6050 驱动: `$ZEPHYR_BASE/drivers/sensor/mpu6050/mpu6050.c`

要真正掌握 Zephyr 的传感器子系统，研读官方的示例工程是最高效的途径。本节我们将通过剖析 `mpu6050` 示例工程，将之前学过的“设备树”、“API 接口”以及“中断触发 (Trigger)”知识点融会贯通。

## 1. 设备树 (DeviceTree) 配置解析

示例工程通过 `boards/` 目录下的 `.overlay` 文件（如 `nrf52dk_nrf52832.overlay`）为特定的开发板挂载传感器。

```dts
&i2c0 {
	mpu6050@68 {
		compatible = "invensense,mpu6050";
		reg = <0x68>;  /* I2C 器件地址 */
		status = "okay";
        
        /* 中断引脚配置 (硬件连线) */
		int-gpios = <&gpio0 11 GPIO_ACTIVE_HIGH>;
        
        /* 静态属性配置 (初始采样率分频) */
		smplrt-div = <249>;
	};
};
```

**关键点解析**：
- `int-gpios`: 这里将 MPU6050 的 INT 引脚物理连接到了 MCU 的 `gpio0` 的第 `11` 号引脚，并配置为高电平有效。这是开启 `Data Ready` 硬件中断的**先决条件**。如果没有配置这个属性，驱动将无法注册触发器。
- `smplrt-div`: MPU6050 特有的静态属性（采样率分频器）。这种针对特定芯片的非标属性通常只能在 DTS 中通过特定键值设置，Zephyr 的编译系统会自动根据绑定的 yaml 文件解析它。

## 2. Kconfig 依赖与模式选择

在 `prj.conf` 中，定义了工程最基础的配置：

```kconfig
CONFIG_I2C=y
CONFIG_SENSOR=y
CONFIG_MPU6050_TRIGGER_NONE=y   # 默认关闭中断触发，使用轮询
CONFIG_CBPRINTF_FP_SUPPORT=y    # 开启 log 和 printf 的浮点数 (%f) 支持
```

**触发模式的编译裁剪**：
MPU6050 的 Kconfig 提供了三种互斥的选项，体现了 Zephyr 驱动对执行上下文的精细控制：
1. `CONFIG_MPU6050_TRIGGER_NONE`: 纯轮询模式 (Polling)。应用层自己写 `while(1) { sleep(); fetch(); }`。
2. `CONFIG_MPU6050_TRIGGER_GLOBAL_THREAD`: 驱动产生的中断工作项，会提交给操作系统的**全局系统工作队列 (System Workqueue)** 中执行。这最省内存。
3. `CONFIG_MPU6050_TRIGGER_OWN_THREAD`: 驱动会在内部单独开辟一个**专属的 MPU6050 中断处理线程**。这能防止其他驱动在全局工作队列中阻塞 MPU6050 的及时响应，但会消耗额外的栈内存。

*官方示例在源码中通过 `#ifdef CONFIG_MPU6050_TRIGGER` 巧妙地同时兼容了轮询与中断两种模式的代码。*

## 3. 应用层代码剖析 (`src/main.c`)

### 3.1 核心处理函数 `process_mpu6050`

无论是在主线程的 `while` 循环里，还是在中断触发回调里，获取数据的核心逻辑是完全一致的：

```c
static int process_mpu6050(const struct device *dev)
{
	struct sensor_value temperature;
	struct sensor_value accel[3];
	struct sensor_value gyro[3];

    /* 1. 发起一次完整的总线读取 (Fetch 快照) */
	int rc = sensor_sample_fetch(dev);

    /* 2. 如果成功，从快照中提取各通道数据 (Get) */
	if (rc == 0) {
        /* 注意：获取 XYZ 三轴数据，传入的是一个数组指针 */
		rc = sensor_channel_get(dev, SENSOR_CHAN_ACCEL_XYZ, accel);
	}
	if (rc == 0) {
		rc = sensor_channel_get(dev, SENSOR_CHAN_GYRO_XYZ, gyro);
	}
	if (rc == 0) {
		rc = sensor_channel_get(dev, SENSOR_CHAN_DIE_TEMP, &temperature);
	}

    /* 3. 打印数据 (使用浮点数转换工具) */
	if (rc == 0) {
		printf("[%s]:%g Cel
"
		       "  accel %f %f %f m/s/s
"
		       "  gyro  %f %f %f rad/s
",
		       now_str(),
		       sensor_value_to_double(&temperature),
		       sensor_value_to_double(&accel[0]), ...);
	}
	return rc;
}
```

### 3.2 轮询模式 vs 触发模式的主体架构

在 `main()` 函数中，代码展示了如何根据 Kconfig 进行分支处理：

```c
int main(void)
{
	const struct device *const mpu6050 = DEVICE_DT_GET_ONE(invensense_mpu6050);

#ifdef CONFIG_MPU6050_TRIGGER
    /* --- 触发模式 (Interrupt Driven) --- */
    
    /* 1. 这里的 trigger 被声明为全局 static，防止悬空指针 */
	trigger = (struct sensor_trigger) {
		.type = SENSOR_TRIG_DATA_READY,
		.chan = SENSOR_CHAN_ALL,
	};
    
    /* 2. 注册回调 handle_mpu6050_drdy */
	if (sensor_trigger_set(mpu6050, &trigger, handle_mpu6050_drdy) < 0) {
		printf("Cannot configure trigger
");
		return 0;
	}
	printk("Configured for triggered sampling.
");
#endif

    /* --- 轮询模式 (Polling) --- */
    /* 当未启用 TRIGGER 宏时，主线程进入死循环 */
	while (!IS_ENABLED(CONFIG_MPU6050_TRIGGER)) {
		int rc = process_mpu6050(mpu6050);
		if (rc != 0) {
			break;
		}
		k_sleep(K_SECONDS(2));
	}

	/* 当启用 TRIGGER 时，主函数到此退出。
     * 因为后续的数据抓取全靠底层工作队列/专用线程里的回调函数驱动！ */
	return 0;
}
```

## 4. 总结与反思

通过分析这个官方示例，我们深刻理解了：
1. **统一 API 的魔力**: 无论是三轴加速度 (`accel[3]`) 还是三轴陀螺仪，都只需要一次 `fetch` 加上指定 `SENSOR_CHAN_ACCEL_XYZ` 就能干净利落地取回。
2. **生命周期的演变**: 启用了中断触发后，`main` 函数的生命周期结束了也无所谓。传感器的工作重心已经完全转移到了底层驱动创建的 **“回调执行线程 (Workqueue/Own Thread)”** 中。

然而，这个示例在**大型工程架构中是不及格的**。
它的 `handle_mpu6050_drdy`（运行在传感器后台线程）中，竟然直接调用了 `printf` 这种极其耗时且可能阻塞的 I/O 操作。在真实的实时系统中，这会严重拖慢整个系统工作队列的处理速度。

**下一章节 (`06-Sensor_to_Zbus_Integration.md`)**，我们将针对这个缺陷进行开刀，引入 `zbus` 实现“**中断线程只管取数与发布，业务线程负责格式化与打印**”的高性能解耦架构！
