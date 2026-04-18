# Xilinx Zynq 全栈工程导读：Vivado (PL) 与 Vitis (PS) 的幕后世界

在 Zynq 这类 SoC 芯片的设计中，最大的挑战之一就是理解**硬件（PL，可编程逻辑）**和**软件（PS，处理系统）**是如何协同工作的。

你已经掌握了如何在 GUI 下绘制 Block Design (BD) 和分配管脚，这非常棒，这是 SoC 设计的骨架。接下来，我们将深入文件系统，看看这些 GUI 操作在底层生成了什么，以及 PL 和 PS 是如何完美“握手”的。

---

## 宏观理解：两套工具，一个系统

*   **Vivado (PL端)**：负责“造硬件”。产物是真实的逻辑电路配置文件和一份给软件看的“硬件说明书”。
*   **Vitis (PS端，原SDK)**：负责“写软件”。它基于 Vivado 提供的“说明书”，编写 C/C++ 代码来驱动这些硬件。

这两者的交接信物，是一个名为 **`.xsa` (Xilinx Support Archive)** 的文件（在老版本 Vivado 中叫 `.hdf`）。

---

## 1. PL 端：Vivado 工程结构解剖

当你创建一个 Vivado 工程后，其核心目录结构如下：

### 1.1 核心工程文件
*   **`project_name.xpr`**：Vivado 工程的入口文件。本质上是一个 XML 文件，记录了工程的配置、引用了哪些源文件。双击它即可打开工程。

### 1.2 `project_name.srcs/` (源代码目录)
这是你真正创造价值的地方。
*   **`sources_1/` (设计源文件)**
    *   **`new/`**：你手写的 RTL 模块（`.v`, `.sv`, `.vhd`）通常存放在这里。
    *   **`bd/` (Block Design)**：**极其关键！** 这里存放着你的 `.bd` 文件。它是一个 JSON 格式的文件，记录了你在画布上拖拽的 IP 核、AXI 总线连线情况以及分配的基地址。
    *   **`ip/`**：如果你例化了独立的 Xilinx 官方 IP（如 FIFO, PLL），它们的配置文件 `.xci` 会存放在这里。
*   **`constrs_1/` (约束文件)**
    *   **`.xdc` 文件**：Xilinx Design Constraints。包含两部分：
        1.  **物理约束**：你分配的管脚（比如 `set_property PACKAGE_PIN H16 [get_ports clk]`）和电平标准。
        2.  **时序约束**：时钟定义（`create_clock`）。这是综合器和布线器努力满足的目标。
*   **`sim_1/` (仿真文件)**：你的 Testbench 代码。

### 1.3 `project_name.gen/` (自动生成目录 - 新版Vivado引入)
当你在 GUI 中点击 "Generate Block Design" 或综合时，Vivado 会在这里生成底层代码：
*   **BD Wrapper**：你画的 Block Design 虽然是图形，但底层需要被转换成顶层 Verilog 文件（通常叫 `design_1_wrapper.v`）。
*   **IP 综合产物**：IP 核的实例化模板和底层网表。

### 1.4 `project_name.runs/` (运行过程与产物目录)
这里存放着 Vivado 跑几个小时生成的最终结果。
*   **`synth_1/`**：综合产物。将你的 RTL 转换为由 LUT、触发器等组成的逻辑网表。
*   **`impl_1/`**：实现产物（布局布线）。
    *   **`.bit` (Bitstream)**：**PL端最重要的产物！** 它是最终烧写进 FPGA 改变其内部连线的二进制文件。
    *   各类时序报告、功耗报告。

### 1.5 桥梁文件：`.xsa` (硬件导出文件)
当你在 Vivado 中点击 `File -> Export -> Export Hardware` 时生成的。
它是一个压缩包，如果你把它后缀改成 `.zip` 解压，会发现里面包含了：
1.  **`ps7_init.c / .h`**：初始化 ARM 核心（比如配置 DDR 控制器频率、使能某些外设）的底层代码。
2.  **硬件描述文件**：记录了你在 Address Editor 里给各个 AXI IP 分配的基地址。
3.  （可选）**`.bit` 文件**：如果你勾选了 Include Bitstream。

