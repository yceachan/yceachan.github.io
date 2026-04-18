---
title: Zephyr 设备驱动模型 (Device Driver Model)
tags: [Zephyr, Driver, Kernel, API]
desc: 深入解析 Zephyr 的设备驱动抽象模型、初始化流程及系统调用机制
update: 2026-02-10
---

# Zephyr 设备驱动模型 (Device Driver Model)

> [!note]
> **Ref:** [Zephyr Docs - Device Driver Model](https://docs.zephyrproject.org/latest/kernel/drivers/index.html)

Zephyr 提供了一套统一的设备驱动模型，旨在标准化驱动的配置、初始化以及 API 调用方式。该模型将驱动抽象为“对象”，通过统一的 `struct device` 结构体进行管理，实现了应用层与硬件层的解耦。

## 1. 核心架构 (Core Architecture)

驱动模型的核心思想是将所有设备视为内核对象，并在编译时（Build Time）和运行时（Runtime）分别维护不同的数据结构。

![Device Driver Model](https://docs.zephyrproject.org/latest/_images/device_driver_model.svg)
*(图示来源: Zephyr Project Documentation)*

### 1.1 `struct device` 详解
每一个驱动实例都由一个 `struct device` 结构体表示，它包含三个关键部分：

| 成员 | 存储位置 | 描述 |
| :--- | :--- | :--- |
| **`config`** | ROM (Flash) | **只读配置数据**。在编译时生成，包含物理地址 (MMIO base)、中断号 (IRQ lines)、时钟频率等固定硬件信息。 |
| **`data`** | RAM | **运行时数据**。用于存储驱动的状态信息，如引用计数、信号量、缓存区 (Scratch buffers) 等。 |
| **`api`** | ROM (Flash) | **API 函数指针表**。指向驱动具体实现的函数表（如 `uart_driver_api`），实现了通用子系统 API 到特定硬件驱动的映射。 |

> **详细定义**: [Driver Data Structures](https://docs.zephyrproject.org/latest/kernel/drivers/index.html#driver-data-structures)

## 2. 初始化机制 (Initialization Levels)

Zephyr 采用分级初始化机制，确保驱动按照依赖关系顺序加载。`DEVICE_DEFINE()` 宏允许指定初始化级别和优先级。

### 2.1 初始化等级 (Levels)
| 等级 | 描述 | 适用场景 |
| :--- | :--- | :--- |
| **`PRE_KERNEL_1`** | 内核服务未就绪，仅运行在中断栈。 | 无依赖的基础硬件（如时钟、中断控制器）。不可使用内核服务（信号量、互斥锁）。 |
| **`PRE_KERNEL_2`** | 内核服务未就绪，依赖 `PRE_KERNEL_1` 设备。 | 依赖基础硬件的设备。不可使用内核服务。 |
| **`POST_KERNEL`** | 内核已初始化，运行在内核主线程上下文。 | 需要使用内核服务（如 `k_sem`）的复杂设备（如 I2C 传感器、网络设备）。 |

> **优先级 (Priority)**: 在同一等级内，通过 0-99 的整数决定顺序（越小越早）。
> **原文链接**: [Initialization Levels](https://docs.zephyrproject.org/latest/kernel/drivers/index.html#initialization-levels)

### 2.2 延迟初始化 (Deferred Initialization)
通过在设备树 (DTS) 中添加 `zephyr,deferred-init` 属性，可以阻止内核自动初始化该设备。应用层需手动调用 `device_init()` 来启动设备。

## 3. 子系统 API 与系统调用 (Subsystems & Syscalls)

### 3.1 通用子系统 API
大多数驱动实现了标准的子系统 API（如 UART, SPI, GPIO）。应用层代码通过 `device.h` 提供的通用接口调用，而不直接依赖特定驱动实现。

```c
/* 应用层调用通用 API */
uart_poll_out(dev, 'A'); 

/* 内核通过 API 指针表路由到具体驱动 */
static inline int uart_poll_out(const struct device *dev, unsigned char out_char) {
    const struct uart_driver_api *api = (const struct uart_driver_api *)dev->api;
    return api->poll_out(dev, out_char);
}
```

### 3.2 用户模式与系统调用 (User Mode)
如果开启了用户模式 (`CONFIG_USERSPACE`)，驱动 API 需要通过系统调用 (`__syscall`) 暴露给用户线程。

*   **Supervisor-only API**: 仅在内核模式下可见。
*   **System Call API**: 通过 `z_impl_` (实现) 和 `z_vrfy_` (校验) 机制，安全地穿越内核边界。

> **原文链接**: [Device-Specific API Extensions](https://docs.zephyrproject.org/latest/kernel/drivers/index.html#device-specific-api-extensions)

## 4. 内存映射 (Memory Mapping)

对于 MMIO（内存映射 I/O）设备，Zephyr 提供了 `DEVICE_MMIO` 宏系列来处理物理地址到虚拟地址的映射（特别是在有 MMU 的系统上）。

*   **`DEVICE_MMIO_ROM` / `RAM`**: 在驱动结构体中预留空间。
*   **`DEVICE_MMIO_MAP()`**: 在驱动初始化函数中建立映射。

> **原文链接**: [Memory Mapping](https://docs.zephyrproject.org/latest/kernel/drivers/index.html#memory-mapping)

## 5. 关键宏 (Key Macros)

*   `DEVICE_DEFINE(...)`: 定义并注册一个设备驱动。
*   `DEVICE_GET(name)`: 通过名称获取设备指针。
*   `DEVICE_API_GET(subsystem, dev)`: 获取设备的 API 结构体指针。
*   `SYS_INIT(...)`: 仅运行初始化函数，不创建设备对象（用于系统级设置）。

---
**总结**: Zephyr 的驱动模型通过**编译时配置**与**分级初始化**保证了系统的高效启动，同时通过**统一的 API 抽象**和**系统调用机制**保证了应用的可移植性与安全性。
