# Current-App Behavior Inventory — VitePress Knowledge Base

Target for 1:1 re-implementation as a React SPA.
Source repo: `/home/pi/work/ea-kb` (branch `main`, clean tree). All paths below are relative to `docs/` unless noted. All claims verified from file contents; citations are `file:line`.

---

## 0. Global Architecture & Route Map

### Route / page map

| Route | Content |
| --- | --- |
| `/` (index.md) | Explorer UI. `index.md` has `layout: doc`, `outline: false`, `lastUpdated: false`, `editLink: false`, and mounts `<Explorer />` via inline `<script setup>` (`index.md:1-13`) |
| `/保险箱` | Intended PrivateVault page — **file does not exist** in repo or git history (verified `git show HEAD:docs/保险箱.md` fails; SIDEBAR_EXCLUDE in `config.mts:47` lists `保险箱.md`/`library.md` as expected-but-missing). PrivateVault is only reachable via the global click interceptor (see §14.1), which `window.location.href`-navigates there; currently a dead route in practice |
| `/library` | Intended LibraryControl page — same situation, file missing |
| `/98-Private/*` | No real docs exist (dir absent). Sidebar builder skips `98-Private/` (`config.mts:67`). All links containing `/98-Private/` are intercepted globally (§14.1) |
| everything else | Normal VitePress doc pages (MPUthings, MCUthings, OsCookBook, Protocol, lang, changelog, `所以后来我放弃了半导体/`) |

### Theme layout wiring (`theme/index.ts`)

- `Layout` = `PullToRefresh` wrapping `DefaultTheme.Layout` with slot injections (`index.ts:27-35`):
  - `nav-bar-content-before` → `<NavLeftActions>`
  - `layout-bottom` → `[<Layout/>, <SidebarProfileWrapper/>]` (Layout.vue = sidebar resize handle + PwaReload; SidebarProfileWrapper = fixed profile sidebar on explorer home)
  - `sidebar-nav-after` → `<Copyright placement="sidebar"/>`
  - `doc-before` → `[<ExplorerBreadcrumb/>, <FrontmatterBlock/>]`
  - `doc-after` → `<Copyright placement="doc"/>`
- `enhanceApp` registers global component `CryptoPrice` (`index.ts:94-96`).
- GitHub-alert CSS imported globally: `markdown-it-github-alerts/styles/github-base.css`, `github-colors-light.css`, `github-colors-dark-class.css` (`index.ts:7-9`).

### Persistent state keys (complete list)

| localStorage key | Written by | Value format | Default |
| --- | --- | --- | --- |
| `explorer:sort` | SortControl.vue:23, read Explorer.vue:38 | `"<sortKey>:<sortOrder>"` e.g. `name:asc` | `name:asc` |
| `vp-sidebar-width` | Layout.vue:121 | integer px string | `260` |
| `vp-sidebar-collapsed` | Layout.vue:50 | `"true"` / `"false"` | absent = expanded |

No other persistence keys exist (PrivateVault token is **not** persisted — in-memory only).

---

## 1. Explorer.vue (docs/.vitepress/components/Explorer.vue)

**Purpose:** Full-page explorer overlay for the home route. Fixed-position panel below navbar, right of sidebar.

**State:** Uses global reactive `explorerStore` (`explorerStore.ts:1-8`): `currentPath: '/'`, `sortKey: 'name'|'date'`, `sortOrder: 'asc'|'desc'`, `profileOpen: boolean`.

**URL sync (the tricky part):**

- `syncPathFromUrl()` reads `?path=` query param, falls back `'/'` (lines 18-23).
- VitePress keeps the Explorer mounted across `/?path=X` → `/?path=Y` (same route, query-only change); `onMounted` fires once, `popstate` only covers back/forward. Fix: wraps `router.onAfterRouteChange` to re-read the query on every route change (lines 26-32); restored on unmount (lines 47-52).
- `popstate` listener registered at module top-level (lines 54-56) — added **outside** lifecycle, never removed.
- `onMounted` (lines 34-45): adds `document.documentElement.classList.add('is-explorer')`; reads `localStorage['explorer:sort']`, splits on `:`, validates key ∈ {name,date} and order ∈ {asc,desc} before applying. `onUnmounted` removes the class (line 49).

**Layout/CSS (scoped):**

- `.explorer-page`: `position: fixed; top: var(--vp-nav-height); left: var(--vp-sidebar-width, 238px); right: 0; bottom: 0; display:flex; background: var(--vp-c-bg); z-index: 30` (lines 61-70; comment: above LocalNav, below VPSidebar 32).
- `@media (max-width: 959px)`: `left: 0` full screen (lines 74-76).

**Global CSS side effects when mounted** (in `theme/style.css`):

- `html.is-explorer .VPSidebar > .nav { display: none !important }`
- `html.is-explorer .VPSidebar { display:flex; flex-direction:column }`
- `html.is-explorer .VPDoc { padding: 0 !important }`, `.VPDoc .container { max-width: 100% !important }`, `.VPDoc .content { padding: 0 !important }`
- `html.is-explorer .nav-left-actions { display: none !important }`
(all at style.css lines 196-210)

---

## 2. ExplorerList.vue

**Purpose:** Lists files/dirs of the current explorer path.

**Data source:** `import docTree from 'virtual:doc-tree'` (line 13-16) — build-time virtual module from `plugins/docTreePlugin.ts`.

**DocNode shape** (`docTreePlugin.ts:7-13`): `{ name, path, rawName, type: 'file'|'dir', mtime: number, children?: DocNode[] }`.

**Doc-tree generation rules** (`docTreePlugin.ts`):

