---
title: Zephyr Kernel Thread API Reference
tags: [Zephyr, Kernel, Thread, API]
desc: Reference guide for essential Zephyr kernel thread management APIs.
update: 2026-02-12
---

# Zephyr Kernel Thread API Reference

> [!note]
> **Ref:** [Zephyr Thread APIs](https://docs.zephyrproject.org/latest/doxygen/html/group__thread__apis.html)

## Thread Creation & Termination

### `k_thread_create`

Initializes a thread and schedules it for execution.

```c
k_tid_t k_thread_create(struct k_thread *new_thread, k_thread_stack_t *stack,
                        size_t stack_size, k_thread_entry_t entry,
                        void *p1, void *p2, void *p3,
                        int prio, uint32_t options, k_timeout_t delay);
```

- **Parameters:**
    - `new_thread`: Pointer to uninitialized struct k_thread.
    - `stack`: Pointer to the stack space.
    - `stack_size`: Stack size in bytes.
    - `entry`: Thread entry function.
    - `p1`, `p2`, `p3`: Entry point parameters.
    - `prio`: Thread priority.
    - `options`: Thread options.
    - `delay`: Scheduling delay (e.g., `K_NO_WAIT`).
- **Returns:** ID of the new thread.

### `k_thread_abort`

Aborts a thread.

```c
void k_thread_abort(k_tid_t thread);
```

- **Parameters:**
    - `thread`: ID of thread to abort.

## Thread Suspension & Resumption

### `k_thread_suspend`

Suspends a thread.

```c
void k_thread_suspend(k_tid_t thread);
```

- **Parameters:**
    - `thread`: ID of thread to suspend.

### `k_thread_resume`

Resumes a suspended thread.

```c
void k_thread_resume(k_tid_t thread);
```

- **Parameters:**
    - `thread`: ID of thread to resume.

## Thread Scheduling

### `k_sleep`

Put the current thread to sleep.

```c
int32_t k_sleep(k_timeout_t timeout);
```

- **Parameters:**
    - `timeout`: Duration to sleep.
- **Returns:** Zero if requested time has elapsed or remaining time if woken up.

### `k_wakeup`

Wake up a sleeping thread.

```c
void k_wakeup(k_tid_t thread);
```

- **Parameters:**
    - `thread`: ID of thread to wake.

## Thread Synchronization

### `k_thread_join`

Sleep until a thread exits.

```c
int k_thread_join(struct k_thread *thread, k_timeout_t timeout);
```

- **Parameters:**
    - `thread`: Thread to wait for.
    - `timeout`: Waiting period.
- **Returns:** 0 on success, negative errno on failure (e.g., `-EBUSY`, `-EAGAIN`).

## Miscellaneous

### `k_thread_name_set`

Set the thread name.

```c
int k_thread_name_set(k_tid_t thread, const char *str);
```

- **Parameters:**
    - `thread`: Thread ID (or NULL for current).
    - `str`: Name string.
- **Returns:** 0 on success, negative errno on failure.
