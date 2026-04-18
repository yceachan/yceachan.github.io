---
title: Demo 分析 - Synchronization
tags: [Zephyr, Sample, Synchronization, Semaphore, Thread]
desc: 分析 Zephyr synchronization 示例程序，演示内核调度与信号量同步机制。
update: 2026-02-12
---

# Demo 分析: Synchronization

## 概述 (Overview)
该示例程序通过创建两个线程（Thread A 和 Thread B）交替在控制台打印欢迎信息，演示了 Zephyr 内核的基础稳定性。它利用 **信号量 (Semaphore)** 和 **睡眠请求 (Sleep requests)** 控制执行流和消息生成的速率，验证了内核的 **调度 (Scheduling)**、**通信 (Communication)** 和 **计时 (Timing)** 机制运行正常。

> [!note]
>
> [zephyr/samples/synchronization/src/main.c at main · zephyrproject-rtos/zephyr](https://github.com/zephyrproject-rtos/zephyr/blob/main/samples/synchronization/src/main.c)

 ```c
/* main.c - Synchronization demo */

/*
 * Copyright (c) 2012-2014 Wind River Systems, Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

#include <zephyr/kernel.h>
#include <zephyr/sys/printk.h>

/*
 * 同步演示包含两个线程，利用信号量 (semaphores) 和睡眠 (sleeping) 机制
 * 轮流以受控的速率打印问候消息。
 * 此演示展示了生成线程的静态 (static) 和动态 (dynamic) 两种方法；
 * 实际应用程序通常会统一使用静态方法来管理两个线程。
 */

/* 
 * 如果启用了 SMP (多核) 且支持 CPU 掩码调度，则启用线程绑定 (Pinning) 逻辑 
 */
 #define PIN_THREADS (IS_ENABLED(CONFIG_SMP) && IS_ENABLED(CONFIG_SCHED_CPU_MASK))

/* 每个线程使用的栈大小 (字节) */
#define STACKSIZE 1024

/* 每个线程使用的调度优先级 (数字越小优先级越高，7 为可抢占优先级) */
#define PRIORITY 7

/* 问候消息之间的延迟 (毫秒) */
#define SLEEPTIME 500


/*
 * 核心工作循环函数
 * @param my_name      线程标识字符串 (用于打印)
 * @param my_sem       线程自己的信号量 (用于等待)
 * @param other_sem    对方线程的信号量 (用于唤醒对方)
 */
 void hello_loop(const char *my_name,
		   struct k_sem *my_sem, struct k_sem *other_sem)
 {
	const char *tname;
	uint8_t cpu;
	struct k_thread *current_thread;

	while (1) {
		/* 
		 * 1. 获取自己的信号量 (P操作/Wait)
		 * 如果信号量计数为 0，线程将在此处阻塞 (Blocked)，直到被唤醒。
		 * K_FOREVER 表示无限期等待。
		 */
		k_sem_take(my_sem, K_FOREVER);

		/* 获取当前线程上下文和 CPU ID (仅用于打印信息) */
		current_thread = k_current_get();
		tname = k_thread_name_get(current_thread);
 #if CONFIG_SMP
		cpu = arch_curr_cpu()->id;
 #else
		cpu = 0;
 #endif
		/* 
		 * 2. 执行临界区任务：打印 "Hello" 
		 * 根据是否获取到线程名来决定打印格式
		 */
		if (tname == NULL) {
			printk("%s: Hello World from cpu %d on %s!\n",
				my_name, cpu, CONFIG_BOARD);
		} else {
			printk("%s: Hello World from cpu %d on %s!\n",
				tname, cpu, CONFIG_BOARD);
		}

		/* 
		 * 3. 模拟工作负载和受控延迟
		 * k_busy_wait: 忙等待 100ms (不让出 CPU，模拟计算密集型任务)
		 * k_msleep:    睡眠 500ms (让出 CPU，进入 Suspend 状态)
		 */
		k_busy_wait(100000);
		k_msleep(SLEEPTIME);
 	
		/* 
		 * 4. 释放对方的信号量 (V操作/Signal)
		 * 增加对方信号量的计数值，唤醒正在等待该信号量的线程。
		 */
		k_sem_give(other_sem);
	}
 }

/* 
 * 定义并初始化信号量 (静态分配)
 * K_SEM_DEFINE(name, initial_count, limit)
 */
 K_SEM_DEFINE(thread_a_sem, 1, 1);	/* 初始值为 1 (可用)，允许 Thread A 先运行 */
 K_SEM_DEFINE(thread_b_sem, 0, 1);	/* 初始值为 0 (不可用)，Thread B 必须等待 */

/* 
 * Thread A: 动态创建示例
 * 该线程在 main 函数中显式生成
 */
 void thread_a_entry_point(void *dummy1, void *dummy2, void *dummy3)
 {
	ARG_UNUSED(dummy1);
	ARG_UNUSED(dummy2);
	ARG_UNUSED(dummy3);

	/* 调用工作循环，传入 A 的信号量和 B 的信号量 */
	hello_loop(__func__, &thread_a_sem, &thread_b_sem);
 }

/* 定义 Thread A 的栈空间 */
K_THREAD_STACK_DEFINE(thread_a_stack_area, STACKSIZE);
/* 定义 Thread A 的数据结构 */
static struct k_thread thread_a_data;

/* 
 * Thread B: 静态创建示例
 * 该线程由 K_THREAD_DEFINE 宏在编译时定义，系统启动时自动生成
 */
 void thread_b_entry_point(void *dummy1, void *dummy2, void *dummy3)
 {
	ARG_UNUSED(dummy1);
	ARG_UNUSED(dummy2);
	ARG_UNUSED(dummy3);

	/* 调用工作循环，注意参数顺序与 A 相反 (等待 B，唤醒 A) */
	hello_loop(__func__, &thread_b_sem, &thread_a_sem);
 }

/* 
 * 静态定义 Thread B
 * K_THREAD_DEFINE(name, stack_size, entry, p1, p2, p3, prio, options, delay)
 * 这里的 delay 为 0，表示立即启动 (但在 hello_loop 中会立即阻塞于信号量)
 */
 K_THREAD_DEFINE(thread_b, STACKSIZE,
				thread_b_entry_point, NULL, NULL, NULL,
				PRIORITY, 0, 0);
 extern const k_tid_t thread_b;

int main(void)
{
	/* 
	 * 动态创建 Thread A
	 * 使用 k_thread_create 在运行时初始化线程
	 * K_FOREVER 表示线程创建后不立即启动，需稍后调用 k_thread_start
	 */
	k_thread_create(&thread_a_data, thread_a_stack_area,
			K_THREAD_STACK_SIZEOF(thread_a_stack_area),
			thread_a_entry_point, NULL, NULL, NULL,
			PRIORITY, 0, K_FOREVER);
	
	/* 设置线程名称 (用于调试) */
	k_thread_name_set(&thread_a_data, "thread_a");

#if PIN_THREADS
	/* 多核环境下的 CPU 亲和性设置 (可选逻辑) */
	if (arch_num_cpus() > 1) {
		k_thread_cpu_pin(&thread_a_data, 0);

		/*
		 * Thread B 是静态线程且立即启动。如果它正在运行，直接设置亲和性可能失败。
		 * 因此先挂起 (Suspend) 它，设置亲和性后再恢复 (Resume)。
		 */
		k_thread_suspend(thread_b);
		k_thread_cpu_pin(thread_b, 1);
		k_thread_resume(thread_b);
	}
#endif

	/* 显式启动动态创建的 Thread A */
	k_thread_start(&thread_a_data);
	return 0;
}
 ```

## 同步原语 (Synchronization Primitives)

核心逻辑依赖于以下 Zephyr 内核原语：

1.  **信号量 (`k_sem`)**: 用于线程间同步，强制执行“乒乓 (Ping-pong)”式的交替运行。
2.  **线程睡眠 (`k_msleep`)**: 引入毫秒级延迟，控制打印速率并释放 CPU 所有权。
3.  **忙等待 (`k_busy_wait`)**: 用于模拟 CPU 密集型任务的处理时间，不会触发线程调度。

### 信号量逻辑 (Semaphore Logic)

程序定义了两个 **二值信号量 (Binary semaphores)** 来协调线程：

```c
/**
 * @brief 静态定义并初始化一个信号量。
 *
 * @param name 信号量的名称（变量名）。
 * @param initial_count 信号量的初始计数值（Initial Count）。
 * @param limit 信号量允许达到的最大计数值（Maximum Limit）。
 * @func  K_SEM_DEFINE(name, initial_count, limit);
 */

/* 定义信号量 */
K_SEM_DEFINE(thread_a_sem, 1, 1);	/* 初始状态为 "可用" (1) */
K_SEM_DEFINE(thread_b_sem, 0, 1);	/* 初始状态为 "不可用" (0) */
```

-   `thread_a_sem`: 初始计数值为 1。控制 Thread A 的首轮执行。
-   `thread_b_sem`: 初始计数值为 0。迫使 Thread B 在启动后立即进入阻塞状态。

### 执行流程 (Execution Flow)

两个线程执行相同的 `hello_loop` 函数，但传入的信号量参数顺序相反。

#### `hello_loop` 函数分析

```c
void hello_loop(const char *my_name,
		   struct k_sem *my_sem, struct k_sem *other_sem)
{
	while (1) {
		/* 1. 获取自身的信号量 (P操作) */
		k_sem_take(my_sem, K_FOREVER);

		/* 2. 临界区 (Critical Section): 打印消息 */
		// ... printk 逻辑 ...

		/* 3. 模拟工作负载与延迟 */
		k_busy_wait(100000); // 忙等 100ms
		k_msleep(SLEEPTIME); // 睡眠 500ms

		/* 4. 释放另一个线程的信号量 (V操作) */
		k_sem_give(other_sem);
	}
}
```

#### 时序过程

1.  **Thread A** 调用 `k_sem_take(thread_a_sem)`：由于初始值为 1，A 成功获取信号量并执行。
2.  **Thread B** 调用 `k_sem_take(thread_b_sem)`：由于初始值为 0，B 进入 **等待队列 (Wait Q)**。
3.  **Thread A** 执行完毕并调用 `k_sem_give(thread_b_sem)`：B 被唤醒并进入 **就绪队列 (Ready Q)**。
4.  **Thread B** 执行并最终通过 `k_sem_give(thread_a_sem)` 唤醒 A。

## 线程管理 (Thread Management)

此 Demo 展示了两种线程创建方式：

1.  **动态创建 (Dynamic Creation)**:
    *   通过 `K_THREAD_STACK_DEFINE` 定义栈空间。
    *   手动定义 `struct k_thread` 实例。
    *   在 `main` 函数中使用 `k_thread_create` 在运行时初始化。

2.  **静态定义 (Static Definition)**:
    *   使用 `K_THREAD_DEFINE` 宏在编译时完成定义与初始化。
    *   内核启动后会自动派生该线程，无需手动调用创建函数。

## 总结
通过这种 **生产者-消费者 (Producer-Consumer)** 变体的同步模型，Zephyr 验证了其多线程环境下上下文切换 (Context Switch) 的正确性，以及时钟节拍 (Tick) 对睡眠时间的精确控制。
