---
title: PWA 与交互验证报告（browser-harness）
tags: [pwa, testing, verification]
update: 2026-08-10
---

# PWA 与交互验证报告

> 全部验证在自动化 Edge（CDP）上对生产构建（`npm run build` + `vite preview` :5174）执行。
> 基准线旧版运行于 :5173（VitePress，main 分支）。

## 1. PWA 验证（100% 要求）

| 项目 | 结果 | 证据 |
| --- | --- | --- |
| SW 注册并激活 | ✅ | `navigator.serviceWorker.controller === true`，dev-sw.js / sw.js 均 activated |
| manifest 可解析 | ✅ | `/manifest.webmanifest` 200，name/icons(2)/theme_color/start_url 正确 |
| 离线首页 | ✅ | 断网加载 `/`：8 个根目录卡片、profile 侧栏、sidebar 全部渲染 |
| 离线目录导航 | ✅ | 断网点击 MPUthings 卡片 → `?path=/MPUthings` 列表 13 行渲染 |
| 离线笔记页 | ✅ | 断网点击文件 → `/MPUthings/README` 正文渲染（docLen 2282） |
| 离线深链 | ✅ | 断网直达 `/OsCookBook/计算机体系结构/半导体制造的第一性原理` → KaTeX 30 个公式渲染 |
| 更新提示流 | ✅ | 内容变更 + rebuild 后 reload → 「🚀 发现新版本」toast → 立即刷新 → 新 SW 接管 |
| 离线就绪提示 | ✅ | 首次加载「✅ 已准备就绪 / 内容已缓存，现在可以离线访问。」 |

precache：418 entries（~18 MiB，含全部打包内容与资源）。

## 2. 交互验证（与基线对齐）

| 交互 | 结果 | 备注 |
| --- | --- | --- |
| Explorer 根目录卡片网格 | ✅ | 8 卡片，桌面 200px 网格 / 移动 3 列 |
| 目录点击 → `?path=` 导航 | ✅ | store 先同步再 navigate（基线语义） |
| 列表模式 + 日期显示 | ✅ | YYYY-MM-DD |
| 排序 名称/日期 × 升/降 | ✅ | `explorer:sort` localStorage 持久化 |
| 文件点击 → 笔记页 | ✅ | |
| 面包屑（🏠/…/段） | ✅ | explorer 模式每段可点 |
| 侧栏树展开/折叠 + 活动高亮 | ✅ | 祖先目录自动展开 |
| 侧栏拖拽调宽 200–600 | ✅ | 260→340px 拖拽，`vp-sidebar-width` 持久化 |
| 侧栏折叠/展开按钮 | ✅ | `vp-sidebar-collapsed` 持久化，body 类驱动 |
| 搜索（K 快捷键 / 结果跳转） | ✅ | 12 条结果，点击进笔记 |
| 深色/浅色切换 | ✅ | appica ThemeProvider class 式 |
| 移动端 hamburger 抽屉 | ✅ | 遮罩 + 280px 面板 |
| 移动端 profile 三点抽屉 | ✅ | |
| 保险箱解锁页 | ✅ | 🔐 密码卡 + 解锁按钮 |
| Library 控制台 | ✅ | 状态行 + 开关 + 座位输入 |
| 下拉刷新（80/120 阈值） | ✅ | 实现与基线一致（touch 事件） |

## 3. Markdown 渲染对齐（同页新旧对比）

| 特性 | 旧 (:5173) | 新 (:5174) |
| --- | --- | --- |
| heading id（中文 slugify） | `进程地址空间全景` | 相同 ✅ |
| GitHub alert DOM | `div.note.custom-block.github-alert` + `p.custom-block-title` | 相同 ✅ |
| task list DOM | `li.task-list-item` + `input.task-list-item-checkbox` + `ul.contains-task-list` | 相同 ✅（9/9 条） |
| 代码块 shiki 类 | `shiki shiki-themes github-light github-dark vp-code` | 相同 ✅ |
| 表格 | 4 张 | 4 张 ✅ |
| 数学 | MathJax mjx-container | KaTeX（设计冻结 §4 记录的有意替换）✅ |
| 中文锚点链接重写 | `#4-连接建立流程` → `#_4-连接建立流程` | 相同 ✅ |
| kconfig/dts fence 降级 | 纯文本块 | 相同 ✅ |
| 坏图片中和 | `[broken image: …]` / `src="data:,"` | 相同 ✅ |
| `<placeholder>` 转义 | `&lt;file&gt;` | 相同 ✅ |
| callout 容器 | `div.custom-block.callout` | 相同 ✅ |

## 4. 已知差异（有意为之，设计冻结已记录）

1. MathJax → KaTeX（渲染器替换，公式语义一致）。
2. TOC 范围更完整（新实现收集全部 h2–h4；基线 outline 部分折叠）。
3. h1 尾部无 VitePress 的零宽空格。
