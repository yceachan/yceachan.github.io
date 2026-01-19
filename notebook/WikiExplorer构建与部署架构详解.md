# WikiExplorer 最佳实践：构建与部署架构详解

> **摘要**：本文档详细阐述了 WikiExplorer 项目在 2026 年 1 月重构后的构建与部署架构。我们采用“源码与产物严格分离”的策略，配合配置化的扫描系统，实现了既优雅又高效的静态站点发布流程。

## 1. 核心架构：源码与产物分离

在旧版本中，`dist/` 构建产物和笔记副本直接混入 `main` 分支，导致 Git 仓库体积膨胀、历史混乱。新架构采用了严格的分离策略：

### 1.1 双分支模型
*   **`main` 分支 (Source)**:
    *   **内容**: 仅包含 React 源码、构建脚本、配置文件。
    *   **状态**: **纯净**。通过 `.gitignore` 严格忽略 `dist/` 和 `public/notes/`。
    *   **管理**: 由开发者手动通过 `git push` 维护，用于版本控制和功能开发。
*   **`page` 分支 (Artifact)**:
    *   **内容**: 仅包含构建后的静态资源 (`index.html`, `assets/`)、同步后的笔记数据、以及 CI/CD 配置。
    *   **状态**: **瞬态**。每次部署都会被强制覆盖 (`force push`)，不保留历史包袱。
    *   **管理**: 由 `do.bat` 脚本全自动维护，专门供 GitHub Pages 读取。

---

## 2. 笔记扫描系统 (Scanning System)

为了解决 `.gitignore` 黑名单模式在复杂 Workspace 下的局限性，我们引入了独立的配置化扫描系统。

### 2.1 配置文件 (`scan.config.js`)
项目根目录下新增了 `scan.config.js`，采用 **递归正则白名单** 策略：

```javascript
export default {
    // 白名单：只有匹配正则的 Markdown 文件才会被同步
    include: [
        /^Offerthings\/.*\.md$/,  // 递归扫描 Offerthings 下的所有 md
        /^Yichip\/.*\.md$/,       // 递归扫描 Yichip
        /^WikiExplorer\/.*\.md$/  // 包含项目自身的文档
    ],
    // 黑名单：最高优先级，直接阻断目录进入
    exclude: [
        /node_modules/,
        /^WikiExplorer\/dist/,    // 防止递归扫描构建产物
        /\.git/
    ]
};
```

### 2.2 同步逻辑 (`sync-notes.js`)
脚本不再依赖 `.gitignore`，而是直接读取上述配置：
1.  **Exclude 优先**: 遇到黑名单目录直接跳过，极大提升扫描效率。
2.  **递归遍历**: 默认进入所有非黑名单目录。
3.  **叶子过滤**: 只有路径匹配 `include` 规则的 `.md` 文件才会被复制到 `public/notes/`。

---

## 3. 自动化部署流程 (The `do.bat` Pipeline)

`do.bat` 是连接本地构建与云端发布的桥梁。新版脚本执行以下原子操作：

### Step 1: 本地构建与同步
```batch
call npm run build
```
执行 `sync-notes.js` 同步笔记，然后调用 Vite 打包生成 `dist/`。此时 `dist` 包含了完整的静态网站。

### Step 2: 注入 CI/CD 配置 (关键步骤)
```batch
xcopy /E /I /Y ".github" "dist\.github"
```
**技术难点解决**：
由于 `page` 分支是一个全新的孤儿分支，默认不包含 `.github/workflows`。
为了让 GitHub 能够触发 Action，我们必须在部署前将 Workflow 配置文件“偷渡”进 `dist/` 目录。

### Step 3: 临时仓库初始化
```batch
cd dist
git init
git add -A
git commit -m "Deploy..."
```
在 `dist/` 内部创建一个临时的 Git 仓库。这个仓库认为自己就是项目的根目录。

### Step 4: 强制推送 (SSH)
```batch
git push -f git@github.com:user/repo.git HEAD:page
```
利用 SSH 协议，直接将临时仓库的内容强制推送到远程的 `page` 分支。
*   **注意**：此过程完全绕过了 `main` 分支。

---

## 4. CI/CD 集成 (GitHub Actions)

为了进一步优化发布流程（或为了未来扩展），我们配置了 GitHub Action 监听 `page` 分支。

### 4.1 Workflow 配置 (`deploy.yml`)
由于 `page` 分支的根目录就是网站内容（没有 `dist/` 子文件夹），Action 配置进行了适配：

```yaml
on:
  push:
    branches: ["page"]  # 监听 page 分支

jobs:
  deploy:
    steps:
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'     # 直接上传根目录，而非 ./dist
```

### 4.2 触发逻辑闭环
1.  `do.bat` 推送 `page` 分支（包含 `deploy.yml`）。
2.  GitHub 检测到 `page` 分支更新且包含 Workflow 文件。
3.  GitHub Action 启动，将 `page` 分支内容发布到 GitHub Pages 服务器。

---

## 5. 开发者指南

### 常用指令

*   **常规部署** (更新了笔记后):
    ```powershell
    .\do.bat
    ```
    *构建并部署到 page 分支。不推送 main。*

*   **带备注部署**:
    ```powershell
    .\do.bat -m "新增了蓝牙协议栈笔记"
    ```
    *让部署历史更清晰。*

*   **仅本地构建** (测试/预览):
    ```powershell
    .\do.bat --nopush
    ```
    *生成 dist 但不推送。用于本地 `npm run preview`。*

### 维护注意
*   **功能开发**: 修改 React 代码后，请记得**手动**运行 `git add .`, `git commit`, `git push` 来更新 `main` 分支。`do.bat` **不再**负责源码的推送。
*   **环境要求**: 确保本地配置了 GitHub 的 SSH Key，否则推送过程可能会卡住等待密码。