---

## 2. PS 端：Vitis 工程结构解剖

打开 Vitis，你需要指定一个 Workspace（工作空间）。Vitis 的结构是**分层**的，通常包含两个核心 Project。

### 2.1 平台工程 (Platform Project) - 软件的基础设施
你在 Vitis 里第一步是基于 `.xsa` 创建 Platform 工程。它负责把 Vivado 生成的“硬件说明书”翻译成软件能懂的底层代码。
*   **`hw/`**：存放从 `.xsa` 解压出来的硬件描述信息。
*   **`zynq_fsbl/` (First Stage Boot Loader)**：
    *   极其重要！芯片上电后，ARM 核最先跑的就是这段代码。它负责根据 `ps7_init.c` 初始化 Zynq 芯片的基础环境，然后把 `.bit` 文件配置到 PL 端，最后把你的业务代码加载进内存并执行。
*   **`standalone_bsp/` (Board Support Package 裸机板级支持包)**：
    *   **核心文件 `xparameters.h`**：这是 PL 和 PS 沟通的“密码本”。你在 Vivado 中为自定义 AXI 模块分配的地址，在这里会被转化为 C 语言的宏定义（例如：`#define XPAR_MY_RTL_MODULE_BASEADDR 0x43C00000`）。
    *   **驱动库 (`libsrc/`)**：Xilinx 官方 IP（如 AXI GPIO, UART）的 C 语言驱动代码都在这里。如果你按照规范打包了自定义 IP，你提供的驱动模板也会被拷贝到这里。

### 2.2 应用工程 (Application Project) - 你的业务代码
这是你真正写 C/C++ 业务逻辑的地方。
*   **`src/`**：
    *   **`main.c`**：程序的入口。
    *   **`lscript.ld` (Linker Script 链接脚本)**：**新手极易忽略的重要文件。** 它告诉编译器：你的代码段应该放在哪里？数据段放在哪里？堆栈有多大？（比如是放在芯片内部的 256KB OCM 里，还是放在外挂的 512MB DDR3 里？如果遇到程序跑飞，大概率是堆栈溢出了或者程序放错了地方）。
*   **`Debug/` 或 `Release/`**：编译产物目录。
    *   **`.elf` (Executable and Linkable Format)**：**PS端最重要的产物！** 这是 ARM 处理器可以直接执行的二进制程序文件。

---

## 3. 灵魂一问：RTL 是怎么被 C 语言控制的？（数据流向）

1.  **Vivado 侧**：你写了一个流水灯 RTL，将其打包成带 `AXI4-Lite` 接口的 IP。
2.  **Vivado 连线**：在 Block Design 中，你将 Zynq PS 的 `M_AXI_GP` 接口连到你的 IP 上。在 Address Editor 中，Vivado 自动分配其基地址为 `0x43C00000`。
3.  **握手**：导出 `.xsa`，导入 Vitis。
4.  **Vitis 解析**：Vitis 读取 `.xsa`，在 `xparameters.h` 里生成 `#define XPAR_LED_IP_BASEADDR 0x43C00000`。
5.  **C 语言控制**：你在 `main.c` 里写下：
    ```c
    #include "xparameters.h"
    #include "xil_io.h" // 包含底层读写函数

    int main() {
        // 往你的 RTL 模块的基地址偏移 0 处写入数值 1
        Xil_Out32(XPAR_LED_IP_BASEADDR + 0, 1);
        return 0;
    }
    ```
6.  **硬件响应**：这行 C 代码执行时，ARM 核会发起一次 AXI 总线写事务。地址为 `0x43C00000`，数据为 `1`。你手写的 RTL 内部的 AXI 从机状态机捕捉到这个事务，解析出数据 `1`，并将对应的寄存器翻转，最终点亮了连接到 FPGA 管脚的 LED！

这就完成了从软件到硬件、从指针到电平的惊险一跃。理解了这个文件结构和握手过程，你就具备了 SoC 系统级排错的基础能力。
