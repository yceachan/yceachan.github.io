# GitHub Pages 部署指南与 .gitignore 解析

本文档详细介绍了 `WikiExplorer` 项目所使用的 `.gitignore` 规则，并提供了将静态网站部署到 GitHub Pages 的完整工作流指南。

## 1. .gitignore 解析

项目复用了 Pages 工程根目录下的 `.gitignore` 文件，用于在扫描笔记时过滤敏感或不需要的文件。以下是核心规则的解析：

### 核心忽略规则
-   `**.gitignore`: 忽略 gitignore 文件本身。
-   `privateSync/`: **重要**，忽略包含私人同步数据的文件夹。
-   `pi-pwd.md` / `**密钥.md`: 忽略特定的敏感文件（密码、密钥）。
-   `UserTemp/`: 忽略临时用户目录。

### 开发与构建产物
-   `node_modules/`: 忽略 Node.js 依赖包。
-   `dist/` / `build/`: 忽略构建生成的静态文件目录（防止重复扫描）。
-   `WikiExplorer/public`: **自动添加**，忽略本项目生成的内容目录，防止无限递归。

### 系统与日志文件
-   `logs/`, `*.log`: 忽略日志文件。
-   `.DS_Store`: 忽略 macOS 系统文件。
-   `.env`: 忽略环境变量文件。

## 2. GitHub Pages 部署流程 (GitHub Actions)

我们将使用 GitHub Actions 实现自动化部署：每当你 Push 代码到仓库时，它会自动构建项目并将生成的网页发布到 GitHub Pages。

### 步骤一：准备仓库
1.  确保你的项目已推送到 GitHub 仓库。
2.  进入仓库 **Settings** -> **Pages**。
3.  在 **Build and deployment** 下，将 Source 设置为 **GitHub Actions**。

### 步骤二：创建 Workflow 文件
在项目根目录下创建 `.github/workflows/deploy.yml` 文件。

**注意**：由于你的 `package.json` 位于仓库根目录，Workflow 脚本中不需要执行 `cd WikiExplorer`。内容如下：

```yaml
name: Deploy WikiExplorer to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: true

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 步骤三：验证部署
1.  提交并推送 `.github/workflows/deploy.yml` 到 GitHub。
2.  观察仓库的 **Actions** 标签页。
3.  完成后，在 **Settings -> Pages** 中点击生成的链接访问。

## 3. 重要提示：数据可用性
由于你的 `sync-notes.js` 脚本会向上级目录搜索笔记：
- 如果你只将 `WikiExplorer` 的内容推送到仓库，CI 环境将无法找到 `../OsCookBook` 等文件夹，导致构建出的网页没有内容。
- **解决方案**：
    1.  将整个 `Workspace` 作为一个仓库推送。
    2.  或者将需要的笔记文件夹也移动/软链接到 `WikiExplorer` 目录下，并修改 `sync-notes.js` 的扫描路径。
