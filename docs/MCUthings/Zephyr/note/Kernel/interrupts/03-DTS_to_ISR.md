---
title: DTS to ISR - Interrupt Binding
tags: [Zephyr, Kernel, DTS, Driver, ISR]
desc: 详解从设备树定义中断资源到驱动注册 ISR 的完整流程
update: 2026-02-13
---

# From Device Tree to ISR (设备树到中断服务程序)

> [!note]
> **Ref:** [Zephyr Device Tree - Interrupts](https://docs.zephyrproject.org/latest/build/dts/api/api.html#interrupts)

在 Zephyr 中，硬件中断资源通过 **Device Tree (DTS)** 进行描述，驱动程序利用 **Devicetree API** 获取这些信息，并最终通过内核提供的宏将 **ISR (Interrupt Service Routine)** 绑定到具体的硬件中断号上。

## 1. 设备树定义 (Device Tree Definition)

在 `.dts` 或 `.dtsi` 文件中，通过 standard properties 描述中断。

### 关键属性
- **`interrupt-parent`**: 指定该设备连接的中断控制器 (Interrupt Controller)。若未指定，默认继承父节点的设置。
- **`interrupts`**: 定义中断说明符 (Interrupt Specifier)。格式取决于中断控制器的 binding (通常是 `<irq_num priority flags>`)。
- **`interrupt-names`**: (可选) 为中断列表中的每个中断项命名，便于驱动通过名称获取。

### 示例 (Example)

假设有一个名为 `my_sensor` 的 I2C 设备，它有一根中断线连接到 GPIO 控制器（或直接连接到 NVIC/GIC）。

```dts
/* board.dts */

&i2c1 {
    status = "okay";

    my_sensor: my_sensor@42 {
        compatible = "vendor,my-sensor";
        reg = <0x42>;

        /* 引用中断控制器节点 (例如 &gpio0 或 &nvic) */
        interrupt-parent = <&gpio0>;
        
        /* 中断说明符: <引脚号 标志位> (具体格式看 interrupt-parent 的 binding) */
        /* 例如: GPIO_PIN 15, Active Low */
        interrupts = <15 GPIO_ACTIVE_LOW>;
        
        /* 如果有多个中断，可以用名字区分 */
        interrupt-names = "irq_alert"; 
    };
};
```

## 2. 驱动获取中断信息 (Driver Implementation)

在驱动代码 (`.c`) 中，我们不应硬编码中断号，而应使用 Zephyr 提供的 `DT_` 宏从设备树中提取。

### 常用宏
- **`DT_INST_IRQN(inst)`**: 获取实例 `inst` 的中断号 (IRQ Number)。
- **`DT_INST_IRQ(inst, priority)`**: 获取实例 `inst` 的中断优先级。
- **`DT_INST_IRQ_BY_NAME(inst, name, irq)`**: 通过名字获取中断号。

### 完整流程示例

#### Step 1: 定义 ISR
ISR 函数通常接受一个 `void *` 参数 (通常是 `struct device *`)。

```c
static void my_sensor_isr(const struct device *dev)
{
    // 处理中断
}
```

#### Step 2: 编写配置函数 (Config Structure)
在驱动的配置结构体中，我们通常定义一个回调函数指针来专门处理中断配置。这是为了适配 `IRQ_CONNECT` 需要编译期常量的限制（针对静态中断）。

```c
struct my_sensor_config {
    /* 其他配置 ... */
    void (*irq_config_func)(const struct device *dev);
};

/* 声明中断配置函数 */
static void my_sensor_irq_config_func(const struct device *dev);
```

#### Step 3: 初始化与绑定 (Initialization)

在驱动初始化函数 (`init`) 中调用配置函数。

```c
static int my_sensor_init(const struct device *dev)
{
    const struct my_sensor_config *config = dev->config;

    /* 配置中断 (注册 ISR 并使能) */
    config->irq_config_func(dev);

    return 0;
}
```

#### Step 4: 实例化宏 (Macro Magic)

最关键的一步：利用 `DT_INST_FOREACH_STATUS_OKAY` 为每个启用的设备实例生成代码。

```c
/* 实现中断配置函数 */
#define MY_SENSOR_DEFINE(inst)                                          
    static void my_sensor_irq_config_func_##inst(const struct device *dev) 
    {                                                                   
        /* 核心绑定: 将 ISR 关联到从 DTS 获取的 IRQ 号 */                
        IRQ_CONNECT(DT_INST_IRQN(inst),                                 
                    DT_INST_IRQ(inst, priority),                        
                    my_sensor_isr,                                      
                    DEVICE_DT_INST_GET(inst),                           
                    0);                                                 
                                                                        
        /* 使能中断 */                                                  
        irq_enable(DT_INST_IRQN(inst));                                 
    }                                                                   
                                                                        
    static const struct my_sensor_config my_sensor_config_##inst = {    
        .irq_config_func = my_sensor_irq_config_func_##inst,            
    };                                                                  
                                                                        
    DEVICE_DT_INST_DEFINE(inst,                                         
                          my_sensor_init,                               
                          NULL,                                         
                          NULL,                                         
                          &my_sensor_config_##inst,                     
                          POST_KERNEL,                                  
                          CONFIG_SENSOR_INIT_PRIORITY,                  
                          &my_sensor_api);

/* 为每个实例生成代码 */
DT_INST_FOREACH_STATUS_OKAY(MY_SENSOR_DEFINE)
```

## 3. 动态中断 (Dynamic Interrupts)

如果 `interrupts` 属性在编译期无法确定（例如 PCIe 设备），或者需要在运行时更改 ISR，可以使用动态中断。

- **Kconfig**: 需开启 `CONFIG_DYNAMIC_INTERRUPTS`。
- **API**: 使用 `irq_connect_dynamic()` 替代 `IRQ_CONNECT()`。
- **注意**: 动态中断会增加内核体积和内存开销。

## 总结

1.  **DTS**: 在设备树中描述硬件连接 (`interrupts`, `interrupt-parent`)。
2.  **Macros**: 驱动使用 `DT_INST_IRQN` 等宏在编译期提取信息。
3.  **Config Func**: 利用 per-instance 的配置函数封装 `IRQ_CONNECT`。
4.  **Binding**: `IRQ_CONNECT` 将 物理中断号、优先级、ISR 函数、参数 绑定在一起，并在内核中断向量表中注册。
