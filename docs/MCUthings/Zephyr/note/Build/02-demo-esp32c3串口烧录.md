---
title: WSL 环境下 ESP32-C3 (CH343) 串口烧录配置全指南
tags: [Zephyr, ESP32-C3, WSL, USBIPD, Flashing, UART, udev, west]
update: 2026-02-08

---

# WSL 环境下 ESP32-C3 (CH343) 串口烧录配置全指南

本文档针对使用 **LuatOS ESP32C3-CORE** 开发板（板载 CH343 芯片），详细说明在 WSL 环境下配置设备权限、默认板卡及烧录端口的完整流程。

> [!tip]
>
> win 下配置usb设备bind 到wsl：
>
> ```shell
> PS D:\Workspace> usbipd list
> Connected:
> BUSID  VID:PID    DEVICE                                                        STATE
> 1-3    174f:244c  Integrated Camera                                             Not shared
> 2-3    8087:0029  英特尔(R) 无线 Bluetooth(R)                                   Not shared
> 2-4    04f3:0c58  ELAN WBF Fingerprint Sensor                                   Not shared
> 3-1    2717:87b1  USB 输入设备                                                  Not shared
> 3-3    2b89:0043  USB 输入设备                                                  Not shared
> 3-4    1a86:5397  USB2.0 Ethernet Adapter                                       Not shared
> 4-4    1a86:55d3  USB-SERIAL CH343 (COM6)                                       Shared
> 
> usbipd lbind --busid 4-4   #obind once
> 
> usbipd attach --wsl -a --busid <busid>    #each time hog usb or reboot -a :auto attach when hog
> ```
>
> 

## 1. 硬件识别与权限配置

在 Linux (WSL) 下，CH343 通常被识别为 `/dev/ttyACM*` 而非 `/dev/ttyUSB*`。

### 1.1 确认设备节点
```bash
lsusb
#Bus 001 Device 002: ID 1a86:55d3 QinHeng Electronics USB Single Serial

ls -l /dev/ttyACM*
# crw-rw---- 1 root dialout ... /dev/ttyACM0
```

### 1.2 解决权限问题 (udev 规则)
默认情况下，普通用户没有权限访问串口设备。通过编写 `udev` 规则，我们可以实现：
1.  自动赋予 `0666` (rw-rw-rw-) 权限。
2.  创建一个固定的软链接 `/dev/esp32c3`，避免设备号变动。

**创建规则文件：**
```bash
# 注意：udev 规则必须单行写入，不能换行
sudo sh -c "echo 'SUBSYSTEM==\"tty\", ATTRS{idVendor}==\"1a86\", ATTRS{idProduct}==\"55d3\", MODE=\"0666\", GROUP=\"dialout\", SYMLINK+=\"esp32c3\"' > /etc/udev/rules.d/99-esp32c3.rules"
```

**加载生效：**
```bash
sudo udevadm control --reload-rules && sudo udevadm trigger
```

**验证：**
```bash
ls -l /dev/esp32c3
# 预期输出: lrwxrwxrwx ... /dev/esp32c3 -> ttyACM0
```

---

## 2. 自动化配置 (摆脱命令行参数)

为了避免每次都输入 `-b esp32c3_luatos_core --esp-device /dev/ttyACM0`，我们可以通过配置文件固化这些参数。

### 2.1 设置默认板卡 (Default Board)
推荐在应用工程的 `CMakeLists.txt` 中直接指定默认板卡，这样可以做到工程级隔离，避免污染整个 SDK 工作区的配置。

```cmake
cmake_minimum_required(VERSION 3.20.0)
# 必须在 find_package 之前设置 BOARD
set(BOARD esp32c3_luatos_core)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
```
*   **效果**: 运行 `west build` 或 `west build -p always` 时无需再加 `-b` 参数，且配置与工程代码绑定，便于版本控制。

### 2.2 设置默认烧录端口 (Default Flash Port)

