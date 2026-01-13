# WikiExplorer 开发实录

## 1. 项目初始化与基础架构
**目标**: 构建一个可视化的静态文件资源管理器，用于展示 Workspace 下的 Markdown 笔记。
- **技术栈**: Vite + React 18 + Tailwind CSS.
- **核心机制**: "构建时预处理"。使用 Node.js 脚本 (`scripts/sync-notes.js`) 扫描 Workspace，生成目录树索引 (`directory-tree.json`)，并将 Markdown 文件复制到 `public/notes` 目录。
- **路由**: 使用 React Router (`HashRouter`)，解决 GitHub Pages 的 SPA 路由问题。

## 2. Markdown 渲染优化
**目标**: 提升 Markdown 阅读体验，对齐主流文档站风格。
- **GFM 支持**: 使用 `remark-gfm` 支持表格、任务列表等 GitHub 风格语法。
- **HTML 支持**: 引入 `rehype-raw`，允许 Markdown 中混写 HTML。
- **代码高亮**: 集成 `react-syntax-highlighter`，采用 `atomOneDark` 主题。
- **自定义样式**: 创建 `src/markdown-styles.css`，借鉴 VitePress 的排版样式（字体、间距、引用块样式）。

## 3. 侧边栏导航 (Sidebar)
**目标**: 提供文件浏览和大纲跳转功能，类似 Typora。
- **双模式切换**: 
    - **文件 (Files)**: 显示当前目录下的同级文件和子目录。
    - **大纲 (TOC)**: 自动解析当前 Markdown 文档的 H1-H5 标题。
- **技术实现**:
    - 使用 `rehype-slug` 为标题自动生成锚点 ID。
    - 使用正则 `/^\s*(#{1,6})\s+(.*?)\s*$/gm` 全文扫描标题生成 TOC 数据。
    - 自定义排序逻辑：**文件夹优先**，其次按**名称升序**排列。

## 4. 全局 Profile 与布局调整
**目标**: 增强个人品牌展示，优化布局。
- **全局侧边栏**: 在页面左侧新增固定 Profile 栏，展示头像、简介、GitHub/Email 链接。
- **配置分离**: 个人信息提取到 `/author_profile/profile.json`，构建时自动注入。
- **布局重构**: 采用 Flex 布局，左侧为全局 Profile，右侧为主内容区。主内容区内部再次分割，Markdown 阅读器右侧放置“文件/大纲”侧边栏。

## 5. 智能扫描与过滤
**目标**: 精确控制展示内容，保护敏感目录。
- **递归扫描**: 脚本支持从 Workspace 根目录递归扫描。
- **规则集成**: 引入 `ignore` 库，直接读取并复用 Pages 工程根目录下的 `.gitignore` 文件。
- **自我保护**: 强制忽略 `WikiExplorer/public` 和 `dist` 等构建目录，防止无限递归。
- **Windows 兼容**: 在路径处理时强制将反斜杠 `\` 转换为正斜杠 `/`，确保忽略规则匹配正确。