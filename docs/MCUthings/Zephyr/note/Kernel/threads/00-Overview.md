---
title: Zephyr 线程模型总览
tags: [Zephyr, Kernel, Thread, TCB, Overview]
desc: Zephyr RTOS 线程管理机制的核心概念、数据结构与架构综述
update: 2026-02-12
---

# Zephyr 线程模型总览

## 1. 核心概念 (Core Concepts)

在 Zephyr RTOS 中，**线程 (Thread)** 是被内核调度器 (Scheduler) 管理的最小执行单元。每个线程都代表一段独立的指令序列，拥有自己独立的上下文 (Context)。

![../../../_images/thread_states.svg](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/thread_states.svg)

> [!Tip]
>
> `suspend`与其他`state`具有**正交性**，可从任何状态挂起`suspend`和恢复`resume`
>
> ![2da08c0a-93eb-4ae2-8b66-c9c2b51b020d](https://ali-oss-yceachan.oss-cn-chengdu.aliyuncs.com/img-bed-typora/2da08c0a-93eb-4ae2-8b66-c9c2b51b020d.png)

---

> [!Important]
>
> [Threads — Zephyr Project Documentation](https://docs.zephyrproject.org/latest/kernel/services/threads/index.html#lifecycle)
>
> A thread has the following key properties:
>
> - A **stack area**, which is a region of memory used for the thread’s stack. The **size** of the stack area can be tailored to conform to the actual needs of the thread’s processing. Special macros exist to create and work with stack memory regions.
> - A **thread control block** for private kernel bookkeeping of the thread’s metadata. This is an instance of type [`k_thread`](https://docs.zephyrproject.org/latest/doxygen/html/structk__thread.html).
> - An **entry point function**, which is invoked when the thread is started. Up to 3 **argument values** can be passed to this function.
> - A **scheduling priority**, which instructs the kernel’s scheduler how to allocate CPU time to the thread. (See [Scheduling](https://docs.zephyrproject.org/latest/kernel/services/scheduling/index.html#scheduling-v2).)
> - A set of **thread options**, which allow the thread to receive special treatment by the kernel under specific circumstances. (See [Thread Options](https://docs.zephyrproject.org/latest/kernel/services/threads/index.html#thread-options-v2).)
> - A **start delay**, which specifies how long the kernel should wait before starting the thread.
> - An **execution mode**, which can either be supervisor or user mode. By default, threads run in supervisor mode and allow access to privileged CPU instructions, the entire memory address space, and peripherals. User mode threads have a reduced set of privileges. This depends on the [`CONFIG_USERSPACE`](https://docs.zephyrproject.org/latest/kconfig.html#CONFIG_USERSPACE) option. See [User Mode](https://docs.zephyrproject.org/latest/kernel/usermode/index.html#usermode-api).

### 1.1 线程类型

Zephyr 根据运行权限和调度行为将线程分为几类：

1.  **协作式线程 (Cooperative Threads)**:
    - 优先级为负数 (如 -1, -2)。
    - **非抢占**: 除非主动放弃 CPU (Yield, Sleep) 或等待资源，否则不会被其他线程抢占（即使是更高优先级的线程）。
    - 用于对时序要求极高、不允许被打断的关键任务。

2.  **抢占式线程 (Preemptive Threads)**:
    - 优先级非负 (如 0, 1, 2)。
    - **可抢占**: 可被更高优先级 (数字更小) 的就绪线程随时抢占。
    - 0 是最高抢占优先级。

3.  **系统线程 (System Threads)**:
    - 运行在内核模式 (Supervisor Mode)，拥有对硬件和内存的完全访问权限。
    - `Main` 线程和 `Idle` 线程属于此类。

4.  **用户线程 (User Threads)**:
    - 运行在用户模式，权限受限。
    - 只能访问被授权的内存域和内核对象 (System Calls)。

## 2. 线程关键属性 (Key Properties)

根据 Zephyr 官方文档，每个线程都拥有以下 7 个核心属性：

### 2.1 栈区域 (Stack Area)
栈是线程用于存放局部变量、函数调用上下文的专用内存区域。
- **大小定制**: 栈大小可根据线程处理任务的实际需求进行精细调整。
- **安全声明**: 必须使用内核提供的宏（如 `K_THREAD_STACK_DEFINE`）进行声明，以确保正确的内存对齐，并预留 MPU/MMU 保护区域（Guard Zones）。
- **特权栈**: 对于用户模式线程，内核还会自动为其分配一个受保护的特权模式栈，用于处理系统调用。

### 2.2 线程控制块 (Thread Control Block)

> [!note]
>
> all these conditional member , using #ifdef macro to conditional  compile.
>
> and all these macro defined in kconfig

```c
struct k_thread {
    struct _thread_base base;                         // 基础调度单元
    struct _callee_saved callee_saved;                // 架构相关的被调用者保存寄存器
    void *init_data;                                  // 静态线程初始化数据
    _wait_q_t join_queue;                             // 等待此线程退出的队列

    struct z_poller poller;                           // conditional by CONFIG_POLL
    struct k_thread *next_event_link;                 // conditional by CONFIG_EVENTS
    uint32_t events;                                  // conditional by CONFIG_EVENTS
    uint32_t event_options;                           // conditional by CONFIG_EVENTS
    bool no_wake_on_timeout;                          // conditional by CONFIG_EVENTS
    struct __thread_entry entry;                      // conditional by CONFIG_THREAD_MONITOR
    struct k_thread *next_thread;                     // conditional by CONFIG_THREAD_MONITOR
    char name[CONFIG_THREAD_MAX_NAME_LEN];            // conditional by CONFIG_THREAD_NAME
    void *custom_data;                                // conditional by CONFIG_THREAD_CUSTOM_DATA
    struct _thread_userspace_local_data *userspace_local_data; // conditional by CONFIG_THREAD_USERSPACE_LOCAL_DAT
    int errno_var;                                    // conditional by CONFIG_ERRNO && !TLS && !LIBC && !USERSPAC
    struct _thread_stack_info stack_info;             // conditional by CONFIG_THREAD_STACK_INFO
    struct _mem_domain_info mem_domain_info;          // conditional by CONFIG_USERSPACE
    k_thread_stack_t *stack_obj;                      // conditional by CONFIG_USERSPACE
    void *syscall_frame;                              // conditional by CONFIG_USERSPACE
    int swap_retval;                                  // conditional by CONFIG_USE_SWITCH
    void *switch_handle;                              // conditional by CONFIG_USE_SWITCH

    struct k_heap *resource_pool;                     // 线程资源池

    uintptr_t tls;                                    // conditional by CONFIG_THREAD_LOCAL_STORAGE
    struct k_mem_paging_stats_t paging_stats;         // conditional by CONFIG_DEMAND_PAGING_THREAD_STATS
    struct k_obj_core obj_core;                       // conditional by CONFIG_OBJ_CORE_THREAD
    _wait_q_t halt_queue;                             // conditional by CONFIG_SMP (Wait for suspend)

    struct _thread_arch arch;                         // 架构特定成员，必须位于末尾
};
```

---


### 2.3 入口函数 (Entry Point Function)
线程启动时调用的函数。
- **三参数设计**: 入口函数支持传入多达 3 个 `void *` 类型的参数（`p1`, `p2`, `p3`），这比传统的单参数设计（如 FreeRTOS）更具灵活性。

```c
void my_entry_point(int unused1, int unused2, int unused3)
{
    while (1) {
        ...
        if (<some condition>) {
            return;/* rtn point thread terminates from mid-entry point function */
        }
        ...
    }

    /*rtn point  thread terminates at end of entry point function */
}
```

### 2.4 调度优先级 (Scheduling Priority)
告知调度器如何分配 CPU 时间。
- **数值越小，优先级越高**。
- **优先级区域**: 
    - 负数：协作式优先级（不可抢占）。
    - 非负数：抢占式优先级。
    - 同优先级调度：
      1. 默认机制：FIFO —— 先就绪的线程先执行，直到`k_yield()` (or pending 、 suspend 、Terminated)
      2. 时间片轮转：
         * 配置宏：CONFIG_TIMESLICING=y
         * 工作原理：
             1. 调度器为同优先级的抢占式线程分配一个固定的时间配额（Time Quantum）。
             2. 当线程持续运行的时间超过该配额时，内核会强制中断它。
             3. 该线程被移到同优先级就绪队列的尾部。
             4. 调度器从该队列头部取出下一个同优先级线程开始执行。
         * API 控制：
             * k_sched_time_slice_set(int32_t slice, int prio): 设置时间片大小和适用的优先级阈值。

### 2.5 线程选项 (Thread Options)
通过位掩码（Options Bitmask）让线程在特定情况下获得内核的特殊处理。
- `K_ESSENTIAL`: 标记为关键线程，若该线程异常终止将导致系统崩溃（Panic）。
- `K_FP_REGS` / `K_SSE_REGS`: 允许线程使用浮点寄存器或 SSE 寄存器。
- `K_USER`: 标记线程为用户模式线程。

### 2.6 启动延迟 (Start Delay)
指定内核在启动该线程前需要等待的时间（毫秒）。
- **静态定义**: 在 `K_THREAD_DEFINE` 中指定。
- **动态创建**: 在 `k_thread_create` 中通过 `k_timeout_t` 参数传递。

### 2.7 执行模式 (Execution Mode)
决定线程运行的权限级别。
- **管理员模式 (Supervisor Mode)**: 默认模式。拥有完全的硬件访问权限，可执行特权指令。
- **用户模式 (User Mode)**: 权限受限，仅能访问被授权的内存域和内核对象。依赖 `CONFIG_USERSPACE` 宏开启。

## 3. 线程生命周期 (Lifecycle)

Zephyr 线程的生命周期包含以下状态和转换：

### 3.1 线程状态

- **New (新建)**: 线程已通过 `k_thread_create()` 创建，但尚未开始运行（例如处于启动延迟中）。
  - args： `K_NO_WAIT`,etc
- **Ready (就绪)**: 线程已准备好运行，正在等待调度器分配 CPU 时间。
- **Running (运行)**: 线程当前正在被 CPU 执行。
- **Waiting (等待)**: 线程因等待某种事件（信号量、互斥锁、睡眠时间等）而被阻塞。
  - Pending for I/O (e.g. mutex ) or Event(e.g. timeout)
- **Suspended (挂起)**: 线程被显式挂起（通过 `k_thread_suspend()`），直到被恢复（`k_thread_resume()`）前都不会参与调度。
- **Terminated (终止)**: 线程执行完毕或被异常中止。

### 3.2 关键转换

- **创建 (Creation)**: 
    - 使用 `k_thread_create()` 分配 TCB 和栈。
    - 若指定了启动延迟，线程进入 **New** 状态；否则直接进入 **Ready** 状态。
- **终止 (Termination)**:
    - 线程从其入口函数(while循环 与条件返回) 正常返回。
    - 内核会自动清理该线程，将其设为 **Terminated**。
- **中止 (Aborting)**:
    - 通过调用 `k_thread_abort()` 强行终止线程。
    - 建议谨慎使用，因为这可能导致线程持有的锁无法释放。

## 4. 开发者视角：对比 FreeRTOS

为了帮助熟悉 FreeRTOS 的开发者快速上手，以下是关键差异点：

| 特性 | Zephyr | FreeRTOS | 关键差异 |
| :--- | :--- | :--- | :--- |
| **优先级方向** | **数字越小优先级越高** | 数字越大优先级越高 | <span style="color:red">**完全相反！**</span> |
| **优先级范围** | 负数 (协作), >=0 (抢占) | 只有正数 (抢占) | Zephyr 区分协作/抢占优先级区域 |
| **TCB 分配** | 暴露结构体，可完全静态 | `xTaskCreate` (动态) / `Static` (静态) | Zephyr 默认且强烈推荐静态分配 |
| **栈定义** | `K_THREAD_STACK_DEFINE` | `StackType_t` 数组 | Zephyr 宏处理对齐和保护区域 |
| **入口参数** | 支持 3 个 (`void *p1, *p2, *p3`) | 支持 1 个 (`void *pvParam`) | Zephyr 传参更灵活 |
| **调度锁** | `k_sched_lock()` | `vTaskSuspendAll()` | 类似 |

## 5. 总结

Zephyr 的线程模型是为**安全性 (Safety)** 和**确定性 (Determinism)** 设计的。理解 `k_thread` 结构和栈对象的宏定义是深入掌握 Zephyr 内核的第一步。后续章节将详细探讨生命周期控制和调度算法的实现。
