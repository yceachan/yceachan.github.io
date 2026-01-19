# WikiExplorer 技术栈详解

## 1. 核心框架
- **Vite**: 构建工具，提供极速的 HMR 和构建优化。
- **React 18**: UI 库，利用 Hooks 管理状态（路由、TOC、排序）。
- **React Router v6**: 路由管理，使用 `HashRouter` 兼容 GitHub Pages。

## 2. 样式与 UI
- **Tailwind CSS**: 原子化 CSS 框架，用于构建 Grid 布局、Flex 结构和响应式界面。
- **Custom CSS**: `src/markdown-styles.css`，用于定制 Markdown 内容的排版（字体、行高、表格样式），模仿 VitePress/GitHub 风格。

## 3. Markdown 生态
- **react-markdown**: 核心渲染组件。
- **remark-gfm**: 支持 GitHub Flavored Markdown (表格、删除线、任务列表)。
- **rehype-raw**: 支持渲染 Markdown 中的原始 HTML 标签。
- **rehype-slug**: 自动为标题生成 `id` 属性，实现锚点跳转。
- **react-syntax-highlighter**: 代码块语法高亮，使用 `atomOneDark` 主题。

## 4. 构建与数据处理 (Node.js Scripts)
- **fs-extra**: 增强的文件系统操作（递归复制、清空目录）。
- **ignore**: 解析 `.gitignore` 规则，实现符合 Git 标准的文件过滤。
- **path**: 处理跨平台路径问题（特别是 Windows 反斜杠的标准化）。
- **Build Flow**:
    1. 读取 `author_profile/profile.json`。
    2. 加载根目录 `.gitignore`。
    3. 递归扫描 Workspace，生成 `directory-tree.json`（包含文件类型、mtime、路径）。
    4. 搬运 `.md` 文件和 Profile 资源到 `public/`。

## 5. 部署
- **GitHub Actions**: 自动化 CI/CD。
- **GitHub Pages**: 静态托管服务。