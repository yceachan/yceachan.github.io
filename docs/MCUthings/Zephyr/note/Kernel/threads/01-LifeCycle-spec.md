---
title: 生命周期 (Lifecycle)
tags: [Zephyr, Kernel, Thread, LifeCycle ]
desc: Zephyr RTOS 线程生命周期流转deep dive
update: 2026-02-12
---

# 生命周期 (Lifecycle)

> [!note]
>
> Ref:[Threads — Zephyr Project Documentation](https://docs.zephyrproject.org/latest/kernel/services/threads/index.html#lifecycle)

## 线程创建 (Thread Creation)

线程在被使用前必须先被创建。内核负责初始化线程控制块 (thread control block) 以及栈空间 (stack portion)的一端。栈的其余部分通常保持未初始化状态。

指定 `K_NO_WAIT` 的启动延迟会指示内核立即开始执行线程。或者，也可以通过指定一个超时值 (timeout value)来指示内核延迟执行线程——例如，为了允许线程所使用的硬件设备进入就绪状态。

内核允许在线程开始执行之前取消延迟启动。如果线程已经开始执行，取消请求将不会产生任何效果。延迟启动被成功取消的线程须在重新派生 (re-spawned) 后才能再次使用。

## 线程终止 (Thread Termination)

线程一旦启动，通常会永久执行。然而，线程可以通过从其入口点函数 (entry point function)返回来同步地结束执行。这被称为终止 (termination)。

终止的线程负责在返回前释放其可能拥有的任何共享资源（例如互斥量 mutexes和动态分配的内存），因为内核不会自动回收这些资源。

在某些情况下，一个线程可能希望进入睡眠状态，直到另一个线程终止。这可以通过 `k_thread_join()` API来实现。这将阻塞调用线程，直到超时到期、目标线程自行退出，或目标线程中止（无论是由于调用了 `k_thread_abort()`还是触发了致命错误）。

一旦线程终止，内核保证不会再对该线程结构体 (thread struct)进行任何形式的访问。该结构体的内存随后可以重新用于任何目的，包括派生新线程。请注意，线程必须**完全终止**，这涉及到种竞争条件 (race conditions)：线程自身的逻辑可能会发出完成信号，而该信号在内核处理流程彻底完成之前就被另一个线程观测到了。在通常情下，应用程序应使用 `k_thread_join()` 或 `k_thread_abort()`来同步线程终止状态，而不是依赖应用程序逻辑内部发出的信号。

## 线程中止 (Thread Aborting)

线程可以通过中止 (aborting) 来异步地结束其执行。如果线程触发了致命错误（例如解引用空指针），内核会自动中止该线程。

线程也可以由另一个线程（或其自身）通过调用 `k_thread_abort()`来中止。然而，通常更倾向于向线程发送信号以使其优雅地终止自身，而不是直接中止它。

与线程终止一样，内核不会回收中止线程所拥有的共享资源。

> [!note]
>
> 内核目前不对应用程序重新派生 (respawn) 一个已中止线程的能力做出任何保证。

## 线程挂起 (Thread Suspension)

如果线程被挂起 (suspended)，可以阻止其在无限期时间内执行。函数 `k_thread_suspend()`可用于挂起任何线程，包括调用线程。挂起一个已经处于挂起状态的线程不会产生额外效果。一旦挂起，线程将无法被调度，直到另一个线程调用 `k_thread_resume()` 移除挂起状态。

> [!note]
>
> 线程可以使用 `k_sleep()`
> 在指定时间内阻止自身执行。然而，这与挂起线程不同，因为睡眠线程在时间限制到达时会自动恢复为可执行状态。