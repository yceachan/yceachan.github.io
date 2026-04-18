---
title: GPIO 子系统分析 (二)：驱动实例与数据结构
tags: [GPIO, Driver, Kernel, Data Structure]
desc: 深入解析 drivers/gpio/gpio_esp32.c 中的 struct device 实例化过程
update: 2026-02-10
---

# GPIO 子系统分析 (二)：驱动实例与数据结构

> [!note]
> **Ref:** [gpio_esp32.c](../../../sdk/source/zephyr/drivers/gpio/gpio_esp32.c)

在这一阶段，我们深入 `drivers/gpio/gpio_esp32.c`，剖析了 GPIO 驱动如何将设备树信息转化为内核对象。

## 1. 核心数据结构 (Data Structures)

### 1.1 Config (ROM)
`struct gpio_esp32_config` 存储了编译时确定的硬件参数，对应 `struct device` 的 `config` 成员。

```c
struct gpio_esp32_config {
    /* 必须是第一个成员，用于通过 container_of 获取 */
    struct gpio_driver_config drv_cfg; 
    gpio_dev_t *const gpio_base; // GPIO 控制器基地址 (0x60004000)
    gpio_dev_t *const gpio_dev;  // 当前端口地址 (对于 ESP32C3 也是 0x60004000)
    const int gpio_port;         // 端口 ID (0 或 1)
};
```

### 1.2 Data (RAM)
`struct gpio_esp32_data` 存储运行时状态，对应 `struct device` 的 `data` 成员。

```c
struct gpio_esp32_data {
    struct gpio_driver_data common; // 包含互斥锁等通用数据
    sys_slist_t cb;                 // 回调函数链表 (用于中断处理)
};
```

### 1.3 API (Function Pointers)
`gpio_esp32_driver_api` 实现了标准 GPIO 子系统定义的接口。

```c
static DEVICE_API(gpio, gpio_esp32_driver_api) = {
    .pin_configure = gpio_esp32_config,
    .port_get_raw = gpio_esp32_port_get_raw,
    .port_set_masked_raw = gpio_esp32_port_set_masked_raw,
    // ... 中断管理 ...
    .manage_callback = gpio_esp32_manage_callback,
};
```

## 2. 实例化宏 (Instantiation)

Zephyr 使用 `DT_INST_FOREACH_STATUS_OKAY` 宏遍历所有状态为 "okay" 的 GPIO 节点，并为每个节点调用 `ESP_SOC_GPIO_INIT`。

```c
#define ESP_SOC_GPIO_INIT(_id)                          
    static struct gpio_esp32_data gpio_data_##_id;      
    static struct gpio_esp32_config gpio_config_##_id = { 
        /* 从 DTS 获取寄存器地址 */                       
        .gpio_base = (gpio_dev_t *)DT_REG_ADDR(DT_NODELABEL(gpio0)), 
        .gpio_port = _id                                
    };                                                  
    DEVICE_DT_DEFINE(DT_NODELABEL(gpio##_id),           
            &gpio_esp32_init,                           
            NULL,                                       
            &gpio_data_##_id,                           
            &gpio_config_##_id,                         
            PRE_KERNEL_1,                               
            CONFIG_GPIO_INIT_PRIORITY,                  
            &gpio_esp32_driver_api);

DT_INST_FOREACH_STATUS_OKAY(ESP_SOC_GPIO_INIT);
```

### 关键映射分析
1.  **Memory Mapping**: `DT_REG_ADDR(DT_NODELABEL(gpio0))` 直接提取了我们在 Phase 1 中看到的 `0x60004000`。
2.  **Initialization Level**: 使用 `PRE_KERNEL_1`。这是因为 GPIO 是极基础的设备，其他设备（如 LED、I2C）可能在 `POST_KERNEL` 阶段依赖它。
3.  **Instance ID**: `_id` 宏参数对应 `gpio0`, `gpio1` 等后缀。

## 3. 中断处理 (Interrupts)

驱动初始化函数 `gpio_esp32_init` 负责注册中断。

```c
static int gpio_esp32_init(const struct device *dev)
{
    static bool isr_connected;
    if (!isr_connected) {
        // 从 DTS 获取中断号 (GPIO_INTR_SOURCE) 和优先级
        esp_intr_alloc(DT_IRQ_BY_IDX(DT_NODELABEL(gpio0), 0, irq), ..., gpio_esp32_isr, ...);
        isr_connected = true;
    }
    return 0;
}
```
*   **共享中断**: 注意 `static bool isr_connected`。ESP32 的所有 GPIO 端口共享同一个中断源，所以中断服务程序 (ISR) 只需注册一次。
*   **ISR 分发**: `gpio_esp32_isr` 会根据硬件状态寄存器，分发给具体端口的回调列表。

---
**下一阶段预览**: 我们将分析 **Phase 3: API 调用与系统调用**。当应用层调用 `gpio_pin_configure` 时，发生了什么？
