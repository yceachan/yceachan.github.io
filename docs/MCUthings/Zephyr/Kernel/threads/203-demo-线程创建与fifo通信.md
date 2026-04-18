---
title: Demo 分析 - 多线程控制 (Multi-threading Control)
tags: [Zephyr, Demo, Thread, FIFO, GPIO, Heap]
desc: 分析 prj/02-threads 示例，演示静态线程创建、FIFO 队列通信以及 GPIO 控制。
update: 2026-02-12
---

# Demo 分析: 多线程控制 (Multi-threading Control)

> [!note]
> **Ref:** `prj/02-threads`

## 概述 (Overview)

本示例展示了 Zephyr OS 中多线程协作的经典模式：**生产者-消费者模型 (Producer-Consumer Model)**。

系统包含三个并发运行的线程：
1.  **生产者线程 A (`blink0`)**: 以 100ms 周期闪烁 LED0，并向 FIFO 队列发送状态数据。
2.  **生产者线程 B (`blink1`)**: 以 1000ms 周期闪烁 LED1，并向 FIFO 队列发送状态数据。
3.  **消费者线程 (`uart_out`)**: 阻塞等待 FIFO 队列中的数据，一旦收到数据，将其打印到 UART 控制台。

此 Demo 综合运用了 **静态线程定义**、**FIFO 消息队列**、**动态内存分配 (Heap)** 以及 **设备树 (Devicetree)** 硬件抽象。

## 源码分析 (Source Code Analysis)

以下是添加了详细中文注释的 `src/main.c` 源码：

```c
/*
 * Copyright (c) 2017 Linaro Limited
 *
 * SPDX-License-Identifier: Apache-2.0
 */

#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/sys/printk.h>
#include <zephyr/sys/__assert.h>
#include <string.h>

/* 定义线程栈大小 (字节) */
#define STACKSIZE 1024

/* 定义线程优先级 (数字越小优先级越高，7 为标准应用优先级) */
#define PRIORITY 7

/* 
 * 从设备树 (Devicetree) 的 /aliases 节点获取名为 led0/led1 的节点标识符 (Node Identifier) 
 * 这使得代码与具体硬件解耦，只要板级 dts 文件定义了别名即可。
 */
#define LED0_NODE DT_ALIAS(led0)
#define LED1_NODE DT_ALIAS(led1)

/* 
 * 编译时检查 (Build-time Check)：确保设备树中定义了该别名，并且其状态为 "okay"。
 * 如果开发板 dts 没有定义 led0/led1 别名，编译将直接报错终止。
 */
#if !DT_NODE_HAS_STATUS_OKAY(LED0_NODE)
#error "Unsupported board: led0 devicetree alias is not defined"
#endif

#if !DT_NODE_HAS_STATUS_OKAY(LED1_NODE)
#error "Unsupported board: led1 devicetree alias is not defined"
#endif

/* 
 * FIFO 数据项结构体
 * 
 * 注意：Zephyr 的 k_fifo 要求数据项的第一个字 (Word) 必须保留给内核使用，
 * 用于在链表中存储指向下一个节点的指针。
 */
struct printk_data_t {
	void *fifo_reserved; /* 第一个字保留给 FIFO 内部链表指针使用 */
	uint32_t led;        /* LED ID */
	uint32_t cnt;        /* 计数器值 */
};

/**
 * @brief 静态定义并初始化一个 FIFO (First In, First Out) 队列
 * 
 * K_FIFO_DEFINE(name) 会创建一个名为 name 的 struct k_fifo 实例，
 * 并将其初始化为空队列。
 */
K_FIFO_DEFINE(printk_fifo);

struct led {
	struct gpio_dt_spec spec;
	uint8_t num;
};

/* 
 * 初始化 LED 的硬件规格信息。
 * 
 * GPIO_DT_SPEC_GET_OR(node_id, prop, default_value) 宏用于从设备树节点提取 GPIO 信息：
 * 1. Port: GPIO 控制器设备指针 (如 GPIOA)
 * 2. Pin: 引脚编号 (如 Pin 5)
 * 3. Flags: 硬件标志位 (如 GPIO_ACTIVE_LOW)
 * 
 * 如果提取失败（例如节点不存在该属性），则使用默认值 {0}。
 */
static const struct led led0 = {
	.spec = GPIO_DT_SPEC_GET_OR(LED0_NODE, gpios, {0}),
	.num = 0,
};

static const struct led led1 = {
	.spec = GPIO_DT_SPEC_GET_OR(LED1_NODE, gpios, {0}),
	.num = 1,
};

/*
 * 通用的 LED 闪烁逻辑 (生产者线程函数)
 * @param led       LED 硬件描述结构体
 * @param sleep_ms  闪烁周期 (毫秒)
 * @param id        LED 标识 ID
 */
void blink(const struct led *led, uint32_t sleep_ms, uint32_t id)
{
	const struct gpio_dt_spec *spec = &led->spec;
	int cnt = 0;
	int ret;

	/* 检查 GPIO 控制器设备是否就绪 */
	if (!device_is_ready(spec->port)) {
		printk("Error: %s device is not ready
", spec->port->name);
		return;
	}

	/* 配置 GPIO 引脚为输出模式 */
	ret = gpio_pin_configure_dt(spec, GPIO_OUTPUT);
	if (ret != 0) {
		printk("Error %d: failed to configure pin %d (LED '%d')
",
			ret, spec->pin, led->num);
		return;
	}

	while (1) {
		/* 设置 LED 引脚电平 (根据计数器奇偶性翻转) */
		gpio_pin_set(spec->port, spec->pin, cnt % 2);

		/* 准备发送给消费者的数据 */
		struct printk_data_t tx_data = { .led = id, .cnt = cnt };

		/* 
		 * 动态内存分配 (Heap Allocation)
		 * 注意：通过 FIFO 发送数据时，通常需要分配独立的内存块，
		 * 因为 FIFO 存储的是指针。如果使用栈变量，函数返回后地址失效会导致错误。
		 */
		size_t size = sizeof(struct printk_data_t);
		char *mem_ptr = k_malloc(size);
		
		/* 断言检查：确保内存分配成功 (需要在 prj.conf 中配置 CONFIG_HEAP_MEM_POOL_SIZE) */
		__ASSERT_NO_MSG(mem_ptr != 0);

		memcpy(mem_ptr, &tx_data, size);

		/* 
		 * 将数据块指针放入 FIFO 队列 (入队)
		 * 这是一个非阻塞操作。
		 */
		k_fifo_put(&printk_fifo, mem_ptr);

		/* 线程睡眠，让出 CPU */
		k_msleep(sleep_ms);
		cnt++;
	}
}

/* 线程入口函数：控制 LED0 */
void blink0(void)
{
	blink(&led0, 100, 0);
}

/* 线程入口函数：控制 LED1 */
void blink1(void)
{
	blink(&led1, 1000, 1);
}

/* 
 * 消费者线程：UART 输出
 * 负责从 FIFO 读取数据并打印
 */
void uart_out(void)
{
	while (1) {
		/* 
		 * 从 FIFO 获取数据 (出队)
		 * K_FOREVER: 如果队列为空，线程将进入阻塞 (Blocked) 状态，
		 * 直到有数据被放入队列。
		 */
		struct printk_data_t *rx_data = k_fifo_get(&printk_fifo,
							   K_FOREVER);
		
		/* 打印接收到的数据 */
		printk("Toggled led%d; counter=%d
",
		       rx_data->led, rx_data->cnt);
		
		/* 
		 * 释放内存
		 * 生产者分配 (k_malloc)，消费者释放 (k_free)。
		 * 这是标准的内存管理模式，防止内存泄漏。
		 */
		k_free(rx_data);
	}
}

/* 
 * 静态定义并自动启动线程
 * K_THREAD_DEFINE(name, stack_size, entry, p1, p2, p3, prio, options, delay)
 */
K_THREAD_DEFINE(blink0_id, STACKSIZE, blink0, NULL, NULL, NULL,
		PRIORITY, 0, 0);
K_THREAD_DEFINE(blink1_id, STACKSIZE, blink1, NULL, NULL, NULL,
		PRIORITY, 0, 0);
K_THREAD_DEFINE(uart_out_id, STACKSIZE, uart_out, NULL, NULL, NULL,
		PRIORITY, 0, 0);
```

