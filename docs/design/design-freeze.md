---
title: 设计冻结 — React SPA + Appica UI + marked
tags: [design, react, appica, marked, pwa]
update: 2026-08-10
---

# 设计冻结：React SPA + Appica UI + marked

> 本文是本次重构的唯一权威设计契约。实现必须逐条对齐；与基线行为的任何偏差都必须在提交说明中显式记录。

## 1. 目标（Goal）

1. **去掉 VPS 层**：`KB_GIT/` 下的 bare 仓库直接部署在 WSL 本地；笔记仓库通过 local path 或 Windows→WSL SSH 推送，`post-receive` 钩子把指定子路径镜像进 `docs/<sync>`，不再依赖 VPS / GitHub Actions / Pages。
2. **迁移 UI**：React 19 SPA，UI 基础组件库 **Appica UI**（`@appica/ui-react`），Markdown 渲染器 **marked**。
3. **对齐基线**：`http://localhost:5173/`（VitePress 旧版，主仓库 main 分支）。所有 Markdown 渲染行为与基线一致，视觉表现力更进一步。
4. **交互留存**：profile、navbar、filetree 的全部交互特性原样保留。
5. **PWA 100% 可靠**：首次加载后完全离线可用，更新提示流程正确，用 browser-harness 充分测试。
6. **验收**：浏览器中 luna 视觉验收通过；worktree 上有清晰的 git 历史。

## 2. 架构决策（已冻结）

| 决策 | 结论 | 理由 |
| --- | --- | --- |
| 框架 | React 19 + Vite + TypeScript | Appica 硬性要求 React 19（ref-as-prop，无 forwardRef 垫片） |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite` 插件）+ `@appica/ui-react/styles.css` | Appica 唯一支持方式；`@source` 必须指向 `node_modules/@appica/ui-react/dist` |
| 路由 | react-router（BrowserRouter），URL 方案与基线一致 | 保持 `/?path=`、`/保险箱?target=` 等既有 URL 语义 |
| 内容源 | 构建期 `import.meta.glob('../docs/**/*.md', {query:'?raw'})` 打包进 bundle | PWA 离线 100%：内容在 precache 内，不依赖运行时 fetch |
| 文档树/mtime | 自写 Vite 插件 `docMetaPlugin` 输出 `virtual:doc-meta`（path→mtime，git log 优先） | 保留 Explorer 按日期排序特性 |
| Markdown | marked 18 + 自定义扩展（见 §4） | 对齐基线的全部打磨项 |
| 代码高亮 | shiki，`github-light` + `github-dark` 双主题，`defaultColor:false` + CSS 自适应 | 与基线（VitePress 默认 shiki 双主题）视觉一致 |
| 数学 | KaTeX 0.17（`marked-katex-extension`） | 基线上 MathJax3；渲染行为（公式可读）一致，KaTeX 更快更现代。**记录为有意的渲染器替换** |
| Mermaid | mermaid 11，`mermaid.run()` 运行时水合 | 与基线一致 |
| 搜索 | 运行时从打包内容构建 MiniSearch 索引；Navbar `K` 快捷键聚焦 | 保留基线 navbar 搜索交互（VitePress local search 即 MiniSearch） |
| 状态 | zustand（explorer store / vault store），localStorage key 与基线完全同名 | `explorer:sort`、`vp-sidebar-width`、`vp-sidebar-collapsed` |
| 主题 | Appica `ThemeProvider` + `useTheme`，class 式 dark；storageKey 迁移兼容（先读 `vitepress-theme-appearance`） | 保留基线深色模式 |
| PWA | vite-plugin-pwa 1.3，`registerType:'prompt'`，`virtual:pwa-register/react` | 与基线同样的「发现新版本 → 提示刷新」流程 |
| 路由表 | `/` Explorer 首页；`/:path*` 笔记页；`/保险箱` PrivateVault；`/library` Library 控制台 | 基线里这两个路由是死路由（文件不存在），SPA 补成真实路由（组件已存在） |

## 3. 路由与页面（冻结）

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/`（可带 `?path=`） | ExplorerPage | 目录浏览；`?path=` 为当前目录，query 变化必须触发视图刷新（基线的坑） |
| `/{dirs...}/{note}` | NotePage | 笔记渲染：面包屑 + frontmatter 块 + Markdown + 右侧 TOC + 底部版权 |
| `/保险箱`（可带 `?target=`） | PrivateVault | 密码解锁 → 文件树 + 预览；`?target=` 自动展开定位 |
| `/library` | LibraryPage | 图书馆预约控制台（Aliyun FC） |
| 任意含 `/98-Private/` 的链接 | 全局拦截 | `window.location.href = '/保险箱?target=...'`（基线行为，保留） |

