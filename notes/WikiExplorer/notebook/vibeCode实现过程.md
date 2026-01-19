# WikiExplorer (VibeCode) 开发日志：核心特性与架构演进

**版本**: v2.1 (Stability Rollback)
**日期**: 2026-01-19
**状态**: Stable / LaTeX Reverted to Standard

## 1. 项目愿景 (Vision)
WikiExplorer（开发代号 VibeCode）旨在为个人知识库提供一个**现代、美观且功能强大**的 Web 浏览界面。它保留了类似 IDE 的文件浏览体验，同时赋予了 Markdown 文档丰富的渲染能力。

---

## 2. 核心架构：三栏式布局 (The Tri-Pane Layout)

应用采用了三栏式布局设计，由 `App.jsx` 作为顶层协调者。

*   **Left (ProfileSidebar)**: 异步加载 `profile.json` 展示作者信息与社交链接。
*   **Center (Main Content)**: 动态切换 `ExplorerGrid` (目录) 与 `MarkdownViewer` (内容)。
*   **Right (Context Sidebar)**: 提供“同级文件导航”与“基于正则提取的 TOC 大纲”。

---

## 3. Markdown 渲染引擎技术栈

### 3.1 基础配置
*   **GFM**: 支持表格、任务列表等。
*   **Syntax Highlighting**: Prism.js + atomOneDark 主题。
*   **LaTeX Support**: 
    *   `remark-math`: 解析数学语法。
    *   `rehype-katex`: 转换为 HTML。
    *   `katex/dist/katex.min.css`: 样式注入。

### 3.2 实验记录：多行公式智能对齐 (已撤销)
**尝试**: 曾尝试通过自定义插件 `remarkMathEnhanced` 自动为包含换行的公式包裹 `aligned` 环境，以模拟 Typora 的宽松语法。
**结论**: 该方案在处理 `matrix`, `cases` 等复杂 LaTeX 环境时会产生嵌套语法冲突，导致渲染崩溃。
**决策**: 为了系统的健壮性，已回滚该插件。目前系统仅支持标准 LaTeX 语法。用户需显式使用 `\begin{aligned} ... \end{aligned}` 进行多行对齐。

---

## 4. 侧边栏与导航系统

### 4.1 智能 TOC (目录大纲)
系统在前端实时解析 Markdown 标题，生成 Slug 并支持平滑滚动跳转。

### 4.2 路由驱动的文件浏览器
`ExplorerGrid` 提供了基于路径的动态浏览，支持按名称或修改日期对文件和文件夹进行排序。

---

## 5. 总结
当前版本 (v2.1) 确立了以“稳定性”为核心的开发策略。虽然放弃了部分极致的自动化语法糖，但保证了对标准 LaTeX 和 Markdown 的完美兼容，能够稳健地展示各种复杂的专业笔记。