- `virtual:doc-tree` resolves to a JSON-export JS module (lines 31-63).
- Walks `docs/` (dir above `docs/.vitepress/plugins`), excludes `/^\./` (dotfiles), `/^public$/`, and `/(^|\/)index\.md$/` (lines 53-55).
- Dir node `mtime` = max of children mtimes (line 42); file `mtime` = `git log -1 --format=%ct` in ms, fallback `fs.statSync().mtimeMs` (lines 9-21).
- File nodes: `.md` extension stripped from both `name` and `path`; dirs with 0 children are dropped (lines 35-49).

**Navigation/listing logic:**

- `findNodeByPath(tree, path)`: splits path, walks dirs by `rawName`; `''` or `'/'` → root (lines 20-30).
- `currentNodes` computed (lines 36-65): splits into dirs/files, sorts each with `nameCmp` — ASCII chars sort first, then `localeCompare(name, 'zh-Hans-CN')` (lines 41-46); if `sortKey === 'date'` sorts by `mtime` ascending. If `sortOrder === 'desc'`, each group is reversed separately. Final list = `[...dirs, ...files]` (dirs always first).
- `isRoot` = `currentPath` is `'/'` or `''` (lines 67-71).

**Template:** empty → `.empty-state` "该目录下没有文件" (line 5); else `.explorer-grid` (class `is-root-grid` when root) of `<ExplorerItem :node :mode="isRoot ? 'icon' : 'list'">` (lines 6-13).

**CSS:** `.explorer-main` flex column, `overflow-y: auto`, `padding: 16px 24px`. Grid: `display:flex; flex-direction:column; gap:4px`; `.is-root-grid`: `display:grid; grid-template-columns: repeat(auto-fill, 200px); gap:16px`. `@media (max-width: 959px)` root grid: `repeat(auto-fill, minmax(92px, 1fr)); gap:10px` (lines 74-98).

---

## 3. ExplorerItem.vue

**Purpose:** One row (list mode) or one card (icon mode) in the explorer.

**Props:** `node: DocNode` (required), `mode?: 'list' | 'icon'` default `'list'` (lines 20-21).

**Rendering:** emoji icon `📂`/`📄`; name with `title` attr; date shown only in list mode when `node.mtime` exists — formatted `YYYY-MM-DD` zero-padded (lines 23-30). No time component.

**Interactions:**

