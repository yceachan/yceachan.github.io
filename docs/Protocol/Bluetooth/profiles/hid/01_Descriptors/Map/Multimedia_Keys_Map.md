---
title: Multimedia & Special Keys Usage Map
tags: [HID, Consumer-Page, System-Control, App-Keys]
last_updated: 2026-02-02
---

# Multimedia & Special Keys Usage Map

本文档针对 **多媒体 (Multimedia)**、**系统控制 (System Control)** 及 **应用快捷键 (Application Keys)** 进行了整理，涵盖了 `Power`, `Sleep`, `Web Controls`, `App Launch` 等常见功能。

> **Usage Page 缩写说明**:
> *   **0x01**: Generic Desktop Page (系统电源)
> *   **0x07**: Keyboard/Keypad Page (标准按键)
> *   **0x0C**: Consumer Page (多媒体与应用)

## 1. 系统与电源控制 (System Power)

| User Label | Usage Page | Usage ID (Hex) | Official Name | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Power** | `0x01` | **81** | System Power Down | 关机 |
| **Sleep** | `0x01` | **82** | System Sleep | 睡眠/待机 |
| **Wake-Up** | `0x01` | **83** | System Wake Up | 唤醒 |
| **screensave** | `0x0C` | **1B1** | AL Screen Saver | 启动屏幕保护 |

## 2. 媒体传输控制 (Media Transport)

| User Label | Usage Page | Usage ID (Hex) | Official Name | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Play/Pause** | `0x0C` | **CD** | Play/Pause | 播放/暂停切换 |
| **Stop** (CD Stop)| `0x0C` | **B7** | Stop | 停止播放 |
| **Next Track** | `0x0C` | **B5** | Scan Next Track | 下一曲 |
| **Prev Track** | `0x0C` | **B6** | Scan Previous Track | 上一曲 |
| **Rec** | `0x0C` | **B2** | Record | 录音/录像 |
| **Rewind** | `0x0C` | **B4** | Rewind | 倒带 |
| **Eject** | `0x0C` | **B8** | Eject | 弹出媒体 |
| **Media Sel** | `0x0C` | **87** | Media Selection | 媒体选择 |
| **M/Mode** | `0x0C` | **82** | Mode Step | 模式切换 (如 TV/Radio) |

## 3. 音量控制 (Audio)

| User Label | Usage Page | Usage ID (Hex) | Official Name | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Volume +** | `0x0C` | **E9** | Volume Increment | 音量加 |
| **Volume –** | `0x0C` | **EA** | Volume Decrement | 音量减 |
| **Mute** | `0x0C` | **E2** | Mute | 静音 |

## 4. 浏览器与网络 (Web Browser)

| User Label | Usage Page | Usage ID (Hex) | Official Name | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Web/Home** / www_Home | `0x0C` | **223** | AC Home | 浏览器主页 |
| **Back** / www_Back | `0x0C` | **224** | AC Back | 后退 |
| **Forward** / www_F | `0x0C` | **225** | AC Forward | 前进 |
| **Www Stop** / www_stop | `0x0C` | **226** | AC Stop | 停止加载 |
| **Refresh** | `0x0C` | **227** | AC Refresh | 刷新 |
| **Search** / _Search | `0x0C` | **221** | AC Search | 搜索 |
| **Favorite** | `0x0C` | **22A** | AC Bookmarks | 收藏夹/书签 |

## 5. 应用启动与控制 (Application Launch & Control)

| User Label | Usage Page | Usage ID (Hex) | Official Name | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Email** | `0x0C` | **18A** | AL Email Reader | 打开邮件客户端 |
| **Calculator** | `0x0C` | **192** | AL Calculator | 打开计算器 |
| **My Compute** | `0x0C` | **194** | AL Local Machine Browser | 我的电脑/文件资源管理器 |
| **Open** | `0x0C` | **202** | AC Open | 打开文件 |
| **Close** | `0x0C` | **203** | AC Close | 关闭窗口/文件 |
| **Minisize** | `0x0C` | **206** | AC Minimize | 最小化窗口 |
| **Print_key** | `0x0C` | **208** | AC Print | 打印 (App Command) |
| **Copy** | `0x0C` | **21B** | AC Copy | 复制 |
| **Paste** | `0x0C` | **21D** | AC Paste | 粘贴 |
| **Rotate** | `0x0C` | **245** | AC Rotate | 旋转 |



---
**提示**: 
*   **AC** = Application Control (应用控制)
*   **AL** = Application Launch (应用启动)
*   如果要实现 "一键复制/粘贴"，推荐使用 Consumer Page 的 `AC Copy` / `AC Paste`，而不是模拟 `Ctrl+C` / `Ctrl+V`，因为前者兼容性更好且不依赖键盘布局。
