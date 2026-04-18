---
title: Top-Down 解析 peripheral_hr 核心 API
tags: [Zephyr, Bluetooth, BLE, API, Doxygen, HRS, BAS]
desc: 整理并翻译 peripheral_hr 示例中调用到的所有协议栈核心 API 的 Doxygen 注释，自顶向下理解 Zephyr 蓝牙接口设计。
update: 2026-02-27
---

# Top-Down 解析 peripheral_hr 核心 API

> [!note]
> **Ref:** `$ZEPHYR_BASE/include/zephyr/bluetooth/`
> 本文档抽取了 `peripheral_hr` 示例工程中涉及的所有 Zephyr 蓝牙子系统 API 的官方 Doxygen 注释，并进行了结构化重构。

## 0. 核心头文件依赖 (Header Inclusions)

在开发 Zephyr 蓝牙应用时，通常需要引入以下几个维度的头文件。以 `peripheral_hr` 为例，包含的头文件及其职责如下：

- `<zephyr/bluetooth/bluetooth.h>`: **(必选)** 包含了最核心的蓝牙栈管理 API，如 `bt_enable()` 初始化接口、底层广播 (`bt_le_adv_start`) 和扫描控制接口，以及 `bt_data` 结构体宏定义。
- `<zephyr/bluetooth/hci.h>`: 包含了主机控制接口 (HCI) 层的定义，例如经典的 HCI 错误码和状态码（如代码中用到的 `bt_hci_err_to_str` 转换宏）。
- `<zephyr/bluetooth/conn.h>`: 包含了处理设备连接状态、配对和安全层的 API。如 `bt_conn` 结构体抽象，以及连接回调 `bt_conn_cb` 和认证回调 `bt_conn_auth_cb` 的注册。
- `<zephyr/bluetooth/uuid.h>`: 提供了各种标准蓝牙 UUID 的宏定义，以及在 `ad[]` 广播数组中编码 16/32/128-bit UUID 所需的工具宏（例如 `BT_UUID_16_ENCODE` 和 `BT_UUID_HRS_VAL`）。
- `<zephyr/bluetooth/gatt.h>`: 包含了通用属性配置文件 (GATT) 的核心操作接口，主要用于开发者在实现自定义服务时，进行服务、特征值的声明以及属性读写回调的注册。
- `<zephyr/bluetooth/services/hrs.h>` & `<zephyr/bluetooth/services/bas.h>`: 包含了 Zephyr 内建的标准心率和电池服务 API（前提是 Kconfig 中开启了相应的宏）。

---

## 1. 核心栈管理 (Core Stack Management)

### `bt_enable`

```c
#include <zephyr/bluetooth/bluetooth.h>

/**
 * @brief 初始化并启用蓝牙子系统。
 *
 * 在调用任何需要与本地蓝牙硬件通信的 API 之前，必须先调用此函数。
 * 如果开启了 CONFIG_BT_SETTINGS，在调用成功后还必须加载蓝牙设置，
 * 之后才能使用其他蓝牙 API。
 *
 * @param cb 初始化完成后的回调函数指针。
 *           如果传入 NULL，则函数会同步阻塞等待初始化完成。
 *           如果传入回调函数，该回调将在系统工作队列 (System Workqueue) 中被异步执行。
 *
 * @retval 0 成功。
 * @retval 负数 失败，返回对应的错误码。
 */
int bt_enable(bt_ready_cb_t cb);
```

---

## 2. 广播控制 (Advertising)

### `bt_le_adv_start`