- Whole row clickable (line 1 `@click`).
- Dir click (lines 33-37): sets `explorerStore.currentPath = node.path` **synchronously first** (comment: `router.onAfterRouteChange` occasionally doesn't fire on query-only change), then `router.go('/?path=' + encodeURIComponent(node.path))`.
- File click (line 38): `router.go(withBase(node.path))` — plain doc navigation, no query param.

**CSS (class names that matter):**

- `.explorer-item`, `.is-icon` variant; `.icon` (emoji), `.name-container`, `.name`, `.date`.
- List mode: `display:flex; padding:8px 12px; border-radius:6px; cursor:pointer; user-select:none; transition: background-color 0.2s`; hover `background: var(--vp-c-default-soft)`.
- Icon mode (desktop, lines 49-85): flex column centered, `min-height:200px; height:200px; padding:16px 12px; border:1px solid var(--vp-c-divider); background: var(--vp-c-bg-soft)`; icon absolutely centered, `font-size:68px`; name clamped to 2 lines via `-webkit-line-clamp: 2` with CSS vars `--icon-name-font-size:16px`, `--icon-name-line-height:1.35`, `--icon-name-lines:2`.
- `@media (max-width: 959px)` icon mode (lines 90-104): `min-height:92px; height:auto; padding:10px 6px`; icon static, `font-size:28px; margin-bottom:8px`; name `font-size:13px`.

---

## 4. ExplorerTopBar.vue

**Purpose:** Top bar of the explorer: `[ProfileToggle] [ExplorerBreadcrumb context="explorer"] [spacer] [SortControl]` (lines 1-8).

**CSS:** `.explorer-topbar`: `flex-shrink:0; border-bottom:1px solid var(--vp-c-divider); padding:12px 24px; display:flex; align-items:center; gap:12px`. Mobile `@media (max-width:959px)`: `padding:12px 16px`.

---

## 5. ExplorerBreadcrumb.vue

**Purpose:** Breadcrumb trail. Rendered twice on the home page: once inside ExplorerTopBar (`context='explorer'`), once via the theme `doc-before` slot (`context='doc'`, default). The doc-slot instance is suppressed on the explorer page to avoid duplication (lines 19-27).

**Props:** `context?: 'doc' | 'explorer'` default `'doc'`.

**Behavior:**

- Home icon `🏠` clickable → `go('/')` (line 4).
- `visibleSegments` (lines 38-57): path split on `/`, each segment `decodeURIComponent`-ed. `isCurrent` = last segment **and not explorer mode** (md pages: file itself is a non-clickable current crumb; explorer mode: every segment clickable). ≤3 parts → all shown; >3 parts → `[ellipsis '...' with full path title, second-to-last, last]`.
- `go(path)` (lines 62-67): in explorer mode syncs `explorerStore.currentPath` first, then `router.go('/?path=' + encodeURIComponent(path))`.
- `fullPath` (lines 29-34): explorer mode → `explorerStore.currentPath`; doc mode → `route.path` minus `.html`.
- `shouldShow` (lines 21-27): doc context on explorer page → false; else visible when segments exist (or always for explorer context).

**CSS:** `.breadcrumb` (font 16px, nowrap, overflow hidden), `.crumb-item` (color var(--vp-c-text-2), hover → brand), `.crumb-item.text` `max-width:120px` ellipsis, `.separator` `margin: 0 6px`, `.ellipsis` cursor default, `.crumb-item.current` (text-1, weight 600, cursor default). All transitions 0.2s.

---

## 6. FileTreeNode.vue (private vault tree)

**Purpose:** Recursive tree node for the PrivateVault sidebar.

**Props:** `node: PrivateFile`, `depth?: number`, `currentPath?: string`. **Emits:** `select(node: PrivateFile)`.

**State:** `isExpanded` ref — init from `node.expanded` if defined else `false` (line 17); `watch(node.expanded)` syncs external changes (auto-expand during target navigation) (lines 20-25).

**Interactions:**

- Dir label click → `toggle()`: flips local `isExpanded` **and writes back** `node.expanded` (lines 27-34).
- File row click → `emit('select', node)`.
- Padding: dir label `(depth*16)+8px`; file row `(depth*16)+24px` (inline styles, lines 47/74).

**CSS classes:** `.tree-node`, `.tree-folder-label` (13px, weight 600, text-2, hover bg-mute/text-1), `.tree-children` (`v-show`), `.tree-item` (14px, hover bg-mute; `.active` = `background: var(--vp-c-brand-dimm); color: var(--vp-c-brand); font-weight:600; border-right:3px solid var(--vp-c-brand)`), `.icon`, `.text` (ellipsis), `.arrow` (10px, `transition: transform 0.2s`, `.arrow.expanded { transform: rotate(90deg) }`).

---

## 7. BackToExplorerButton.vue

**Purpose:** "同级目录" link in the doc page area (rendered where used; note: **not wired into theme slots in current theme/index.ts** — component exists and is self-contained but is not referenced anywhere in theme/index.ts or Layout.vue; check for direct use before porting).

**Behavior:**

- `HIDDEN_PATHS = ['/', '/index', '/保险箱', '/保险箱.html', '/library', '/library.html']` (line 14) — hidden on those.
- `visible` = current route path (minus `.html`) not in HIDDEN_PATHS.
- `parentPath` = all segments except last (lines 23-27).
- `targetHref` = `withBase('/?path=' + encodeURIComponent(parentPath))`, or `withBase('/')` if no parent.
- Click: `preventDefault` + `router.go(targetHref)`.

**CSS:** `.back-to-explorer` (14px, weight 500, `height: var(--vp-nav-height)`, hover brand), `.icon` `↰` 18px margin-right 4px, `.label`. `@media (max-width:959px)`: `.label { display:none }`, `.icon { margin-right:0 }`.

---

## 8. SortControl.vue

**Purpose:** Sort key select + order toggle in ExplorerTopBar.

**Interactions:**

- `<select v-model="explorerStore.sortKey">` options: `name`→"名称", `date`→"日期"; `@change` saves (lines 2-7).
- Order button toggles `asc`↔`desc`; label `↑`/`↓`; title "升序"/"降序" (lines 8-10).
- `save()` writes `localStorage.setItem('explorer:sort',`${sortKey}:${sortOrder}`)` (lines 22-24).

**CSS:** `.sort-control` — pill: `display:flex; gap:4px; background: var(--vp-c-default-soft); border-radius:6px; padding:2px 4px`, CSS vars `--sort-item-width:7ch; --sort-item-px:1ch`. `.sort-select` transparent, 13px, `min-width: var(--sort-item-width)`. `.sort-order` transparent, hover `background: var(--vp-c-default-mute)`.

---

## 9. LibraryControl.vue

**Purpose:** "图书馆预约控制台" — controls a remote library-seat auto-reservation trigger via Aliyun FC HTTP endpoint.

**Constants (lines 4-5):** `FC_URL = 'https://libraryion-ctrl-gvjqodsukd.cn-hongkong.fcapp.run/'`, `SEAT_OFFSET = 101267703` (seat IDs are stored offset; UI shows `seatId - OFFSET`, sends `seat + OFFSET`).

**API (POST JSON to FC_URL, all `Content-Type: application/json`):**

- `{ action: 'status' }` → `{ triggerEnabled, seatId }` (lines 13-25).
- `{ action: 'toggle', enable: bool }` → `{ success, error? }` (lines 27-42).
- `{ action: 'set-seat', seat: string }` → `{ success, error? }` (lines 44-60).

**State:** `statusLoading`, `loading`, `triggerEnabled`, `seatId`, `seatInput`, `msg`, `msgType: 'success'|'error'`. `fetchStatus` on mount. Messages auto-clear after **3000ms** (line 76).

**Interactions:** toggle button (disabled while loading, label "操作中..."/已开启/已关闭), seat input (`@keyup.enter="updateSeat"`, trimmed; submit disabled when empty), 更新 button. Enter key submits.

**CSS classes:** `.lib-wrapper` (min-height `calc(100vh - var(--vp-nav-height))`, centered), `.lib-card` (max-width 420px, border-radius 12px, shadow `0 4px 24px rgba(0,0,0,0.05)`), `.lib-icon` 📚 48px, `.lib-toggle-btn.enabled` (brand bg, white text) / `.disabled` (bg-mute), `.toggle-dot` (8px circle), `.lib-input-row`, `.lib-submit-btn` (brand), `.lib-msg.success` (emerald tint `rgba(16,185,129,0.1)` / `#10b981`) / `.error` (`rgba(239,68,68,0.1)` / danger). `@media (max-width:480px)`: padding 24px 12px, card 24px 20px, icon 36px.

---

## 10. NavLeftActions.vue

**Purpose:** Navbar-left Back/Home links with inline SVG icons.

**Behavior:**

- `hiddenPaths = {'/', '/index', '/保险箱', '/保险箱.html', '/library', '/library.html'}` (line 18) — Back hidden there.
- `normalizePath` decodes URI components, tolerates malformed (lines 20-26).
- `parentPath` = all but last segment; `backHref` = `withBase('/?path='+encode(parentPath))` or `withBase('/')`; `homeHref = withBase('/')`.
- Both links: `preventDefault` + `router.go(href)`.

**CSS:** `.nav-left-actions` (flex, gap 8px, `margin-right:10px`); `.nav-left-link` (13px, border-radius 6px, hover bg `--vp-c-default-soft` + border divider); svg 16×16, `stroke-width:1.9`, round caps/joins. **`@media (max-width:959px)` → `display:none`** (whole component hidden on mobile).

---

## 11. Profile components

### 11.1 ProfileSidebar.vue

**Purpose:** Profile card sidebar; on mobile it becomes a slide-in drawer with overlay.

**Data:** `profile` from `useData().theme.value.profile` (lines 47-48). Shape: `{ photo?, name?, bio?, mail?, github?, repo?, friends?: string[], copyright? }`.

**Contact links derivation (`contactLinks`, lines 62-95):**

- `mail` → mailto link (prepends `mailto:` if missing), kind `email`, internal.
- `github` → label `github/<profile.name || last URL path segment>`, external (`_blank`, `rel="noreferrer noopener"`).
- `repo` → label = last URL path segment, external.
- each `friend` → label: github URL → first path segment (username); else last segment or hostname, external.

**State:** open/close driven by `explorerStore.profileOpen`. `close()` sets it false (line 148). Overlay `v-if="profileOpen"` click closes (line 3).

**CSS:**

- Desktop: `.profile-content` padding `24px 12px 12px`; `.avatar` 120×120 round, `object-fit:cover`; `.name` 20px/600; `.bio` 14px text-2; `.profile-links` column gap 8, `width: min(100%, 320px)`; `.link-item` 14px, hover `--vp-c-default-soft`, icons 24×24 box with 18×18 svg (`stroke:#111; stroke-width:1.6`; `.github-mark` filled currentColor; `.email-mark` 20×20); `.link-value` `word-break: break-all`; `.profile-copyright` `margin-top:auto; padding-top:24px; font-size:12px; color: var(--vp-c-text-3)`.
- `@media (max-width:959px)` (lines 225-268): `.profile-sidebar` fixed inset `top: var(--vp-nav-height); left:0; bottom:0; width:100%; z-index:100; pointer-events:none`; `.is-open` → `pointer-events:auto`; `.profile-overlay` absolute inset 0, `rgba(0,0,0,0.5)`, opacity transition 0.3s; `.profile-content` absolute left drawer `width:280px`, `transform: translateX(-100%)`, transition `transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)`; `.is-open .profile-content` → `translateX(0)`.

### 11.2 ProfileToggle.vue

**Purpose:** 3-dot hamburger button toggling `explorerStore.profileOpen` (line 15). **Hidden on desktop** (`display:none` default), shown `@media (max-width:959px)` as flex. 20×20 inline SVG, `stroke-width:2`. Classes: `.profile-toggle` (padding 4px, radius 4, hover bg default-soft).

### 11.3 SidebarProfileWrapper.vue

**Purpose:** Only renders ProfileSidebar on the explorer home route (`/` or `/index`, minus `.html`, lines 12-16).

**CSS `@media (min-width:960px)`:** `.sidebar-profile-wrapper` fixed `top: var(--vp-nav-height); bottom:0; left:0; width: var(--vp-sidebar-width, 254px); z-index:35` (above `.VPSidebar`); `.profile-sidebar-component` 100%×100%, `overflow-y:auto`.

### 11.4 Copyright.vue

**Purpose:** Footer copyright line from `theme.profile.copyright`.

**Props:** `placement: 'sidebar' | 'doc'`. Classes: `.site-copyright` (12px, text-3, centered); `.sidebar` variant `padding:16px; margin-top:auto`; `.doc` variant `padding-top:24px; margin-top:24px; border-top:1px solid var(--vp-c-divider)`. Rendered into `sidebar-nav-after` and `doc-after` slots.

---

## 12. Layout.vue (sidebar resize handle + collapse)

**Purpose:** Navbar/`layout-bottom` overlay that provides sidebar width dragging and collapse, plus global PWA reload toast (renders `<PwaReload/>` line 62).

**Constants (lines 15-18):** `STORAGE_KEY='vp-sidebar-width'`, `COLLAPSE_KEY='vp-sidebar-collapsed'`, `DEFAULT_WIDTH=260`, `MIN_WIDTH=200`, `MAX_WIDTH=600`.

**Core mechanism:** the sidebar's right edge = CSS var `--vp-sidebar-width` on `<html>`. Handle position is read from the computed var (lines 26-37), NOT from DOM rects (comment lines 21-24 explains SidebarProfileWrapper z-index:35 overlap breaks rect measurement on the explorer home).

**Visibility (`checkVisibility`, lines 39-50):** `showHandle = matchMedia('(min-width: 960px)').matches && frontmatter.layout !== 'home'`; then `nextTick` + 100ms timeout → `updateHandlePos`.

**toggleSidebar (lines 52-67):** flips `isCollapsed`, persists `COLLAPSE_KEY` as `String(isCollapsed)`. Collapse: saves current width to `lastWidth`, sets `--vp-sidebar-width: 0px`, adds `body.vp-sidebar-collapsed`. Expand: restores `--vp-sidebar-width: lastWidth px`, removes class. Handle position refreshed after 300ms.

**restoreWidth (lines 69-89):** if `COLLAPSE_KEY === 'true'` → collapsed state; else if saved width → apply it; else `260px`.

**initDrag (lines 91-126):** `mousedown` on handle (disabled when collapsed). Clamps 200-600. During drag sets `--vp-sidebar-width` live + `updateHandlePos()`; adds `body.vp-resizing`. On mouseup: removes class, clears cursor/user-select, persists final width as int via `localStorage.setItem(STORAGE_KEY, parseInt(finalWidth))` (line 121).

**Lifecycle:** `onMounted` → checkVisibility + restoreWidth + `resize` listener (lines 128-132); `onUnmounted` removes resize listener (lines 134-136); `watch(route.path)` → re-check visibility + 200ms-delayed handle pos update (lines 138-145).

**Template:** `<PwaReload/>` + `.sidebar-resize-handle` (v-if showHandle) with `.resize-line` and `.collapse-btn` (icon `‹`/`›`; `@mousedown.stop` so drag doesn't start). Handle title "拖拽调整宽度"; button titles "收起侧边栏"/"展开侧边栏".

**CSS (global, lines 150-213):**

- `body.vp-resizing .VPSidebar { transition: none !important }`.
- `@media (min-width:960px)` navbar tweaks: `.VPNavBar.has-sidebar .title` zero padding, centered; `.content-body` flex-start; `.menu { display:none !important }`; `.search { margin-right:12px }`; `.appearance { margin-left:auto }`.
- `body.vp-sidebar-collapsed` hides `.VPSidebar`, `.VPNavBarTitle`, `.VPNavBar .title`.

**CSS (scoped, lines 215-282):** `.sidebar-resize-handle` fixed `top: var(--vp-nav-height); bottom:0; width:16px; margin-left:-8px; z-index:50; cursor:col-resize`. `.resize-line` 2px transparent, brand on hover/resizing with `box-shadow: 0 0 4px var(--vp-c-brand-1)`. `.collapse-btn` 24×24 circle, bg `--vp-c-bg`, border divider, `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`, `z-index:60`, `opacity:0` default, shown on handle hover or when collapsed; hover → brand bg/white. `.is-collapsed` handle: `cursor:default; width:24px; margin-left:0; left:0 !important`; resize-line hidden.

---

## 13. PrivateVault.vue (783 lines)

### 13.1 Purpose & placement

Full-page vault UI: password unlock screen → file tree + markdown viewer backed by a GitHub private-repo proxy. Fixed overlay (`top: var(--vp-nav-height)`, `left: var(--vp-sidebar-width, 0)`, `width: calc(100vw - var(--vp-sidebar-width, 0))`, `z-index: 30`, borders top+left divider, lines 503-516). Mobile ≤959px: full width, no left border (lines 518-528). **Not persisted:** token only in memory.

### 13.2 Unlock flow (lines 267-339)

- POST `API_URL = 'https://privatege-proxy-uypbjhvwjb.cn-hongkong.fcapp.run/'` (line 15) with `{ password: password.value, action: 'list' }`.
- Non-OK response → `Server Error: ${status}`. Response unwrapped: `realData = data.data || data`.
- Success requires `realData.files` (else "返回数据格式不对，找不到 files 字段"). Then: `privateStore.token = password.value`, `privateStore.setData(tree)` (sets `fileList` + `isUnlocked = true`).
- Error displayed in `.error-msg`; loading state disables button (label "连接中..."/"解锁").

### 13.3 File list source

`buildFileTree(flatFiles)` (lines 211-246): flat GitHub API entries `{ path, type: 'tree'|'blob' }` → nested `PrivateFile[]`; roots = single-segment paths; orphan children fall back to root; recursive sort: dirs first, then `name.localeCompare` within same type.

### 13.4 `?target=` auto-jump (lines 306-337)

After unlock, reads `target` query param: strips anchor into `pendingAnchor`; takes substring after `'98-Private/'` (fallback: strips leading `../` / `./`); drops `#anchor`; replaces `.html` → `.md`; then `findAndExpand(privateStore.fileList, cleanPath)` (lines 248-263) — matches exact path OR `endsWith` suffix, expanding all ancestor dirs (`node.expanded = true`). If found → `selectFile(foundNode)`.

### 13.5 File open flow (lines 341-371)

`selectFile(file)`: dirs ignored; sets `privateStore.currentDoc = file`; lazily fetches content once — POST `{ password: privateStore.token, action: 'content', path: file.path }`; on `data.error` throws; content is base64 (`data.content.replace(/\s/g,'')`), decoded via `atob` → `Uint8Array` → `TextDecoder('utf-8')`; on failure `file.content = '> ❌ Error loading content'` (mocked/fallback content note: this error fallback + `*(Loading...)*` in renderedContent are the only "mock" content paths; no canned file content exists anywhere).

### 13.6 Markdown rendering (lines 115-183)

- `MarkdownIt({ html:true, linkify:true, typographer:true, highlight })`; highlight uses `window.hljs` (loaded from `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js`, id `hljs-script`, line 151-160), falls back to escaped `<pre class="hljs"><code>`.
- `heading_open` rule sets `token.attrSet('id', title)` — **raw title text (Chinese OK) as heading id** (lines 138-147).
- `renderedContent` (lines 374-381): strips leading YAML frontmatter `/^---[\s\S]*?---\n/`, returns `*(Loading...)*` while content undefined.
- Anchor scroll: `watch(renderedContent)` → 300ms timeout → `document.getElementById(decodeURIComponent(anchor))` → `scrollIntoView({behavior:'smooth'})`; clears `pendingAnchor` (lines 384-400).

### 13.7 Layout & interactions

- **State 1 (locked):** `.lock-screen`/`.lock-card` centered (max-width 400px), 🔐 48px, input `type=password` + unlock button, `@keyup.enter="unlock"`.
- **State 2 (unlocked):** `.vault-ui` (flex, `sidebar-collapsed` class when collapsed).
  - **Draggable toggle button** `.mobile-sidebar-toggle` (lines 91-141): default pos `{top:60, left:16}` (line 24), drag via mousedown/touchstart; >5px movement = drag (prevents click); clamped `[0, window.innerWidth-40]` × `[0, window.innerHeight-40]`; `preventDefault` on touchstart to stop scroll; on release without move → `toggleSidebar()`. Style: absolute, `z-index:100`, bg `--vp-c-bg`, border divider, radius 4, `box-shadow: 0 2px 4px rgba(0,0,0,0.05)`; collapsed state bg `--vp-c-bg-alt`; cursor grabbing while dragging; 📂 icon; title "切换文件列表 (可拖动)".
  - **Sidebar** `.vault-sidebar`: `ref=sidebarRef`, inline `width: isSidebarCollapsed ? '0px' : sidebarWidth + 'px'`; header "📦 远程文件库" (`padding: 24px 16px 16px 50px`, border-bottom); `.file-tree` padding 8px containing `<FileTreeNode>` per root (lines 439-449).
  - **Resizer** `.vault-resizer` (lines 148-187): `@mousedown="initResize"`; 1px divider line, `::after` invisible hot-zone `left:-6px; right:-6px` (z-index 20); hover/active → brand color + `width:4px`. Resize: rAF-throttled, clamp **150–500px**, adds `body.vp-resizing` + cursor col-resize + user-select none during drag (lines 148-187).
  - **Content** `.vault-content`: `padding: 50px 40px 24px` (top room for button); renders `<div v-html="renderedContent">` inside `.vp-doc`, or `.empty-state` (👋 "已安全连接" / "从左侧选择文件以从 GitHub 私有仓库加载内容").
- **Collapse defaults:** `isSidebarCollapsed` initial = `window.innerWidth < 768` (line 20). `toggleSidebar` resets width to 250 if < 150 (lines 147-151).
- `window.addEventListener('resize', ...)` registered at module scope (lines 153-156) — currently empty body.

### 13.8 CSS breakpoints & hljs theme (lines 529-783)

- `@media (max-width:768px)`: `.vault-sidebar` becomes absolute overlay `width:80% !important; max-width:300px; z-index:15; box-shadow:4px 0 16px rgba(0,0,0,0.1); transform:translateX(0)`; collapsed → `translateX(-100%)`, `border-right:none`; `:before` mask `rgba(0,0,0,0.3)` z-index 14, opacity transition 0.3s, `pointer-events` toggled; `.vault-resizer { display:none }`.
- `:global(body.vp-resizing) .vault-sidebar { transition: none !important }`.
- hljs theming (lines 756-775): `.vp-doc .hljs` bg `--vp-c-bg-alt`, padding 20px 24px, radius 8; `.hljs-keyword`/`.hljs-function` → brand-1 weight 600; `.hljs-string` → `#10b981`; `.hljs-comment` → text-3 italic; `.hljs-number`/`.hljs-literal` → `#f59e0b`; `.hljs-title` → `#3b82f6`.
- `.vp-doc { max-width: 100% !important }`.

---

## 14. Theme-level behaviors

### 14.1 Global click interceptor for /98-Private/ links (`theme/index.ts:44-69`)

- `window.addEventListener('click', ...)` registered in `onMounted`: finds `(e.target).closest('a')`; if `decodeURIComponent(href).includes('/98-Private/')` → `e.preventDefault()`; logs `拦截到私密链接: <target>`; then **full page nav** `window.location.href = '/保险箱?target=' + encodeURIComponent(targetPath)` (note: hardcoded base `/`, no `withBase`; uses `location.href` not router).
- Listener is never removed (theme lives for app lifetime).

### 14.2 medium-zoom init (`theme/index.ts:38-43, 70-73`)

- `mediumZoom('.vp-doc img', { background: 'var(--vp-c-bg)' })` — only images inside `.vp-doc` (excludes logos).
- Re-initialized on every route change: `watch(route.path, () => nextTick(initZoom))`.
- medium-zoom default behaviors apply: click to zoom, Escape/scroll/click-out to close, `scrollOffset:40`, margin 0, overlay + `medium-zoom-image` classes, `transition: transform .3s cubic-bezier(.2,0,.2,1)`.

### 14.3 PwaReload.vue — update detection

- Component is rendered by `Layout.vue:62` (always mounted).
- `onMounted` (lines 9-22): dynamic `import('virtual:pwa-register/vue')` → `useRegisterSW()` with no args → exposes `offlineReady`, `needRefresh`, `updateServiceWorker` refs; `watch`es the two flags into local refs.
- **Detection mechanism:** config `config.mts` sets `VitePWA({ registerType: 'prompt', devOptions: { enabled: true, type: 'module' } })` (lines ~170-178). With `registerType:'prompt'`, the generated workbox SW does **not** auto-skip-waiting; the virtual register module receives the SW's "new content available" signal (the workbox `message` event / waiting-state handshake surfaced by `virtual:pwa-register/vue`'s `onNeedRefresh` → `needRefresh`). I.e., update detection = workbox **waiting** lifecycle surfaced via the virtual register module's message channel; there is no explicit `updatefound`/`controllerchange` handler in app code — all state comes from `useRegisterSW()`.
- **UI:** `.pwa-overlay` fixed inset 0, `z-index:999`, `rgba(0,0,0,0.4)` + `backdrop-filter: blur(2px)`; `.pwa-toast` max-width 400px, radius 16, shadow `0 10px 25px rgba(0,0,0,0.2)`; icon ✅ (offlineReady) or 🚀 (refresh); titles "已准备就绪"/"发现新版本"; messages "内容已缓存，现在可以离线访问。"/"网站内容已更新，请点击刷新以查看最新版本。".
- Buttons: `立即刷新` (brand, calls `updateServiceWorker()`) shown only when `needRefresh`; `稍后` closes toast.
- Transition `fade` (opacity 0.3s ease); `@media (min-width:640px)` actions become `flex-direction: row-reverse` with equal-width buttons.

### 14.4 PullToRefresh.vue (wraps the whole app)

- **Thresholds:** `THRESHOLD = 80` (release-to-refresh), `MAX_DRAG = 120`, damping `dampedY = min(deltaY * 0.5, MAX_DRAG)` (lines 4-5, 63).
- **Gate:** only when `window.scrollY <= 0`; ignored while refreshing; touchstart target must not match `.VPSidebar`, `.vault-sidebar`, `.mobile-sidebar-toggle`, `.VPLocalNav`, `.vp-code-group`, `pre` (lines 24-42).
- **Events (document-level, lines 102-113):** `touchstart` passive:true, `touchmove` passive:false (calls `preventDefault` when cancelable and deltaY>0), `touchend` passive:true. Removed on unmount.
- **States:** `idle → pulling → ready → refreshing`. On ready release: `state='refreshing'`, `pullY=THRESHOLD`, then `window.location.reload()` after 500ms (lines 77-84). Otherwise spring back (`idle`, pullY 0) with `.ptr-transition` (transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94)).
- **Visual:** `.ptr-container` min-height 100vh, translated by `pullY`; `.ptr-indicator` 60px tall, hidden above viewport (`translateY(-100%)`); arrow svg rotates `pullY * 2` deg; `.ptr-icon.rotate` (180° when ready), `.spin` (1s linear infinite); text "下拉刷新"/"释放刷新"/"正在刷新...". Slot wraps page content.