#### 方法 A: 修改 CMakeLists.txt (推荐工程级固定)
在应用工程的 `CMakeLists.txt` 中添加 `board_runner_args`。这种方法最稳健，因为它直接注入构建系统。

```cmake
cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(blinky)

# --- 添加这行配置 ---
# 强制指定 esp32 runner 使用的端口
board_runner_args(esp32 "--esp-device=/dev/esp32c3")
# ------------------

target_sources(app PRIVATE src/main.c)
```

#### 方法 B: 使用环境变量 (推荐个人开发环境)
如果你不想修改源码，可以在 shell 配置文件（如 `~/.bashrc`）中设置：

```bash
export ESPTOOL_PORT=/dev/esp32c3
```
*   **注意**: Zephyr 的 `esp32` runner 底层调用 `esptool.py`，该工具会读取此环境变量。

#### 方法 C: West Config (仅限部分参数)
虽然可以通过 `west config` 传递 runner 参数，但语法较复杂且容易出错：
```bash
# 注意 -- 的使用，防止参数被误解析
west config runner.esp32.flags -- "--esp-device=/dev/esp32c3"
```

---

## 3. 最终工作流

完成上述配置后，您的开发流程将简化为：

1.  **连接设备**: 确保 `usbipd` 已挂载，`/dev/esp32c3` 存在。
2.  **构建**:
    ```bash
    west build
    ```
3.  **烧录**:
    ```bash
    west flash
    ```
4.  **调试**:
    由于是 UART 通道，只能查看日志，无法使用 GDB。
    ```bash
    picocom -b 115200 /dev/esp32c3
    ```

## 4. 常见问题排查

*   **Failed to connect**: 尝试进入 Bootloader 模式（按住 BOOT，点按 RESET，松开 BOOT）。
*   **Permission denied**: 检查 `ls -l /dev/esp32c3` 权限是否为 `rw-rw-rw-`，或重新插拔设备触发 udev 规则。

---

## 5. 深度问答 (FAQ)

Q: 为什么有时 `set(BOARD ...)` 在 CMakeLists.txt 中会不生效或报错？

**A**: 这是由 Zephyr 构建系统的生命周期和加载顺序决定的。根据官方文档：
- **`BOARD`** 变量必须在 `find_package(Zephyr ...)` **之前**设置。因为 `find_package(Zephyr)` 是引导整个 Zephyr 构建系统（包括加载对应架构的编译器和设备树定义）的入口。
- 如果在 `find_package(Zephyr ...)` 之后再 `set(BOARD ...)`，构建系统此时已经加载了默认（或缓存）的地基配置，无法再“倒退”更换板卡，从而导致构建忽略该设置或在 Pristine 编译时直接报错。

> [!note]
> **Ref:** `$ZEPHYR_BASE/doc/develop/application/index.rst` (Application CMakeLists.txt)
> 构建系统解析 `BOARD` 顺序 (优先级由高到低): 
> 1. CMake Cache (之前构建保留的缓存)
> 2. 命令行参数 (如 `west build -b YOUR_BOARD`)
> 3. 环境变量 `BOARD`
> 4. `CMakeLists.txt` 中在 `find_package` 前显式设置的 `set(BOARD ...)` 变量。

Q: 如何验证我的配置已经注入？

**A**: 构建完成后，检查 `build/zephyr/runners.yaml` 文件。搜索 `args` 部分，你应该能看到你通过 CMake 注入的 `--esp-device=/dev/esp32c3` 参数。

---

## 6. 参考文献 (References)

- [Zephyr Build System: The BOARD variable](https://docs.zephyrproject.org/latest/build/cmake/index.html#the-board-variable)
- [Application Development: Build System Variables](https://docs.zephyrproject.org/latest/develop/application/index.html#important-build-system-variables)
- [West meta-tool: Configuration Guide](https://docs.zephyrproject.org/latest/develop/west/config.html)
- [Flash Runner Configuration (Official Wiki)](https://docs.zephyrproject.org/latest/build/flashing/configuration.html)
