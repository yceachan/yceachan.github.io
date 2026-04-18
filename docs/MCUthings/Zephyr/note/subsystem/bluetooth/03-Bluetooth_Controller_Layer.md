---
title: Zephyr 蓝牙控制器层 (Controller Layer) 架构剖析
tags: [Zephyr, Subsystem, Bluetooth, BLE, Controller, Link Layer, ULL, LLL, Mayfly]
desc: 深入解析 Zephyr 蓝牙低功耗控制器 (LE Controller) 的软件架构，包括 ULL/LLL 分层设计、Ticker 调度器以及 Mayfly 跨上下文执行机制。
update: 2026-02-26
---

# Zephyr 蓝牙控制器层 (Controller Layer) 架构剖析

> [!note]
> **Ref:** [Zephyr LE Controller Architecture](https://docs.zephyrproject.org/latest/connectivity/bluetooth/bluetooth-ctlr-arch.html)
> **Source:** `$ZEPHYR_BASE/doc/connectivity/bluetooth/bluetooth-ctlr-arch.rst`

在 Zephyr 的蓝牙协议栈中，Controller（控制器层）负责实现底层的**链路层 (Link Layer, LL)**。由于无线电通信对时间极度敏感，Controller 层通常是一个高度优化的软实时系统 (Soft Real-Time System)。

## 1. Controller 核心组件总览

Zephyr 的软件 Link Layer (LL_SW) 主要由以下几个关键模块构成：

1. **HCI (主机控制器接口)**
   - 负责与 Host 层的双向通信。在单芯片模式下通过 Zephyr 内部驱动完成；在双芯片模式下通过 UART/SPI 等物理层传输。
2. **HAL (硬件抽象层)**
   - 将蓝牙 Controller 的核心逻辑与具体厂商的物理无线电硬件（如 Nordic nRF 系列的外设：TIMER, PPI, RADIO 等）隔离。
3. **Ticker (滴答调度器)**
   - 一个软实时的无线电/资源调度器，负责高精度的微秒级事件调度和时间片分配。
4. **LL_SW (软件链路层实体)**
   - 实现了蓝牙规范中的状态和角色、控制过程 (Control Procedures) 以及数据包控制逻辑。
5. **Util (底层工具库)**
   - 包含针对裸机环境优化的无锁内存池 (Memory Pool)、FIFO/MemQ，以及极具特色的 **Mayfly 延迟 ISR 执行机制**。

## 2. 链路层的两层拆分：ULL 与 LLL

为了兼顾“硬实时的射频收发”与“复杂的链路层协议状态机”，Zephyr 的 Link Layer 在内部被划分为上下两层，运行在不同的执行上下文中：

### 2.1 Lower Link Layer (LLL, 下半链路层)
- **职责**: 直接操作无线电硬件 (Radio Hardware)、设置射频收发参数、完成微秒级的 Tx/Rx 切换（如 tIFS 时序）。
- **执行上下文**: 运行在**最高优先级的硬件中断 (Vendor ISR)** 中。它的执行时间极短，一旦射频动作完成或准备就绪，就会将繁重的协议处理推迟到 ULL。

### 2.2 Upper Link Layer (ULL, 上半链路层)
- **职责**: 处理链路层控制协议 (LLCP)、数据包拆包/组包、加密/解密、角色管理（如维持连接参数、处理更新请求等）。
- **执行上下文**: 运行在 **Mayfly ISR** 概念中（即低优先级的软件中断/工作队列机制中）。

## 3. 核心机制设计

### 3.1 Mayfly 执行上下文
**Mayfly** 是 Zephyr Controller 中的一个核心概念：它之于 ISR，就如同 Workqueue 之于 Thread。
- 它是一个可扩展的多实例 ISR 执行上下文，专门用于安排要在较低优先级中断中执行的函数列表。
- 采用无锁 (Lock-less) 设计，允许在不同的执行上下文（从硬中断到软中断）之间进行安全、高效的跨层调度，并遵循“竞态空闲 (Race-to-idle)”的执行策略。

### 3.2 优先级天梯 (Execution Priorities)
整个 Controller 和 Host 遵循着严格的优先级梯队设计，以确保射频硬件永不挨饿：
1. **最高**: LLL (Vendor ISR) - 硬中断处理射频事件。
2. **中等**: ULL (Mayfly ISR) - 软中断处理链路层逻辑 (如事件准备、Tx 请求处理)。
   - *细节：Event handle < Event prep < Event/Rx done < Tx request < Role management*
3. **最低**: Host (Kernel Thread) - 位于最上层的内核线程处理 L2CAP/GATT 及应用逻辑。

### 3.3 Link Layer 控制过程 (LLCP)
ULL 处理大量的链路层控制过程（例如连接参数更新、PHY 更新、信道映射更新等）。
- 拥有独立的**本地 (Local)**和**远端 (Remote)**请求状态机。
- 数据结构主要基于 `struct llcp_struct`（附属于每个 connection 对象）和 `struct proc_ctx`（具体的 procedure 上下文）。
- Zephyr 专门编写了大量的 ZTEST 单元测试模块，通过 Mock (模拟) RX/TX 节点的方式，在不依赖真实硬件的情况下测试 LLCP 状态机的健壮性。

## 4. 总结
Zephyr 的 Controller 并非简单的裸机大循环，而是一个精巧的非抢占/抢占混合调度系统。通过 **Ticker** 掌控全局时序，利用 **LLL 抢占式硬中断** 保证射频严格对齐，再通过无锁的 **Mayfly 软中断** 卸载 **ULL** 的协议栈重担，最终与底层的线程级 Host 完美集成。这种设计使其能在资源极其受限的单片机上，依然提供工业级的低延迟蓝牙响应能力。