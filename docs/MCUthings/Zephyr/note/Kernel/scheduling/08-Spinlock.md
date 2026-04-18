---
title: Spinlock (自旋锁)
tags: [Zephyr, Kernel, Synchronization, SMP, ISR]
desc: 详解 Zephyr 中的自旋锁机制及其在 SMP 和中断上下文中的应用
update: 2026-02-13
---

# Spinlock (自旋锁)

> [!note]
> **Ref:** [Zephyr Kernel Services - Spinlocks](https://docs.zephyrproject.org/latest/kernel/services/synchronization/spinlocks.html)

在 Zephyr 中，`k_spinlock` 是实现 **SMP (Symmetric Multiprocessing)** 安全和 **中断上下文 (ISR)** 安全的最底层同步原语。

## 核心概念

**Spinlock (自旋锁)** 是一种忙等待 (Busy-wait) 的锁机制。
- **获取锁**: 当线程尝试获取已被占用的锁时，它不会进入睡眠状态 (Suspend/Sleep)，而是在一个紧凑的循环中不断检查 (Spinning)，直到锁被释放。
- **持有锁**: 持有锁的期间，当前 CPU 的中断通常会被禁用，以防止被同一 CPU 上的中断服务程序 (ISR) 或高优先级线程抢占。

### 为什么需要 Spinlock?

1.  **SMP (多核) 同步**:
    在多核系统中，仅仅禁用中断 (`irq_lock`) 只能防止当前 CPU 上的并发，无法防止其他 CPU 访问共享资源。Spinlock 利用原子指令 (Atomic instructions) 实现了跨 CPU 的互斥。
2.  **中断上下文安全**:
    互斥量 (`k_mutex`) 和信号量 (`k_sem`) 在等待时可能会导致线程睡眠，因此**严禁**在中断服务程序 (ISR) 中使用。Spinlock 不会睡眠，因此可以在 ISR 中安全使用。
3.  **极短的临界区**:
    对于非常短的代码片段 (例如修改一个链表指针)，上下文切换 (Context Switch) 的开销远大于忙等待的开销。此时 Spinlock 效率更高。

## 实现机制 (SMP vs UP)

Zephyr 的 `k_spinlock` 根据配置 (`CONFIG_SMP`) 有不同的表现：

| 特性 | 单核 (Uniprocessor, UP) | 多核 (SMP) |
| :--- | :--- | :--- |
| **底层实现** | 退化为 `irq_lock()` (仅关中断) | 原子变量 CAS + 关中断 |
| **CPU 行为** | 并不真正 "Spin" (因为没别的核来竞争) | 若锁被占，当前核循环等待 |
| **中断状态** | 获取锁时 **必须** 关中断 | 获取锁时 **必须** 关中断 |

> **注意**: 无论是在 UP 还是 SMP 模式下，`k_spin_lock` 都会禁用当前 CPU 的中断。这是为了防止持有锁的线程/ISR 被抢占，从而避免死锁 (Deadlock) 或优先级反转。

## API 用法

Zephyr 提供了简单且安全的 API。最常用的是 `k_spin_lock` 和 `k_spin_unlock`。

```c
#include <zephyr/spinlock.h>

// 1. 定义一个自旋锁实例 (通常是全局或结构体成员)
static struct k_spinlock my_lock;

void critical_function(void)
{
    k_spinlock_key_t key;

    // 2. 获取锁
    // - 禁用当前 CPU 中断
    // - 在 SMP 上，如果锁被占，则自旋等待
    // - 返回的 key 保存了原本的中断状态 (用于恢复)
    key = k_spin_lock(&my_lock);

    /* --- 临界区 (Critical Section) 开始 --- */
    
    // 执行受保护的操作
    // 注意：这里绝对不能调用任何可能导致睡眠的 API (如 k_sleep, k_mutex_lock)
    // 也要保持代码尽可能短小精悍
    shared_resource++;

    /* --- 临界区 结束 --- */

    // 3. 释放锁
    // - 解除自旋状态
    // - 恢复之前的中断状态 (根据 key)
    k_spin_unlock(&my_lock, key);
}
```

### 动态初始化

如果 `k_spinlock` 是动态分配结构体的一部分，不需要特殊的初始化函数，只需确保内存被清零即可 (Zero-initialized)。

## 关键原则 (Best Practices)

1.  **绝不睡眠 (NEVER Sleep)**:
    在持有 Spinlock 期间，**绝对禁止** 调用任何会导致线程挂起、睡眠或让出 CPU 的 API。这包括 `k_sleep`, `k_mutex_lock`, `k_sem_take` (带超时) 等。
    *原因*:如果在持有锁时睡眠，其他等待该锁的 CPU 将无限自旋，导致系统死锁 (Live-lock/Deadlock)。

2.  **保持极短 (Keep it Short)**:
    临界区代码应尽可能短。长时间持有 Spinlock 会导致：
    - 中断延迟增加 (因为中断被禁用了)。
    - 其他 CPU 浪费算力在自旋上。

3.  **避免递归**:
    标准的 `k_spin_lock` **不是递归的**。如果同一 CPU 再次尝试获取已持有的锁，会导致死锁 (在 UP 上可能只是掩盖问题，但在 SMP 上是灾难性的)。如果需要递归语义，需小心设计或使用特定的递归锁实现 (通常不推荐)。

4.  **ISR 安全**:
    Spinlock 是少数几个可以在 ISR 和线程之间共享的同步原语。