## 关键技术点 (Key Concepts)

### 1. 静态线程创建 (Static Thread Creation)
使用 `K_THREAD_DEFINE` 宏在编译时定义线程。
*   **优点**：无需编写额外的初始化代码，系统启动时自动创建并运行。
*   **参数**：
    *   `blink0_id`: 线程 ID 变量名。
    *   `STACKSIZE`: 栈大小 (1024 字节)。
    *   `blink0`: 入口函数。
    *   `PRIORITY`: 优先级 (7)。
    *   `0`: 启动延迟 (立即启动)。

### 2. FIFO 通信 (Inter-thread Communication)
使用 `k_fifo` 实现无锁的队列通信。
*   **`K_FIFO_DEFINE(printk_fifo)`**: 定义队列。
*   **`k_fifo_put`**: 生产者调用，将数据指针加入队尾。
*   **`k_fifo_get`**: 消费者调用，从队头取出数据指针。传入 `K_FOREVER` 使消费者在队列为空时自动阻塞，避免忙等待。
*   **内存布局要求**：放入 FIFO 的数据结构体 (`struct printk_data_t`) **必须**保留第一个字 (`void *fifo_reserved`) 给内核使用，用于维护链表指针。

### 3. 动态内存管理 (Dynamic Memory Management)
由于 FIFO 传递的是**指针**，生产者不能传递栈上局部变量的地址（因为函数返回后栈帧销毁）。
*   **`k_malloc`**: 生产者在堆上分配内存来存储数据。
*   **`k_free`**: 消费者在处理完数据后释放内存。
*   **配置**：必须在 `prj.conf` 中设置 `CONFIG_HEAP_MEM_POOL_SIZE` (本例设为 4096 字节)，否则 `k_malloc` 会失败。

### 4. 硬件抽象 (Hardware Abstraction)
代码完全不依赖特定的硬件寄存器，而是通过 Zephyr 的设备树 (Devicetree) API 访问硬件。
*   `DT_ALIAS(led0)`: 获取别名节点。
*   `GPIO_DT_SPEC_GET_OR`: 安全地获取 GPIO 配置信息。
*   `gpio_pin_configure_dt` / `gpio_pin_set`: 通用 GPIO 操作 API。

## 总结
该 Demo 展示了一个典型的嵌入式多任务架构：多个采集/控制线程并行工作，通过消息队列将数据汇聚到一个中心处理线程（如日志打印、数据上报）。这种架构有效地解耦了业务逻辑，利用 RTOS 的阻塞机制实现了高效的 CPU 利用率。