```c
#include <zephyr/bluetooth/bluetooth.h>

/**
 * @brief 启动低功耗蓝牙广播。
 *
 * 设置广播数据 (AD)、扫描响应数据 (SD)、广播参数并启动低功耗蓝牙广播。
 * 如果 param.peer 被设置，广播将被定向到该特定的对端设备。
 * 注意：此函数不能与 BT_LE_ADV_OPT_EXT_ADV（扩展广播选项）同时使用。
 *
 * @param param 广播参数配置指针（如广播间隔、可连接性等）。
 * @param ad 将被放入广播数据包 (Advertising Packet) 中的 bt_data 数组。
 * @param ad_len ad 数组中的元素个数。
 * @param sd 将被放入扫描响应包 (Scan Response Packet) 中的 bt_data 数组。
 * @param sd_len sd 数组中的元素个数。
 *
 * @retval 0 成功。
 * @retval -ENOMEM 针对可连接广播，没有空闲的连接对象。
 * @retval -ECONNREFUSED 针对可连接广播，Controller 中已建立的连接数达到最大限制。
 * @retval 其他负数 其他执行失败错误码。
 */
int bt_le_adv_start(const struct bt_le_adv_param *param,
                    const struct bt_data *ad, size_t ad_len,
                    const struct bt_data *sd, size_t sd_len);
```

---

## 3. 连接与安全 (Connection and Security)

### `bt_conn_auth_cb_register`

```c
#include <zephyr/bluetooth/conn.h>

/**
 * @brief 注册认证与安全回调。
 *
 * 注册用于处理身份验证 (Authenticated Pairing) 和安全连接的回调函数。
 * 如果传入 NULL，则注销之前注册的回调结构体。
 *
 * @param cb 指向回调结构体 (bt_conn_auth_cb) 的指针。
 *           该指针指向的内存必须在程序运行期间保持有效。
 *
 * @retval 0 成功。
 * @retval 负数 失败返回错误码。
 */
int bt_conn_auth_cb_register(const struct bt_conn_auth_cb *cb);
```

---

## 4. 心率服务 (Heart Rate Service - HRS)

### `bt_hrs_cb_register`

```c
#include <zephyr/bluetooth/services/hrs.h>

/**
 * @brief 注册心率服务 (HRS) 回调。
 *
 * 当发生与心率服务相关的特定事件（例如客户端开启或关闭了通知 ntf_changed）时，
 * 系统将调用注册的回调函数。
 *
 * @param cb 指向回调结构体 (bt_hrs_cb) 的指针。
 *           在注销前，该指针指向的内存必须保持有效。
 *
 * @retval 0 成功。
 * @retval -EINVAL 如果 cb 为 NULL。
 */
int bt_hrs_cb_register(struct bt_hrs_cb *cb);
```

### `bt_hrs_notify`

```c
#include <zephyr/bluetooth/services/hrs.h>

/**
 * @brief 通知心率测量值。
 *
 * 此函数会通过 GATT 向所有当前订阅了心率特征值 (Heart Rate Measurement)
 * 的客户端发送 Notification 报文。
 *
 * @param heartrate 当前的心率测量值（单位：BPM，次/分钟）。
 *
 * @retval 0 成功。
 * @retval 负数 失败返回错误码。
 */
int bt_hrs_notify(uint16_t heartrate);
```

---

## 5. 电池服务 (Battery Service - BAS)

### `bt_bas_get_battery_level`

```c
#include <zephyr/bluetooth/services/bas.h>

/**
 * @brief 读取电池电量值。
 *
 * 获取设备当前存储在电池服务特征值中的电量百分比。
 *
 * @return 电池电量百分比 (0 ~ 100 之间的 uint8_t 值)。
 */
uint8_t bt_bas_get_battery_level(void);
```

### `bt_bas_set_battery_level`

```c
#include <zephyr/bluetooth/services/bas.h>

/**
 * @brief 更新电池电量值。
 *
 * 修改电池特征值的内容，如果客户端配置了订阅，
 * 系统会自动通过 GATT 发送 Notification 将新电量推给所有订阅者。
 *
 * @param level 新的电池电量百分比 (0 ~ 100)。
 *
 * @retval 0 成功。
 * @retval 负数 失败返回错误码。
 */
int bt_bas_set_battery_level(uint8_t level);
```
