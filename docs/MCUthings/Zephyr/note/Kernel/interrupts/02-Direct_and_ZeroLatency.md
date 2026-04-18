---
title: Direct ISR & Zero Latency Interrupts
tags: [Zephyr, Kernel, ISR, Latency, ZLI]
desc: 深入探讨 Zephyr 中的直接中断 (Direct ISR) 与零延迟中断 (Zero Latency Interrupts)
update: 2026-02-13
---

# Direct ISR & Zero Latency Interrupts

> [!note]
> **Ref:** [Interrupts - Direct ISRs](docs/kernel/services/interrupts.rst#defining-a-direct-isr)

在对延迟极其敏感的场景下，Zephyr 提供了比常规 ISR 更底层的机制：**Direct ISR** 和 **Zero Latency Interrupts (ZLI)**。

## 1. Direct ISR (直接中断)

常规 ISR 会经过内核的软件中断表查找和一些通用的记账 (Bookkeeping) 工作，这会产生一定的开销。Direct ISR 允许中断直接跳转到处理函数。

### 特点
- **极低开销**: 绕过了内核的软件中断分发器。
- **无参数**: 与常规 ISR 不同，Direct ISR **不接受任何参数** (`void *arg`)。
- **手动调度**: 常规 ISR 结束时内核会自动决定是否重新调度。Direct ISR 必须手动返回一个值来告知内核是否需要调度。

### 实现示例
```c
ISR_DIRECT_DECLARE(my_direct_isr)
{
    // 执行紧急硬件操作
    do_hardware_magic();

    /* 如果系统处于空闲状态，可能需要恢复电源管理状态 */
    ISR_DIRECT_PM(); 

    /* 返回 1 表示需要触发内核重新调度检查，返回 0 则不检查 */
    return 1; 
}

void install(void) {
    IRQ_DIRECT_CONNECT(MY_IRQ, MY_PRIO, my_direct_isr, 0);
    irq_enable(MY_IRQ);
}
```

## 2. Zero Latency Interrupts (零延迟中断 - ZLI)

在某些架构（如 ARM Cortex-M）上，即使使用了 `irq_lock()`，内核仍然可以允许某些最高优先级的中断不被屏蔽。这就是 **Zero Latency Interrupts**。

### 核心特性
- **不可屏蔽性**: 即使线程调用了 `irq_lock()`，ZLI 依然可以触发。这确保了绝对确定的响应时间。
- **配置**: 需开启 `CONFIG_ZERO_LATENCY_IRQS`。
- **严格限制**:
    - **必须** 声明为 Direct ISR。
    - **严禁** 调用任何内核 API（因为 ZLI 会在内核处于临界区时触发，调用 API 会破坏内核内部状态）。
    - **不应** 使用 `ISR_DIRECT_PM()`，因为它涉及内核数据访问。
    - 返回值必须始终为 `0`（不允许在 ZLI 中触发调度）。

### 使用场景
- 电机控制、高速采样等对抖动 (Jitter) 零容忍的场景。

---

# Atomic Services (原子服务)

> [!note]
> **Ref:** [Atomic Services](docs/kernel/services/other/atomic.rst)

当 ISR 需要与线程共享简单的状态（如计数器、标志位）时，**Atomic Services** 是比 `k_spinlock` 或禁用中断更高效的选择。

## 核心 API
- `atomic_t`: 原子变量类型（32位或64位，取决于架构）。
- `atomic_inc()`, `atomic_dec()`: 原子增减。
- `atomic_set_bit()`, `atomic_clear_bit()`: 原子位操作。
- `atomic_cas()`: 比较并交换 (Compare-and-Swap)。

## 优势
- **无锁**: 无需禁用中断，利用 CPU 硬件指令保证原子性。
- **跨核安全**: 在 SMP 系统上自动处理内存屏障 (Memory Barrier)，确保多核一致性。

```c
atomic_t data_ready = ATOMIC_INIT(0);

// 在 ISR 中
void my_isr(void *arg) {
    atomic_set(&data_ready, 1); // 原子设置
}

// 在线程中
void my_thread(void) {
    if (atomic_cas(&data_ready, 1, 0)) {
        // 只有当 data_ready 为 1 时才执行，并原子地重置为 0
        process_data();
    }
}
```
