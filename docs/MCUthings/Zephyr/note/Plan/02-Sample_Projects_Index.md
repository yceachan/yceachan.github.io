---
title: Zephyr SDK 核心 Sample 工程索引
tags: [zephyr, samples, index, learning-path]
update: 2026-02-09

---

# Zephyr SDK 核心 Sample 工程索引

本索引列出了 `sdk/source/zephyr/samples` 路径下最具学习价值的示例工程，按功能领域分类。你可以通过 `west build -b <BOARD> <path_to_sample>` 直接编译。

## 1. 基础入门 (Basic Operations)
*路径：`samples/basic/`*

| 目录名 | 说明 | 学习重点 |
| :--- | :--- | :--- |
| `blinky` | LED 闪烁 | 最基础的 GPIO 输出与 SDK 构建。 |
| `button` | 按键输入 | 中断回调机制与 GPIO 输入。 |
| `threads` | 基础多线程 | 线程创建、优先级抢占、`k_yield` 行为。 |
| `minimal` | 最小化应用 | 理解 Zephyr 的最小资源占用。 |
| `rgb_led` | RGB LED 控制 | PWM (脉宽调制) 子系统的应用。 |

## 2. 内核服务 (Kernel & Synchronization)
*路径：`samples/kernel/` 及 `samples/synchronization/`*

| 目录名 | 说明 | 学习重点 |
| :--- | :--- | :--- |
| `synchronization` | 信号量同步 | `k_sem` 的初始化与给/拿。 |
| `philosophers` | 哲学家就餐问题 | 经典的并发模型，演示 Mutex 死锁避免。 |
| `msg_queue` | 消息队列 | 线程间定长数据传递。 |
| `condition_variables`| 条件变量 | 高级同步原语，用于等待特定状态。 |
| `workqueue` | 工作队列 | 系统级异步任务分发，ISR 下半部处理。 |

## 3. 驱动与传感器 (Drivers & Sensors)
*路径：`samples/sensor/` 及 `samples/drivers/`*

| 目录名 | 说明 | 学习重点 |
| :--- | :--- | :--- |
| `sensor_shell` | 传感器命令行 | 使用 Shell 动态读取已配置的所有传感器。 |
| `mpu6050` | 6 轴加速度计 | I2C 接口传感器驱动与数据处理。 |
| `bme280` | 温湿度压力传感器 | 环境传感器 API 标准接口。 |
| `accel_polling` | 加速度计轮询 | 传统的定时读取模式。 |
| `accel_trig` | 传感器触发模式 | 基于硬件中断驱动的数据采集。 |

## 4. 网络与连接 (Networking - ESP32C3 重点)
*路径：`samples/net/`*

| 目录名 | 说明 | 学习重点 |
| :--- | :--- | :--- |
| `wifi` | Wi-Fi 扫描与连接 | Wi-Fi 管理接口，L2 层连接逻辑。 |
| `sockets/echo_client`| Socket 客户端 | BSD Socket API 适配，TCP/UDP 通信。 |
| `mqtt_publisher` | MQTT 发布者 | 物联网协议栈，连接到公网 Broker。 |
| `dhcpv4_client` | DHCP 客户端 | 自动获取 IP 地址流程。 |

## 5. 蓝牙 (Bluetooth - ESP32C3 重点)
*路径：`samples/bluetooth/`*

| 目录名 | 说明 | 学习重点 |
| :--- | :--- | :--- |
| `peripheral` | 蓝牙从机 (Beacon) | BLE 广播服务定义、GATT 表构建。 |
| `central` | 蓝牙主机 | 扫描、连接并操作远程从机。 |
| `peripheral_hids` | 蓝牙 HID (键盘/鼠标) | 实现标准蓝牙输入设备。 |
| `hci_uart` | HCI 转接器 | 将 ESP32 作为 PC 的蓝牙控制器。 |

---

## 快速查阅建议

*   **想学 RTOS 调度？** 优先看 `samples/basic/threads` 和 `samples/synchronization`。
*   **想学 ESP32 特性？** 优先看 `samples/net/wifi` 和 `samples/bluetooth/peripheral`。
*   **想看代码规范？** `samples/hello_world` 是最标准的模板。
