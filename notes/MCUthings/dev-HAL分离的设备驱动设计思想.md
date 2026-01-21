# C Linux风格经典设计

```c
//Uart_Devt.h
#include <stdint.h>

typedef struct Uart_Devt {
    char *name;                // 设备名：用于标识不同UART（如UART1、UART2）
    void *hal;                // 硬件句柄：指向平台hal handle
    void (*send)(struct Uart_Devt *dev, char *buf, uint8_t len); // 操作接口：函数指针
} Uart_Devt;

```

```c
//Uart_Devt_HAL.c

// 平台专属HAL实现：STM32的UART发送
static void impl_Uart_send(Uart_Devt *dev, char *buf, uint8_t len) {
    // impl强转为STM32 HAL层的UART句柄，对接平台硬件
    HAL_UART_Transmit((UART_HandleTypeDef*)dev->hal, (uint8_t*)buf, len, 300);
}

// 示例：设备实例化（STM32 UART1）
extern UART_HandleTypeDef huart1; // STM32 HAL自动生成的硬件句柄,再此处链接符号参考

//向app 提供静态的全局dev handle
extern Uart_Devt dev_uart1 = {
    .name = "uart1",
    .hal = &huart1,            // 绑定平台专属硬件句柄
    .send = impl_Uart_send      // 绑定平台专属HAL实现
};
```

- 跨平台的，liunx设计思想的devt结构体，提供name等管理、注册信息和driver api
- hal指针，指向平台提供的HAL API HANDLE，提供硬件抽象能力。



# CPP 派生类 框架

## 设备基类

```cpp
class UartDevt {
    // 静态成员变量：全局设备链表头（仅声明，类外初始化）
    static UartDevNode dev_list_head;

protected:
    char* const name_;          // 设备名
    void* const hal_;           // 通用HAL句柄（只读，指向平台专属硬件句柄）
    UartDevNode node_;          // 链表节点（用于加入全局设备链表）

    // 保护构造函数：禁止上层直接实例化，仅派生类调用
    constexpr UartDevt(const char* name, void* hal) noexcept;

public:
    // 禁用拷贝/移动语义：保证设备实例唯一性
    UartDevt(const UartDevt&) = delete;
    UartDevt& operator=(const UartDevt&) = delete;
    UartDevt(UartDevt&&) = delete;
    UartDevt& operator=(UartDevt&&) = delete;

    // 虚析构：保证派生类析构函数正确调用
    virtual ~UartDevt() = default;

    // ************************ 纯虚接口：硬件操作（HAL层必须实现） ************************
    virtual void send(char* buf, uint8_t len) noexcept = 0;
    virtual void recv(char* buf, uint8_t len) noexcept = 0;
    virtual void init() noexcept = 0;    // 可选扩展：设备初始化
    virtual void deinit() noexcept = 0;  // 可选扩展：设备反初始化

    // ************************ 普通成员方法：实例属性查询（只读，无副作用） ************************
    constexpr const char* getName() const noexcept;
    constexpr const void* getHalHandle() const noexcept;
    constexpr UartDevNode* getNode() noexcept;

    // ************************ 静态方法：全局设备管理（核心，平台无关） ************************
    // 设备注册：双重校验（设备名+HAL句柄），成功返回true，重复返回false
    static bool registerDev(UartDevt* dev) noexcept;
    
    // 设备获取：通过设备名获取已注册实例（配合校验使用）
    static UartDevt* getDevByName(const char* name) noexcept;
};

//* impl里的辅助函数

// 唯一性校验：检查指定HAL句柄是否已存在
   static bool isHalHandleExists(const void* hal) noexcept;
   
   
// 唯一性校验：检查指定设备名是否已存在
   static bool isDevExists(const char* name) noexcept;
   
```

## HAL派生类

```cpp
// UartDevt_HAL_STM32.cpp ：STM32平台专属HAL层，Dev层无感知
#include "UartDevt.h"
#include "stm32f4xx_hal.h"  // 平台专属HAL头文件（根据你的MCU型号修改）
#include <cassert>          // 可选：断言检查，嵌入式可注释（用if判断替代）

// 平台专属派生类：实现Dev层的纯虚函数，仅该类感知STM32 HAL细节
class Stm32UartDevt : public UartDevt {
public:
    // 构造函数：调用父类Dev层构造，初始化设备名+STM32 HAL句柄
    constexpr Stm32UartDevt(const char* name, UART_HandleTypeDef* hal_uart)
        : UartDevt(name, (hal)) {

        }

    
    // 实现Dev层纯虚函数：STM32平台专属send，与你原C代码的impl_Uart_send完全一致
    void send(char* buf, uint8_t len) override {
        // 强转通用hal_为STM32专属HAL句柄（Dev层仅存void*，此处唯一的平台相关强转）
        auto* huart = static_cast<UART_HandleTypeDef*>(getHalHandle());

        // reinterpret_cast ：低level的“重新解释”，无任何安全检查
        HAL_UART_Transmit(huart, reinterpret_cast<uint8_t*>(buf), len, 300);
    }
};

// 全局HAL句柄：由STM32 HAL库自动生成（如CubeMX生成的huart1/huart2），此处外部引用
extern UART_HandleTypeDef huart1;
// extern UART_HandleTypeDef huart2;  // 多UART设备直接新增即可

// 全局设备实例：与你原C代码的dev_uart1完全一致，上层直接调用！
// 派生类对象赋值给全局作用域，上层可直接通过dev_uart1.send(...)调用
// 对于注册顺序有依赖的设备，可以考虑封装一个静态的switch case dev handle 封装表 
extern Stm32UartDevt dev_uart1("uart1", &huart1);
// Stm32UartDevt dev_uart2("uart2", &huart2);  // 多UART设备新增实例，Dev层无需修改
```

### static switch case延迟初始化

```cpp

// 【核心改造】实现Switch-Case的设备统一获取函数
// 所有UART设备为局部static，第一次调用对应case时初始化，线程安全
UartDevt& getUartDev(int id) noexcept {
    switch (id) {
        case 1: {
            // 局部static：第一次调用UART1时初始化，仅一次
            static constexpr Stm32UartDevt dev_uart1("uart1", &huart1);
            return &dev_uart1; // constexpr对象为const，解除const（嵌入式安全）
        }
        case 2: {
            static constexpr Stm32UartDevt dev_uart2("uart2", &huart2);
            return &dev_uart2;
        }
        case 3: {
            static constexpr Stm32UartDevt dev_uart3("uart3", &huart3);
            return &dev_uart3;
        }
        // 【按需新增】添加UART4/LPUART1等，仅加一个case分支即可
        // case UartId::UART4: {
        //     static constexpr Stm32UartDevt dev_uart4("uart4", &huart4);
        //     return const_cast<UartDevt*>(&dev_uart4);
        // }
        default: {
            // 无效设备，返回nullptr，上层做空指针判断
            return nullptr;
        }
    }
}
```