## 4. Markdown 渲染管线（冻结，与基线逐项对齐）

`src/lib/markdown.ts` 单例 `new Marked()`，模块级 `use` 配置一次。

### 4.1 slugify（heading id 与锚点链接共用，与基线完全一致）

```ts
raw.trim().toLowerCase()
  .replace(/[\s.:：()（）%]+/g, '-')   // 空格 点 冒号(中英) 括号(中英) 百分号 → '-'
  .replace(/-+/g, '-')                  // 连续横线合并
  .replace(/^-+|-+$/g, '')              // 去首尾横线
// 数字开头 → '_' 前缀
```

### 4.2 渲染规则清单（每条都必须实现）

1. `gfm: true`，`breaks: false`；heading renderer 输出 `id=slugify(内联文本)`。
2. link renderer：内部 `#hash` 锚点链接（非 http、含 `#`）→ 用同一 slugify 重写 hash。
3. code renderer：
   - `mermaid` fence → `<div class="mermaid">转义源码</div>`，DOM 插入后 `mermaid.run()`；
   - 语言 ∈ `{kconfig,dts,devicetree,cfg,ld,assembly,pwsh,pfofile}` → 降级 `txt`（无高亮）；
   - 其余语言 → shiki `codeToHtml`（github-light/github-dark 双主题，`defaultColor:false`），结构 `<pre class="shiki shiki-themes github-light github-dark vp-code">`。
4. 裸 `<placeholder>` 标签（不在 SAFE_INLINE_HTML 白名单内）→ 转义为文本实体；白名单 = 基线 SAFE_INLINE_HTML 集合。
5. 坏图片中和：src 匹配 `^(?:[a-zA-Z]:(?:[\\/]|%5[Cc]|%2[Ff])|file:|\\\\|\/(?:home|Users|mnt|root|tmp)\/)` → md 图片转 `[broken image: alt]` 文本；HTML img 的 src 改写为 `data:,`。
6. GitHub alerts（`> [!note|tip|important|warning|caution]`）：自写 marked 扩展，输出与基线 DOM 一致的结构 `div.{type}.custom-block.github-alert` + `p.custom-block-title` + octicon SVG + 大写类型名；样式复制基线颜色（note #0969da / tip #1a7f37 / warning #9a6700 / important #8250df / caution #d1242f；dark 变体）。
7. Task lists：marked gfm 自带；CSS 补基线同款 `li.task-list-item` / `input.task-list-item-checkbox` 外观。
8. `:::callout <icon>` 容器：自写 block 扩展 → `div.custom-block.callout` + `span.callout-icon` + `div.callout-content`（基线 markdown-it-container 同款 DOM/CSS）。
9. `$$...$$` / `$...$` → KaTeX（`marked-katex-extension`，`throwOnError:false`），引入 `katex/dist/katex.min.css`。
10. 输出经 DOMPurify sanitize 后 `dangerouslySetInnerHTML`（`ADD_TAGS:['mermaid']`）。
11. YAML frontmatter：NotePage 用 `FrontmatterBlock` 展示（键过滤 `HIDE_KEYS` 与基线一致，序列化规则一致）；渲染正文前剥离。
12. 图片 medium-zoom：`.vp-doc img`（即 Markdown 容器），路由变化后重初始化，背景 `var(--vp-c-bg)`。
13. 标题 id 注册给右侧 TOC（appica Toc / IntersectionObserver 滚动监听，与基线 outline 行为一致）。