### 14.5 FrontmatterBlock.vue

- Rendered in `doc-before` slot (theme/index.ts:32). Skips home/explorer routes (`/`, `/index`) (lines 33-37).
- `HIDE_KEYS = {'layout','outline','lastUpdated','editLink','navbar','sidebar','aside','pageClass','head','titleTemplate'}` (lines 13-19).
- Serializer (lines 21-45): null/undefined → `~`; strings quoted only when ambiguous (`/^[-?:,\[\]{}#&*!|>'"%@`]|:\s|^\s|\s$|^\d+$/`); numbers/booleans plain; arrays of primitives inline`[...]`, nested as`- ` bullets; objects as `key: value` lines with 2-space indent.
- **CSS:** `.frontmatter-block` (margin 0 0 24px); `pre` padding 14px 18px, bg `--vp-c-bg-soft`, `border-left: 4px solid var(--vp-c-brand-1)`, radius 6, 13px, `color: var(--vp-c-text-2)`.

### 14.6 CryptoPrice.vue (theme/components)

- Mock widget: on mount sets `price = '$98,000'` (no real fetch) (lines 3-6). Classes `.coin-card` (padding 10, bg #f3f3f3, radius 8, bold) and `.price` (`color:#d81b60`). Registered globally (`theme/index.ts:94-96`).

