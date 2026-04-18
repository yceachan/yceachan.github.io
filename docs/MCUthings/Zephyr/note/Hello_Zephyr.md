---
title: Zephyr RTOS 简介 (Introduction)
tags: [Zephyr, RTOS, Introduction, Translation]
desc: Zephyr 项目官方介绍文档的逐字逐句翻译 (Word-to-Word Translation)
update: 2026-02-10
---

# 简介 (Introduction)

> [!note]
> **Ref:** [Introduction — Zephyr Project Documentation](https://docs.zephyrproject.org/latest/introduction/index.html)

Zephyr OS 基于一个小型内核 (small-footprint kernel)，专为资源受限和嵌入式系统设计：从简单的嵌入式环境传感器和 LED 可穿戴设备，到复杂的嵌入式控制器、智能手表和物联网无线应用。

Zephyr 内核支持多种架构，包括：

*   ARCv2 (EM 和 HS) 和 ARCv3 (HS6X)
*   ARMv6-M, ARMv7-M, 和 ARMv8-M (Cortex-M)
*   ARMv7-A 和 ARMv8-A (Cortex-A, 32位和64位)
*   ARMv7-R, ARMv8-R (Cortex-R, 32位和64位)
*   Intel x86 (32位和64位)
*   MIPS (MIPS32 Release 1 规范)
*   Renesas RX
*   RISC-V (32位和64位)
*   SPARC V8
*   Tensilica Xtensa

基于这些架构的完整支持板卡列表可以在 [这里](https://docs.zephyrproject.org/latest/boards/index.html) 找到。

在 Zephyr OS 的语境下，**子系统 (subsystem)** 指的是操作系统中处理特定功能或提供特定服务的逻辑上独立的部分。子系统可以包括网络、文件系统、设备驱动类、电源管理和通信协议等组件。每个子系统都被设计为模块化的，并且可以被配置、定制和扩展，以满足不同嵌入式应用的需求。

## 许可 (Licensing)

Zephyr 使用宽松的 **Apache 2.0 许可证** (如项目 GitHub 仓库中的 LICENSE 文件所示)。Zephyr 项目中有一些导入或复用的组件使用了其他许可证，详情请见 [Zephyr 项目组件的许可](https://docs.zephyrproject.org/latest/introduction/licensing.html)。

## 显著特性 (Distinguishing Features)

Zephyr 提供了大量且不断增长的特性，包括：

### 广泛的内核服务套件 (Extensive suite of Kernel services)

Zephyr 为开发提供了许多熟悉的服务：

*   **多线程服务 (Multi-threading Services)**：支持协作式、基于优先级的、非抢占式和抢占式线程，并可选时间片轮转 (round robin time-slicing)。包含 POSIX pthreads 兼容 API 支持。
*   **中断服务 (Interrupt Services)**：用于编译时注册中断处理程序。
*   **内存分配服务 (Memory Allocation Services)**：用于动态分配和释放固定大小或可变大小的内存块。
*   **线程间同步服务 (Inter-thread Synchronization Services)**：支持二进制信号量、计数信号量和互斥信号量。
*   **线程间数据传递服务 (Inter-thread Data Passing Services)**：支持基本消息队列、增强型消息队列和字节流。
*   **电源管理服务 (Power Management Services)**：如全局的、应用或策略定义的系统电源管理，以及细粒度的、驱动定义的设备电源管理。

### 多种调度算法 (Multiple Scheduling Algorithms)

Zephyr 提供了一套全面的线程调度选择：

*   协作式和抢占式调度
*   最早截止时间优先 (EDF)
*   元 IRQ 调度 (Meta IRQ scheduling)：“interrupt bottom half” or “tasklet” behavior
*   时间片 (Timeslicing)：在同优先级的可抢占线程之间启用时间片
*   多种排队策略：
    *   简单链表就绪队列
    *   红黑树就绪队列
    *   传统多队列就绪队列

### 高度可配置 / 模块化灵活性 (Highly Configurable / Modular for flexibility)

允许应用程序仅包含其需要的功能，并在需要时指定其数量和大小。

### 跨架构 (Cross Architecture)

支持各种不同 CPU 架构和开发工具的板卡。贡献者们不断增加对更多 SoC、平台和驱动程序的支持。

### 内存保护 (Memory Protection)

在 x86, ARC, 和 ARM 架构、用户空间和内存域上，实现了可配置的特定于架构的栈溢出保护、内核对象和设备驱动权限跟踪，以及带有线程级内存保护的线程隔离。

对于没有 MMU/MPU 的平台和内存受限设备，支持将特定于应用程序的代码与自定义内核组合，创建一个在系统硬件上加载和执行的单体镜像 (monolithic image)。应用程序代码和内核代码都在同一个共享地址空间中执行。

### 编译时资源定义 (Compile-time resource definition)

允许在编译时定义系统资源，这减少了代码大小并提高了资源受限系统的性能。

### 优化的设备驱动模型 (Optimized Device Driver Model)

为配置作为平台/系统一部分的驱动程序提供了一致的设备模型，为初始化系统中配置的所有驱动程序提供了一致的模型，并允许在具有通用设备/IP 块的平台之间重用驱动程序。

### 设备树支持 (Devicetree Support)

使用设备树来描述硬件。来自设备树的信息用于创建应用程序镜像。

### 原生网络堆栈支持多种协议 (Native Networking Stack supporting multiple protocols)

网络支持功能齐全且经过优化，包括 LwM2M 和 BSD 套接字兼容支持。还提供了 OpenThread 支持 (在 Nordic 芯片组上) —— 一种旨在安全可靠地连接家庭中数百种产品的网状网络。

### 蓝牙低功耗 5.0 支持 (Bluetooth Low Energy 5.0 support)

符合蓝牙 5.0 标准 (ESR10) 和蓝牙低功耗控制器支持 (LE 链路层)。包括蓝牙 Mesh 和蓝牙认证就绪的蓝牙控制器。

*   通用访问配置文件 (GAP)：支持所有可能的 LE 角色
*   通用属性配置文件 (GATT)
*   配对支持：包括来自蓝牙 4.2 的安全连接功能
*   清晰的 HCI 驱动抽象
*   原始 HCI 接口：作为控制器运行 Zephyr，而不是完整的主机堆栈
*   通过多个流行控制器的验证
*   高度可配置
*   Mesh 支持：
    *   中继、友邻节点、低功耗节点 (LPN) 和 GATT 代理功能
    *   支持两种配网承载 (PB-ADV & PB-GATT)
    *   高度可配置，适用于至少 16k RAM 的设备

### 原生 Linux, macOS, 和 Windows 开发 (Native Linux, macOS, and Windows Development)

一个命令行 CMake 构建环境，运行在流行的开发者操作系统上。原生端口 (native_sim) 允许您在 Linux 上构建并运行 Zephyr 作为原生应用程序，从而辅助开发和测试。

### 虚拟文件系统接口 (Virtual File System Interface)

支持 ext2, FatFs, 和 LittleFS；FCB (Flash Circular Buffer) 用于内存受限的应用。

### 强大的多后端日志框架 (Powerful multi-backend logging Framework)

支持日志过滤、对象转储、恐慌模式、多种后端 (内存、网络、文件系统、控制台…) 以及与 Shell 子系统的集成。

### 用户友好且功能齐全的 Shell 接口 (User friendly and full-featured Shell interface)

一个多实例 Shell 子系统，具有用户友好的特性，如自动补全、通配符、着色、元键 (箭头、退格、ctrl+u 等) 和历史记录。支持静态命令和动态子命令。

### 非易失性存储上的设置 (Settings on non-volatile storage)

设置 (settings) 子系统为模块提供了一种存储持久的每设备配置和运行时状态的方法。设置项以键值对字符串的形式存储。

### 非易失性存储 (NVS)

NVS 允许存储二进制 blob、字符串、整数、长整数以及它们的任意组合。

### 原生端口 (Native port)

Native sim 允许将 Zephyr 作为 Linux 应用程序运行，支持各种子系统和网络。

### 社区支持 (Community Support)

社区支持通过邮件列表和 Discord 提供；详情见下方的资源。

## 资源 (Resources)

以下是资源的快速摘要，帮助您找到方向：

### 入门 (Getting Started)

*   📖 [Zephyr 文档](https://docs.zephyrproject.org/latest/index.html)
*   🚀 [入门指南](https://docs.zephyrproject.org/latest/develop/getting_started/index.html)
*   🙋🏽 [寻求帮助时的提示](https://docs.zephyrproject.org/latest/develop/getting_started/index.html#asking-for-help)
*   💻 [代码示例](https://docs.zephyrproject.org/latest/samples/index.html)

### 代码与开发 (Code and Development)

*   🌐 [源代码仓库](https://github.com/zephyrproject-rtos/zephyr)
*   📦 [发布版本](https://github.com/zephyrproject-rtos/zephyr/releases)
*   🤝 [贡献指南](https://docs.zephyrproject.org/latest/contribute/index.html)

### 社区与支持 (Community and Support)

*   💬 [Discord 服务器](https://discord.gg/zephyrproject)：用于实时社区讨论
*   📧 用户邮件列表 (users@lists.zephyrproject.org)
*   📧 开发者邮件列表 (devel@lists.zephyrproject.org)
*   📬 [其他项目邮件列表](https://lists.zephyrproject.org/g/main/subgroups)
*   📚 [项目 Wiki](https://github.com/zephyrproject-rtos/zephyr/wiki)

### 问题追踪与安全 (Issue Tracking and Security)

*   🐛 [GitHub Issues](https://github.com/zephyrproject-rtos/zephyr/issues)
*   🔒 [安全文档](https://docs.zephyrproject.org/latest/security/index.html)
*   🛡️ [安全公告仓库](https://github.com/zephyrproject-rtos/zephyr/security/advisories)
*   ⚠️ 报告安全漏洞请发送至 vulnerabilities@zephyrproject.org

### 附加资源 (Additional Resources)

*   🌐 [Zephyr 项目网站](https://www.zephyrproject.org/)
*   📺 [Zephyr 技术讲座](https://www.youtube.com/c/ZephyrProject)

## 基本术语和概念 (Fundamental Terms and Concepts)

参见 [术语表](https://docs.zephyrproject.org/latest/glossary.html)