## 5. 组件清单（Vue → React 映射，冻结）

| 基线组件 | React 实现 | 关键交互（必须留存） |
| --- | --- | --- |
| Explorer + ExplorerList/Item/TopBar | `ExplorerPage` + `ExplorerTopBar` + `ExplorerList` + `ExplorerItem` | 根目录 icon 卡片网格（200px 卡 / 移动端 92px），子目录 list 行；目录点击先同步 store 再 `/?path=`；日期列 YYYY-MM-DD；排序（名称/日期 × 升/降，ASCII 优先 + `zh-Hans-CN` localeCompare，目录恒前） |
| ExplorerBreadcrumb | `ExplorerBreadcrumb` | 🏠 首页；`context=doc/explorer` 双模式；>3 段折叠省略；explorer 模式每段可点 |
| SortControl | `SortControl` | 名称/日期 select + ↑↓ 切换；写 `explorer:sort` |
| NavLeftActions | `NavLeftActions` | Back（隐藏路径集合与基线一致）/Home；移动端隐藏 |
| ProfileSidebar / ProfileToggle / SidebarProfileWrapper | `ProfileSidebar` + `ProfileToggle` + wrapper | 桌面固定于侧栏位（仅 explorer 首页）；移动端 280px 抽屉 + 遮罩 + 0.3s 动画；3 点按钮移动端显示；联系链接推导规则（mailto / github 名 / repo 尾段 / friend 首段） |
| Layout（侧栏拖拽 + 折叠） | `SidebarResizeHandle` | `vp-sidebar-width` CSS 变量驱动；200–600px 钳制；`vp-sidebar-collapsed` 持久化；拖动时 body.vp-resizing；折叠按钮 ‹/› |
| FileTreeNode（保险箱树） | `FileTreeNode` | 目录展开/折叠（写入 node.expanded）；缩进 (depth*16)+8/24；active 高亮 + 右 3px 边 |
| PrivateVault | `PrivateVault` | 解锁（FC POST）；树 + 预览；可拖动切换按钮（>5px 为拖动、40px 边界钳制）；侧栏 150–500px 拖宽；`?target=` 自动定位；`*(Loading...)*` / `> ❌ Error loading content` 兜底 |
| LibraryControl | `LibraryPage` | status/toggle/set-seat 三个 action；消息 3000ms 自动消失；Enter 提交 |
| PwaReload | `PwaReload` | `useRegisterSW()`；offlineReady「已准备就绪」/ needRefresh「发现新版本」+ 立即刷新/稍后 |
| PullToRefresh | `PullToRefresh` | 80/120 阈值、0.5 阻尼；排除 `.VPSidebar` 等区域（等价新选择器）；500ms 后 reload |
| FrontmatterBlock | `FrontmatterBlock` | HIDE_KEYS、序列化规则与基线一致 |
| Copyright | `Copyright` | sidebar / doc 两个 placement |
| explorerStore | zustand `useExplorerStore` | `currentPath / sortKey / sortOrder / profileOpen` |
| privateStore | zustand `useVaultStore` | `isUnlocked / token / fileList / currentDoc`（不持久化） |

## 6. PWA 规范（冻结）