---

## 15. theme/style.css — variables & global classes needing parity

- **Brand palette** (lines 6-27): default/brand/tip/warning/danger maps to VitePress gray/indigo/yellow/red scales (`--vp-c-brand-1: var(--vp-c-indigo-1)`, etc.). React re-implementation must define the same CSS var indirection.
- **Buttons** (lines 31-43): brand button bg = `--vp-c-brand-3`, hover `--vp-c-brand-2`, active `--vp-c-brand-1`.
- **Home hero** (lines 46-73): name gradient `120deg, #bd34fe 30%, #41d1ff`; image `linear-gradient(-45deg, #bd34fe 50%, #47caff 50%)`; blur filter 44px / 56px (≥640px) / 68px (≥960px).
- **Custom block tip** (lines 76-84): transparent border, text-1, bg brand-soft.
- **DocSearch** (line 89): `--docsearch-primary-color: var(--vp-c-brand-1)`.
- **Callout** (lines 94-114): `.custom-block.callout` flex, padding 16, bg default-soft, border divider, radius 8, margin 16px 0; `.callout-icon` 24px; content margins zeroed.
- **Homepage:** `.VPFeature` hover → translateY(-5px) + `box-shadow: 0 12px 40px rgba(0,0,0,0.15)` + brand border + `--vp-c-bg-soft-up` (lines 117-129); `.VPHero .image-src` drop-shadow purple + `float` animation 6s ease-in-out infinite, ±20px (lines 131-142); `.vp-doc-footer .last-updated { margin-left:auto }`.
- **Sidebar:** `.VPDocOutlineItem .outline-link` wrapping fixes (lines 151-157); `📂`/`📄` icons injected via `.VPSidebarItem.collapsible > .item .text::before` and `:not(.collapsible)` (lines 161-169); `.VPSidebarItem .item` radius 6, margin 2px 0, hover bg-mute; `.item.active` → `background: var(--vp-c-brand-soft)`, no border/shadow, `::before` hidden, text brand-1 weight 600 (lines 182-191); indent by level: 0/10/18/26px (lines 200-204); folder titles weight 600 text-1 (lines 206-209).
- **Layout max width:** `@media (min-width:1440px) { --vp-layout-max-width: 100% !important }` (lines 212-216).
- **is-explorer overrides** (lines 218-233): see §1.
- **Sidebar flex column** (lines 235-252): `.VPSidebar { padding-bottom: 0 }`; mobile (≤959px) sidebar padding 12px/8px; `.VPSidebar > .nav` flex column min-height 100%; `.site-copyright.sidebar { margin-top:auto; padding-bottom:32px }`.
- **Content width** (lines 254-260): `.VPDoc.has-aside .content-container { max-width: none !important }`.
- **GitHub alerts** (lines 262-323): `.vp-doc .custom-block.github-alert` padding 0.75rem 1rem, radius 6, `border-left: 0.25em solid var(--vp-c-default-1)`, bg via `--alert-bg`; per-type colors — note `#0969da`, tip `#1a7f37`, warning `#9a6700`, important `#8250df`, caution/danger `#d1242f`; dark variants `#58a6ff`, `#56d364`, `#e3b341`, `#bc8cff`, `#ff7b72` with translucent bgs.

