# SPA 原理与 dist 结构解析：为什么只有一个 index.html？

作为前端新手，看到 `dist/` 目录下只有一个内容空空如也的 `index.html` 可能会感到困惑。这其实是现代 **单页应用 (Single Page Application, SPA)** 的标准形态。

## 1. 传统的网页 vs. 现代 SPA

### 传统多页应用 (Multi-Page Application)
*   **模式**：每个页面对应一个 `.html` 文件（如 `home.html`, `about.html`）。
*   **跳转**：点击链接 -> 浏览器向服务器请求新的 HTML -> 页面完全刷新（白屏一下）-> 加载新页面。
*   **缺点**：体验不流畅，重复加载公共资源（如导航栏、侧边栏）。

### 现代单页应用 (SPA) - 也就是 WikiExplorer
*   **模式**：**整个网站只有一个 HTML 文件 (`index.html`)**。
*   **跳转**：点击链接 -> **JavaScript 拦截跳转** -> JS 计算出新页面该显示什么内容 -> JS 修改 DOM（页面元素） -> 页面局部更新。
*   **优点**：切换如丝般顺滑，没有白屏，像原生 App 一样。

## 2. 你的 `index.html` 到底在干嘛？

让我们逐行分析这个“空壳”：

```html
<body>
  <!-- 这是一个空的容器 -->
  <div id="root"></div>
</body>
```

这个 `div id="root"` 就是舞台。一开始它是空的。

```html
<script type="module" crossorigin src="./assets/index-BeeHAeVG.js"></script>
```

**这一行才是主角！** 它引入了打包后的 JavaScript 文件（React 代码）。

**浏览器的执行过程：**
1.  浏览器加载 `index.html`，显示白板（或者背景色）。
2.  浏览器下载并执行 `assets/index-xxx.js`。
3.  **React 启动**：React 代码接管页面，找到 `id="root"` 的 div。
4.  **内容注入**：React 根据当前的 URL（比如 `/OsCookBook`），动态生成侧边栏、网格、文章内容等 HTML 元素，并**塞进** `root` div 里。
5.  **用户看到页面**。

这一切通常在毫秒级完成，所以你感觉不到它是“后塞进去”的。

## 3. `dist/` 目录结构详解

构建完成后，你的 `dist` 目录通常长这样：

```
dist/
├── index.html          # 入口（空壳）
├── profile.json        # 数据：你的个人信息
├── directory-tree.json # 数据：笔记目录索引
├── profile-photo.jpg   # 资源：头像
├── notes/              # 资源：你的所有 Markdown 文件
└── assets/             # 核心代码
    ├── index-BeeHAeVG.js   # 逻辑：React + 你的业务代码 (被压缩混淆过)
    └── index-BFfGqFUj.css  # 样式：Tailwind + 自定义 CSS (被压缩过)
```

*   **HTML**: 只负责把 JS 引进来。
*   **JS**: 负责干活（渲染页面、处理点击、请求数据）。
*   **JSON/Notes**: 负责提供数据。

## 4. 性能与内存优化：为什么不会“卡顿”？

如果你的知识库有 1000 篇笔记，WikiExplorer 会把它们全部塞进浏览器内存吗？**绝对不会。**

项目采用了 **“按需加载 (Lazy Loading)”** 策略：

### 4.1 索引与内容分离
*   **启动阶段 (轻量)**：网页启动时只下载 `directory-tree.json`。这个文件只记录了文件名和路径，就像一本书的“目录”，体积很小。React 拿到目录后，瞬间就能画出左侧导航栏。
*   **阅读阶段 (按需)**：只有当你真正点击某篇笔记时，`MarkdownViewer` 组件才会执行 `fetch('/notes/xxx.md')`。此时，浏览器才去下载那一篇笔记的文本内容。

### 4.2 内存管理
*   **内存中只保留“当前”**：浏览器内存中始终只保存整套目录结构（索引）和你**当前正在阅读**的那一篇笔记。当你切换到下一篇时，上一篇的文本会被 JavaScript 的垃圾回收机制释放。
*   **静态资源分流**：由于 `.md` 文件是存放在 `public/notes` 下的静态资源，它们不参与 JS 代码的打包过程。这意味着你的代码包（`index.js`）体积保持恒定，不会随着笔记数量的增加而膨胀。

## 5. 总结

`index.html` 之所以简洁，是因为它不再承载**内容**，而是承载**程序**。


