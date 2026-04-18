---
title: Tickless Idle Deep Dive (Tickless 与低功耗深度解析)
tags: [Zephyr, Kernel, PM, Tickless, Idle]
desc: 解析 Zephyr 如何在空闲时通过 Tickless 机制减少硬件中断，并配合 PM 子系统实现深度睡眠与时间补偿。
update: 2026-02-25
---

# Tickless Idle Deep Dive (Tickless 与低功耗深度解析)

> [!note]
> **Ref:**
> - Local Source: `sdk/source/zephyr/kernel/idle.c`
> - Local Source: `sdk/source/zephyr/kernel/timeout.c`
> - Official Doc: [Tickless Idle](https://docs.zephyrproject.org/latest/kernel/services/timing/clocks.html#tickless-idle)

Tickless 是现代 RTOS 实现低功耗的核心技术。Zephyr 通过将内核超时队列与硬件定时器驱动紧密耦合，实现了极致的“按需唤醒”。

## 1. 为什么需要 Tickless？

在传统的 Tick 模式下，即使系统没有任何任务处理，CPU 也会被周期性的滴答中断（如每 1ms）唤醒。这会产生两个问题：
1.  **功耗控制**: CPU 无法长时间进入深睡眠状态。
2.  **吞吐量**: 中断处理占用了额外的 CPU 周转周期。

## 2. Tickless 的工作流

当系统进入空闲（Idle）状态时，流程如下：

1.  **Idle 线程运行**: 当 Ready Queue 中没有其他线程时，内核切换到 `idle` 线程。
2.  **查询截止日期**: `idle` 线程调用 `z_get_next_timeout_expiry()`。
    *   这个函数会查看 `timeout_list` 链表的首节点。
    *   计算出距离最近一个定时器到期还有多少滴答 (`ticks`)。
3.  **决策睡眠时长**: 
    *   内核将这个 `ticks` 值交给电源管理 (PM) 子系统。
    *   PM 子系统根据这个时长决定进入哪种睡眠等级（如 Light Sleep, Deep Sleep）。
4.  **重新编程定时器**: 
    *   内核调用驱动接口 `sys_clock_set_timeout(ticks, true)`。
    *   硬件定时器（如 nRF 的 RTC 或 ARM Systick）被设置为在 `ticks` 时间后触发下一次中断，而不是在 1ms 后。
5.  **进入睡眠**: CPU 执行 `WFI` (Wait For Interrupt) 指令进入休眠。

## 3. 唤醒与时间补偿

当硬件中断触发或外部异步中断（如 GPIO）发生时，CPU 被唤醒：

1.  **异步唤醒**: 如果在预定时间之前被外部中断唤醒，硬件定时器驱动会通过 `sys_clock_elapsed()` 计算出实际经过的时间。
2.  **时间公告**: 驱动调用 `sys_clock_announce(actual_ticks)`。
3.  **内核更新**: 内核根据 `actual_ticks` 更新 `curr_tick` 并处理到期的超时对象。

## 4. 关键函数剖析

### `z_get_next_timeout_expiry()`
位于 `kernel/timeout.c`：
```c
int32_t z_get_next_timeout_expiry(void)
{
    int32_t ret = (int32_t) K_TICKS_FOREVER;
    K_SPINLOCK(&timeout_lock) {
        ret = next_timeout(elapsed());
    }
    return ret;
}
```
它利用 Delta List 的特性，直接获取链表头部的 `dticks`，并减去当前已经流逝但尚未公告的时间 (`elapsed()`)，得到精确的剩余等待时间。

## 5. 总结

| 特性 | 传统 Tick 模式 | Tickless 模式 |
| :--- | :--- | :--- |
| **中断频率** | 固定频率（如 1000Hz） | 按需触发（变量频率） |
| **空闲功耗** | 高（频繁唤醒） | 极低（长时间深睡） |
| **时间精度** | 依赖 Tick 粒度 | 依赖硬件定时器分辨率 |
| **适用场景** | 简单系统、无低功耗要求 | 电池供电、高性能 IoT 设备 |

Zephyr 的 Tickless 机制是其作为“高性能微内核”竞争力的重要组成部分，通过将调度策略与底层硬件驱动解耦，实现了功耗与精度的平衡。