---

## 16. Config-level behaviors (config.mts)

- Title/desc from `profile.json`; head: manifest `/manifest.webmanifest`, favicon `/favicon.ico` + `/profile-photo.svg` + base64 alternate + apple-touch-icon 192, `theme-color #ffffff`, mobile-web-app-capable meta (lines 89-104).
- `ignoreDeadLinks: true`; `srcExclude: ['**/windows-terminal-main/**']` (lines 108-115).
- **PWA (vite-plugin-pwa, lines 128-169):** `registerType:'prompt'`; `devOptions { enabled:true, type:'module' }`; manifest name/short_name from profile, theme_color #ffffff, scope/start_url/id `'/'`; icons profile-photo-192/512.jpg; workbox `globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']`, `maximumFileSizeToCacheInBytes: 10*1024*1024` (10 MiB), `navigateFallback: null` (MPA: `/?path=` navigations must not be hijacked), `cleanupOutdatedCaches: true`.
- **Sidebar** auto-generated from docs tree: excludes dotfiles, `public/`, `98-Private/`, and `SIDEBAR_EXCLUDE = {index.md, 保险箱.md, library.md, 001-guide.md, guide.md, chat.md, .gitignore}` (lines 42-48); dirs collapsed by default (`collapsed: true` at top level, `collapsed:false` for scoped entries); sorting ASCII-first + `localeCompare('zh-Hans-CN')` (lines 83-92); scoped per-dir sidebars (lines 95-101).
- **nav:** only `{ text: 'Home', link: '/' }`; social link github; `search.provider='local'`; `lastUpdated` text "最后更新于" with `dateStyle:'full', timeStyle:'medium'`; footer MIT + copyright.
- **markdown:** `math:true`; anchor slugify: lowercase, `[\s.:：()（）%]+` → `-`, collapse dashes, trim, `_` prefix for leading digit (lines 258-271); `link_open` renderer rewrites internal `#hash` links with the same slugify (lines 316-352); fence-lang downgrade set `{kconfig,dts,devicetree,cfg,ld,assembly,pwsh,pfofile}` → `txt` (lines 279-291); bare `<placeholder>` inline-HTML escaping with SAFE_INLINE_HTML allowlist (lines 292-315); broken-image neutralization regex `^(?:[a-zA-Z]:(?:[\\/]|%5[Cc]|%2[Ff])|file:|\\\\|\/(?:home|Users|mnt|root|tmp)\/)` (lines 317-355); `taskLists`; `callout` container (icon from `::: callout <icon>`, default 💡) (lines 356-368).