- `registerType:'prompt'`；`virtual:pwa-register/react` + `workbox-window` devDep。
- manifest：name/short_name 取 profile；`theme_color:'#ffffff'`；icons `profile-photo-192.jpg`/`512.jpg`；`scope/start_url/id:'/'`；display standalone。
- workbox：`globPatterns:['**/*.{js,css,html,json,svg,png,ico,jpg,woff2}']`（内容已打包进 JS chunk，全部 precache）；`maximumFileSizeToCacheInBytes:10*1024*1024`；`navigateFallback:'index.html'` + `navigateFallbackAllowlist:[/^\/$/]`（SPA 深链离线可用，且不劫持非导航请求）；`cleanupOutdatedCaches:true`。
- `devOptions:{enabled:true}`（dev 也可测 SW）。
- 更新流：SW 进入 waiting → needRefresh → 弹「发现新版本」→ 立即刷新 `updateServiceWorker(true)`；首次注册 → offlineReady「内容已缓存，现在可以离线访问」。
- 测试清单（browser-harness）：manifest 可解析；SW 注册成功且 activated；precache 清单含全部关键资源；**offline（Network.emulateNetworkConditions）下刷新仍完整可用**；深链离线可打开；needRefresh 流程（改代码重构建后出现提示）。

## 7. KB_GIT 本地部署（冻结）

- bare 仓库仍在 `KB_GIT/<repo>`，**本地 WSL 直接可用，无 VPS**。
- `push.sh`：`git push` 到 GitHub 改为可选 —— 仅当 `KB_PUSH_REMOTE` 环境变量存在时才推送；默认本地模式只 commit 不进远端。
- `post-receive`：同步后若 `KB_AUTO_BUILD=1`，在 ea-kb 根执行 `npm run build`（SPA 内容打包进产物），否则文档提示手动 build。
- 客户端推送方式（README 更新）：
  - WSL 内：`git remote add kb /home/pi/work/ea-kb/KB_GIT/<repo>`（local path）；
  - Windows：`ssh yceachan@localhost -p <port>` 指向 WSL sshd（WSL2 localhost 转发），或 `\\wsl.localhost\<distro>\home\pi\work\ea-kb\KB_GIT\<repo>`。
- 钩子逻辑（worktree add + lfs smudge + rsync 镜像 + 可选 build）不动，仅上述两处调整 + README 改写为本地部署语义。

## 8. 视觉方向（在基线上「更进一步」）

- 保持信息架构：左侧文件树 / 顶栏 / Explorer 首页 / 笔记页。
- 设计语言：Appica token（oklch），主色保留蓝/靛蓝家族（与基线品牌色相近但更细腻），全面支持深色模式。
- 提升点：文件树 hover/active 微交互；Explorer 卡片柔和阴影 + 悬停抬升；代码块圆角/边框细化；面包屑 chip 化；导航栏毛玻璃；PWA toast 采用 Appica Toast 组件；空状态/加载骨架（appica Skeleton）。
- 验收方式：新旧同页截图，luna 视觉对比，要求「渲染行为对齐 + 视觉更精致」。

## 9. 验证计划（冻结）

1. `npm run build` + `vite preview`（新端口 5174），与 :5173 基线同页对比。
2. browser-harness 交互测试：文件树展开/折叠、排序切换、面包屑导航、侧栏拖宽/折叠、profile 抽屉、深色切换、搜索、保险箱解锁流（可 mock）、PWA 离线。
3. luna 视觉验收（基线 3 张 + 新实现同场景截图对比）。
4. 全部通过后按 §7 提交 KB_GIT 本地部署文档，git 历史按功能分 commit。

## 10. 已冻结的版本

| 包 | 版本 |
| --- | --- |
| react / react-dom | ^19 |
| @appica/ui-react | ^1.0.0 |
| tailwindcss / @tailwindcss/vite | ^4 |
| marked | ^18 |
| marked-katex-extension | ^5.1.10（katex 锁 ^0.17，勿用 0.18） |
| katex | ^0.17.0 |
| mermaid | ^11.16 |
| dompurify | ^3 |
| shiki | ^3（github-light/github-dark） |
| vite-plugin-pwa | ^1.3.0 |
| workbox-window | latest |
| minisearch | ^7 |
| zustand | ^5 |
| react-router-dom | ^7 |
