---
title: Zephyr Logging (LOG) 子系统详解
tags: [zephyr, logging, debug, subsystem]
update: 2026-02-09

---

# Zephyr Logging (LOG) 子系统详解

Zephyr 提供了一个功能强大且高度可定制的日志（Logging）子系统。它不仅是简单的 `printf` 替代品，而是一个支持分级控制、异步处理和多种输出后端（UART, RTT, 网络等）的工业级调试工具。

## 1. 核心特性

- **分级过滤**：支持 4 个标准日志级别（Error, Warning, Info, Debug），可按模块、按实例进行独立控制。
- **延迟处理 (Deferred Mode)**：默认模式。日志在调用处被放入环形缓冲区，由低优先级的后台线程进行处理和输出。**优点**：对高优先级线程（如中断服务、实时任务）的干扰极小。
- **同步/立即模式 (Immediate Mode)**：日志直接在调用处输出。**优点**：适合死机前的最后信息捕捉；**缺点**：严重影响实时性。
- **模块化管理**：每个源文件可以定义自己的日志模块名，方便过滤。

## 2. 日志级别

| 级别 | 宏定义 | 说明 |
| :--- | :--- | :--- |
| **NONE** | `LOG_ERR`, `LOG_WRN` 等不输出 | 彻底禁用该模块日志 |
| **ERROR** | `LOG_ERR(...)` | 严重错误，系统可能无法继续 |
| **WARNING** | `LOG_WRN(...)` | 异常情况，但系统可继续运行 |
| **INFO** | `LOG_INF(...)` | 关键状态变更、启动信息等 |
| **DEBUG** | `LOG_DBG(...)` | 详细调试信息（生产版本通常禁用） |

## 3. 代码中使用步骤

### 第一步：引入头文件
```c
#include <zephyr/logging/log.h>
```

### 第二步：注册模块
在每个 `.c` 文件的顶层（所有函数之外）注册日志模块：
```c
LOG_MODULE_REGISTER(my_app, LOG_LEVEL_INF); // 模块名为 my_app，默认级别为 Info
```

### 第三步：调用宏打印
```c
void my_function(void) {
    LOG_INF("System started on %s", CONFIG_BOARD);
    int ret = do_something();
    if (ret < 0) {
        LOG_ERR("Failed with error: %d", ret);
    }
}
```

## 4. 关键 Kconfig 配置 (`prj.conf`)

要启用日志子系统，必须在工程配置中开启：

```properties
# 启用日志子系统
CONFIG_LOG=y

# 选择输出模式（默认是延迟模式，建议保持）
# CONFIG_LOG_MODE_IMMEDIATE=y  # 如果需要立即模式则开启

# 全局默认级别（可选）
CONFIG_LOG_DEFAULT_LEVEL=3  # 3 代表 INFO

# 启用颜色显示（如果串口终端支持）
CONFIG_LOG_BACKEND_SHOW_COLOR=y

# 为特定模块设置级别（例如 GPIO 驱动日志）
CONFIG_GPIO_LOG_LEVEL_DBG=y
```

## 5. ESP32C3 上的实践

对于 ESP32C3，日志通常通过 **UART0** 输出。
- **调试技巧**：如果你发现日志输出不全或者在系统崩溃前消失，可以尝试开启 `CONFIG_LOG_MODE_IMMEDIATE=y` 来捕捉最后时刻。
- **性能优化**：在正式发布版本中，务必将 `CONFIG_LOG_DEFAULT_LEVEL` 设为 `1` (Error) 或 `2` (Warning) 以节省 Flash 和 CPU。

---

## 6. 与 `printk` 的区别

| 特性 | `printk` | `LOG_*` |
| :--- | :--- | :--- |
| **类型** | 简单打印 | 结构化日志系统 |
| **性能影响** | 大（同步阻塞） | 小（异步非阻塞） |
| **分级控制** | 无 | 有 |
| **元数据** | 仅文本 | 包含时间戳、模块名、级别、颜色 |

> **总结建议**：在驱动开发和正式应用中，**始终优先使用 `LOG_*` 宏**，仅在极早期的引导阶段或无法使用系统服务的场景下使用 `printk`。