---

## 17. profile.json (docs/public/profile.json)

```json
{
  "name": "yceachan",
  "bio": "As Eachan's Views",
  "email": "yceachan@foxmail.com",
  "github": "https://github.com/yceachan",
  "repo": "https://github.com/yceachan/yceachan.github.io",
  "copyright": "Copyright © 2026-present yceachan",
  "jpg": "/profile-photo.jpg",
  "friends": ["https://github.com/Lysssyo/Lysssyo.github.io"]
}
```

- `jpg` is used as `profile.photo` (config.mts:150) — ProfileSidebar avatar `img.src = profile.photo`.
- Public assets present: `profile-photo.jpg`, `-192.jpg`, `-512.jpg`, `profile-photo.svg`, `favicon.ico`.

---

## 18. In-memory stores (port as React context/state)

**explorerStore.ts** (full): `{ currentPath: '/', sortKey: 'name', sortOrder: 'asc', profileOpen: false }` — reactive singleton.

**store.ts** (full): `PrivateFile { name, path, type: 'file'|'dir', content?, children?, expanded? }`; `privateStore { isUnlocked:false, token:'', fileList:[], currentDoc:null, setData(files){fileList=files; isUnlocked=true}, setCurrentDoc(file) }`.

---

## 19. Porting checklist (React SPA deltas & risks)

