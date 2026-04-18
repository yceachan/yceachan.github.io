---
title: Zephyr 开发环境完整搭建指南 (Linux/WSL)
tags: [Zephyr, Environment Setup, WSL, Ubuntu, SDK, West]
update: 2026-02-08
---

# Zephyr 开发环境完整搭建指南 (Linux/WSL)

本指南旨在帮助开发者在 **WSL (Ubuntu 22.04+)** 或原生 Linux 环境下，从零搭建一套标准的 Zephyr 开发环境。本方案采用**自定义目录结构**，便于多版本管理和工程隔离。

## 1. 目录结构规划

推荐采用如下目录结构，保持源码、工具链和笔记的分离：

```text
~/Zephyr-Suite/
├── sdk/
│   ├── venv/        # Python 虚拟环境
│   ├── Toolchains/  # Zephyr SDK 工具链安装目录
│   └── source/      # Zephyr RTOS 核心源码 (West 工作区根目录)
│       ├── zephyr/
│       ├── modules/
│       └── ...
├── prj/             # 存放用户自定义的应用程序代码
└── note/            # 开发笔记
```

## 2. 宿主依赖安装 (Host Dependencies)

首先更新系统并安装必要的编译工具和依赖库。

```bash
sudo apt update && sudo apt upgrade -y

# 安装核心依赖
sudo apt install --no-install-recommends -y \
    git cmake ninja-build gperf \
    ccache dfu-util device-tree-compiler wget \
    python3-dev python3-venv python3-pip python3-setuptools \
    python3-tk python3-wheel xz-utils file \
    make gcc gcc-multilib g++-multilib libsdl2-dev libmagic1
```

> **注意**: 如果你是 ARM64 (AArch64) 架构，请移除 `gcc-multilib` 和 `g++-multilib`。

## 3. Python 虚拟环境与 West

为了隔离 Python 依赖，我们使用 `venv`。

### 3.1 创建与激活
```bash
# 创建虚拟环境
python3 -m venv ~/Zephyr-Suite/sdk/venv

# 激活环境 (建议加入 .bashrc)
source ~/Zephyr-Suite/sdk/venv/bin/activate
```

### 3.2 安装 West 元工具
```bash
pip install west
```

## 4. 获取 Zephyr 源码

我们将 Zephyr 源码放置在 `sdk/source` 下，作为基础 SDK 的一部分。

```bash
# 创建源码目录
mkdir -p ~/Zephyr-Suite/sdk/source

# 初始化工作区
west init ~/Zephyr-Suite/sdk/source

# 拉取源码与模块 (耗时步骤)
cd ~/Zephyr-Suite/sdk/source
west update
```

## 5. Python 依赖补全 (关键步骤)

`west update` 仅下载了源码，Zephyr 的构建系统和扩展命令（如 `west packages`）依赖大量的 Python 库。**如果跳过此步，会导致 `jsonschema` 缺失等错误。**

```bash
# 进入 zephyr 源码目录
cd ~/Zephyr-Suite/sdk/source/zephyr

# 安装所有必需的 Python 依赖
pip install -r scripts/requirements.txt
```

> **常见错误**: 若遇到 `ModuleNotFoundError: No module named 'jsonschema'`，正是因为漏掉了这一步。

## 6. 安装 Zephyr SDK (工具链)

我们将使用 `west` 自动化命令将 SDK 安装到 `~/Zephyr-Suite/sdk/Toolchains`，并仅配置 RISC-V 架构以节省空间。

### 6.1 执行自动化安装
**重要前提**：必须先进入 Zephyr 源码目录，因为 `west sdk` 命令依赖工作区配置。

```bash
# 1. 进入 Zephyr 源码目录
cd ~/Zephyr-Suite/sdk/source/zephyr

# 2. 运行自动化安装命令
# -d: 指定安装目录 (会自动创建/覆盖)
# -t: 仅安装 RISC-V 工具链 (支持 ESP32-C3)
west sdk install -d ~/Zephyr-Suite/sdk/Toolchains -t riscv64-zephyr-elf
```

此命令会自动完成以下步骤：
1.  检测并下载适配当前 Zephyr 版本的 SDK (Minimal 包)。
2.  解压到指定目录 `~/Zephyr-Suite/sdk/Toolchains`。
3.  自动下载并配置 RISC-V 工具链。
4.  自动注册 CMake 包索引 (相当于运行了 `./setup.sh -c`)。

### 6.2 配置 udev 规则 (可选但推荐)
安装完成后，建议配置 udev 规则以支持调试器：
```bash
cd ~/Zephyr-Suite/sdk/Toolchains
sudo cp sysroots/x86_64-pokysdk-linux/usr/share/openocd/contrib/60-openocd.rules /etc/udev/rules.d/
sudo udevadm control --reload
```

## 7. 实战：Blinky Demo 构建与烧录

环境搭建完成后，我们建议采用 **Freestanding Application** (独立工程) 模式。这种方式将应用代码放在 `prj/` 下，与 Zephyr 源码解耦。

### 7.1 知识储备：West Blobs
**由于 ESP32 系列涉及闭源的 Wi-Fi/蓝牙协议栈和射频驱动，Zephyr 将这些二进制大对象（Binary Blobs）独立管理。**

*   **作用**: 下载硬件必须的静态库文件。
*   **命令**: `west blobs fetch hal_espressif`

### 7.2 准备独立工程
不要在 `sdk/source/zephyr/samples` 下修改代码。

```bash
# 1. 创建工程目录
mkdir -p ~/Zephyr-Suite/prj/my-blinky

# 2. 复制官方示例作为模板
cp -r ~/Zephyr-Suite/sdk/source/zephyr/samples/basic/blinky/* ~/Zephyr-Suite/prj/my-blinky/
```

### 7.3 编译 (Build)
在编译独立工程时，需要明确指定 `ZEPHYR_BASE`。

```bash
# 1. 激活虚拟环境
source ~/Zephyr-Suite/sdk/venv/bin/activate

# 2. 设置环境变量 (建议加入 .bashrc)
export ZEPHYR_BASE=~/Zephyr-Suite/sdk/source/zephyr

# 3. 更新二进制 Blobs (ESP32 系列必需)
cd $ZEPHYR_BASE
west blobs fetch hal_espressif

# 4. 进入独立工程并编译
cd ~/Zephyr-Suite/prj/my-blinky
west build -p always -b esp32c3_luatos_core #-b 参数可在west config固化
```
*注：如果编译成功，最后会显示 `[100%] Linking C executable ...`*

### 7.4 烧录 (Flash)
**前提**：确保开发板已通过 `usbipd` 透传至 WSL (参考 `note/Build/02-demo-esp32c3串口烧录.md`)。

```bash
# 指定串口设备 (根据实际情况调整，如 /dev/ttyUSB0)
west flash --esp-device /dev/ttyUSB0 #--esp-device 参数可在cmakelist固化
```

*注：如果编译成功，最后会显示 `[100%] Linking C executable ...`*

### 7.3 烧录 (Flash)
**前提**：确保开发板已连接并透传至 WSL (参考 `note/01-Build/02-demo-esp32c3串口烧录.md`)。

```bash
# 指定串口设备 (根据实际情况调整，如 /dev/ttyUSB0)
west flash --esp-device /dev/ttyUSB0
```
*注：如果自动复位失败，请手动按 BOOT + RESET 进入下载模式。*

## 附录：环境变量备忘

如果系统无法自动找到 SDK，可手动设置环境变量：

```bash
export ZEPHYR_SDK_INSTALL_DIR=~/Zephyr-Suite/sdk/Toolchains
```