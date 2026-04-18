---
title: Bluetooth Peripheral HR 示例工程深度剖析
tags: [Zephyr, Subsystem, Bluetooth, BLE, Peripheral, GATT, HRS, BAS]
desc: 深入分析 Zephyr 官方 peripheral_hr 示例工程，探讨如何实现心率计外设、定义广播数据、管理 GATT 服务通知以及处理连接回调。
update: 2026-02-26
---

# Bluetooth Peripheral HR 示例工程深度剖析

> [!note]
> **Ref:** 
> - 示例源码路径: `$ZEPHYR_BASE/samples/bluetooth/peripheral_hr/`
> - 工程克隆路径: `prj/03-peripheral_hr/`

`peripheral_hr` 是 Zephyr 蓝牙子系统中最经典的外设示例。它模拟了一个标准的心率计（Heart Rate Sensor），同时展示了如何集成多个标准 GATT 服务（HRS, BAS, DIS）。

## 1. Kconfig 依赖分析 (`prj.conf`)

要构建一个心率计外设，需要开启以下关键宏：
- `CONFIG_BT_PERIPHERAL=y`: 启用外设角色，支持可连接广播。
- `CONFIG_BT_HRS=y`: 启用 Zephyr 内置的**心率服务 (Heart Rate Service)**。
- `CONFIG_BT_BAS=y`: 启用 Zephyr 内置的**电池服务 (Battery Service)**。
- `CONFIG_BT_DIS=y`: 启用**设备信息服务 (Device Information Service)**。
- `CONFIG_BT_DEVICE_NAME`: 设置扫描时看到的蓝牙名称。

## 2. 广播数据定义 (Advertising Data)

蓝牙外设在未连接前，必须通过广播让中心设备发现。

```c
/* 1. 主广播数据 (Advertising Data) */
static const struct bt_data ad[] = {
    /* 标志位：一般可发现模式，不支持 BR/EDR */
	BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),
    /* 包含的服务 UUID 列表：方便手机端根据 UUID 过滤显示 */
	BT_DATA_BYTES(BT_DATA_UUID16_ALL,
		      BT_UUID_16_ENCODE(BT_UUID_HRS_VAL),
		      BT_UUID_16_ENCODE(BT_UUID_BAS_VAL),
		      BT_UUID_16_ENCODE(BT_UUID_DIS_VAL)),
};

/* 2. 扫描响应数据 (Scan Response) */
static const struct bt_data sd[] = {
    /* 将完整的设备名称放在扫描响应包中，以节省主广播包空间 */
	BT_DATA(BT_DATA_NAME_COMPLETE, CONFIG_BT_DEVICE_NAME, sizeof(CONFIG_BT_DEVICE_NAME) - 1),
};
```

## 3. 连接管理与回调

Zephyr 使用 `BT_CONN_CB_DEFINE` 宏静态定义连接回调，避免了动态注册的开销。

```c
static void connected(struct bt_conn *conn, uint8_t err) { ... }
static void disconnected(struct bt_conn *conn, uint8_t reason) { ... }

/* 静态定义连接回调结构体 */
BT_CONN_CB_DEFINE(conn_callbacks) = {
	.connected = connected,
	.disconnected = disconnected,
};
```

## 4. GATT 服务交互机制

### 4.1 服务的注册与通知使能
本示例使用了 Zephyr 栈内置的服务实现（`hrs.c`, `bas.c`），它们在系统初始化时会自动注册到 GATT 数据库中。
- `bt_hrs_notify(heartrate)`: 当手机订阅了心率特征值的通知 (Notification) 后，调用此 API 即可将数据推送到手机。
- **通知状态追踪**: 示例通过 `hrs_ntf_changed` 回调追踪客户端是否开启了通知，从而避免在没人监听时发送无效数据。

### 4.2 数据模拟流程
在 `main` 循环中，应用每隔 1 秒更新一次模拟的心率值和电量：
```c
while (1) {
    k_sleep(K_SECONDS(1));
    hrs_notify(); // 模拟心率跳变并通过 bt_hrs_notify 发送
    bas_notify(); // 模拟电量消耗并通过 bt_bas_set_battery_level 更新
    
    /* 处理连接状态标志位 */
    if (atomic_test_and_clear_bit(state, STATE_CONNECTED)) {
        // 连接成功逻辑
    }
}
```

## 5. 扩展：普通广播 vs 扩展广播 (Extended Adv)

代码中包含了对 `CONFIG_BT_EXT_ADV` 的条件编译支持：
- **Legacy Advertising**: 使用 `bt_le_adv_start()`。这是蓝牙 4.0 的标准模式，广播包最大 31 字节。
- **Extended Advertising**: 使用 `bt_le_ext_adv_create()`。这是蓝牙 5.0 引入的增强模式，支持更长的数据包和 Coded PHY (远距离模式)。

## 6. 总结

`peripheral_hr` 展示了 Zephyr 蓝牙开发的高效性：
1. **模块化服务**: 通过 Kconfig 即可引入标准的 HRS/BAS 服务，无需手动编写繁琐的 GATT 属性表。
2. **原子状态管理**: 使用 `atomic_set_bit` 处理中断/回调与主循环之间的同步，简洁且安全。
3. **分层清晰**: 广播定义 (`ad/sd`)、连接回调 (`conn_cb`)、安全回调 (`auth_cb`) 各司其职。

这为我们自定义 GATT 服务（如下一节：自定义数据采集传输服务）提供了完美的模板架构。