1. **Routing model:** VitePress is MPA with `?path=` query driving an always-mounted Explorer — React router must reproduce the "same route, query-only change, view must refresh" semantics (the exact bug the Vue code works around in Explorer.vue:26-32, ExplorerItem.vue:33-36, ExplorerBreadcrumb.vue:62-67).
2. **localStorage keys** must keep exact names: `explorer:sort`, `vp-sidebar-width`, `vp-sidebar-collapsed`.
3. **No persistence for vault token** — unlock state dies on reload; `/保险箱?target=` flow must re-unlock then auto-jump.
4. **Dead routes:** `/保险箱` and `/library` pages don't exist in the repo — the interceptor targets a page that 404s today; decide whether the SPA adds real routes for them.
5. **CSS var contract:** React app must define VitePress variable names (`--vp-nav-height`, `--vp-sidebar-width`, `--vp-c-*`, `--vp-layout-max-width`, `--vp-font-family-mono`) or map to equivalents, since many components read/write `--vp-sidebar-width` on `<html>` at runtime (Layout.vue, PrivateVault.vue, SidebarProfileWrapper.vue, Explorer.vue).
6. **Body/html classes:** `is-explorer`, `vp-resizing`, `vp-sidebar-collapsed` toggle on `documentElement`/`body` and gate global CSS.
7. **medium-zoom** must init on `.vp-doc img` (or the React equivalent container) and re-init on route change; background `var(--vp-c-bg)`.
8. **PWA:** `registerType:'prompt'` + `virtual:pwa-register/vue` → React equivalent `virtual:pwa-register/react`; keep `navigateFallback: null`, 10 MiB cache cap.
9. **Interactions to replicate exactly:** 5px drag threshold + 40px bounds for vault toggle button; 200-600 sidebar width clamp (doc sidebar) vs 150-500 (vault sidebar); pull-to-refresh 80/120 thresholds with 0.5 damping; 3000ms library message auto-clear; 300ms anchor scroll delay; 500ms reload delay.
10. **Sorting:** dirs-before-files, separate asc/desc per group, ASCII-first then `zh-Hans-CN` localeCompare — matches config sidebar sort.
11. **PrivateVault content fallbacks:** `*(Loading...)*` while content undefined; `> ❌ Error loading content` on fetch failure; frontmatter stripped before render; raw heading text as anchor ids.
