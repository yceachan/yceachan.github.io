# Awesome-Zephyr

> **A modern, AI-assisted playbook for mastering Zephyr RTOS on ESP32-C3.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-ESP32%20C3-green.svg)
![Kernel](https://img.shields.io/badge/kernel-Zephyr%20RTOS-orange.svg)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)

**Awesome-Zephyr** is a next-generation repository dedicated to Zephyr RTOS learning and application development. Unlike traditional tutorials, this project leverages **AI Agents (Gemini CLI)** to govern knowledge bases, standardize code quality, and accelerate the learning curve from "Hello World" to complex subsystem drivers.

## Key Features

- **AI-Governed Knowledge Base**: Structured, strictly governed notes on Kernel Subsystems (GPIO, I2C, DTS) and Build Systems (CMake/West).
- **Deep-Dive Documentation**: "Source-Driven Analysis" method mapping hardware -> driver -> subsystem -> Application.
- **Modern Workflow**: Best practices for developing Out-of-Tree applications using WSL/Linux and modern CLI tools.
- **Structured Engineering**: Clear separation of vendor docs, personal notes, and production-ready code.

## Project Structure

| Directory | Description |
| :--- | :--- |
| `note` | **The Core Brain.** Deep technical notes, architectural diagrams (Mermaid), and best practices. <br> *Highlights: `note/01-Build`, `note/02-subsystem/`, `note/dts/`* |
| `prj` | **The Code Forge.** Source code for Zephyr applications. <br> *Includes: `01-blinky`, and standardized CMakeLists.* |
| `sdk` | **The Foundation.** Zephyr SDK, West workspace, and Toolchains. |
| `docs` | **The Reference.** Official datasheets (ESP32-C3), board schematics, and vendor manuals. |

##  Knowledge Base

Start your journey here:

- [**Build System Analysis**](note/01-Build/03-Blinky_Project_Analysis.md): Understanding CMake, Kconfig, and the build flow.
- [**Subsystem Deep Dive**](note/02-subsystem/01-gpio.md): How GPIO and device models work in Zephyr.
- [**Devicetree Decoding**](note/dts/02-dts_load_flow.md): Unraveling the DTS loading and merging process.

## Getting Started

### Prerequisites

- **Hardware**: LuatOS ESP32C3-CORE Development Board.
- **Host**: Linux (Ubuntu 22.04+) or Windows (WSL2).
- **Toolchain**: Zephyr SDK (managed by West).

### Quick Setup ()

`git clone git@github.com:yceachan/Awesome-Zephyr.git [repo_base]`

Refer [sdk/README.md](sdk/README.md) to install whole zephyr SDK env.

### Env profile

Add this to your `.bashrc` for quick access:

```bash
function env-zephyr(){
    source ~/Zephyr-Suite/sdk/venv/bin/activate
    export ZEPHYR_BASE=~/Zephyr-Suite/sdk/source/zephyr
    export ZEPHYR_SDK_INSTALL_DIR=~/Zephyr-Suite/sdk/Toolchains
}
```

there are even more helpful vsc workspace setup

```bash
(venv) pi@WuYou:~/Zephyr-Suite/prj/.ide$ tree -a
.
├── .zephyr-init.sh
└── prj.code-workspace
```

effect so like:

```bash
✅ Zephyr Environment Activated.
   SDK: /home/pi/Zephyr-Suite/sdk/source/zephyr
   VENV: /home/pi/Zephyr-Suite/sdk/venv/bin/activate
---------------------------------------------------
🛠️  Available Commands:
   env_zephyr : Re-activate Zephyr environment
   comtty     : Open Serial Monitor (west espressif monitor)
---------------------------------------------------
(venv) pi@WuYou:~/Zephyr-Suite/sdk/source/zephyr$ 
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Zephyr-Suite Contributors
