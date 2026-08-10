# Research: Fixed Integration Recipe — Appica UI + Tailwind v4 + marked + vite-plugin-pwa (React SPA knowledge base)

Research date: ~Aug 2026. All package versions frozen as of research. Sources inlined.

---

## Lane A — Appica UI (`@appica/ui-react`)

### A1. Exact package names & versions (frozen)

| Package | Version | Role |
| --- | --- | --- |
| `@appica/ui-react` | **1.0.0** | The only Appica UI package to install. `appica-ui` does **not** exist on npm; the package is scoped `@appica/ui-react`. |
| `@appica/icons-react` | **^1.0.0** | Optional sibling icon package (e.g. `SunHigh`, `MoonStars`). |
| `tailwindcss` + `@tailwindcss/vite` | **v4.x** | Tailwind v4 build plugin for Vite (use the Vite plugin, **not** `@tailwindcss/postcss`, for a Vite SPA). |
| `react`, `react-dom` | **≥19 (hard requirement)** | Appica uses React 19 ref-as-prop API with **no** `forwardRef` shims. React 18 will not work. |
| `@base-ui/react` | `^1.6.0` (transitive dep) | Appica components are wrappers over Base UI primitives. |

Hardened facts (from `packages/react/package.json`):

- `@appica/ui-react` is `"type": "module"` (ESM only). Requires **Node ≥20**.
- `peerDependencies`: `react ^19`, `react-dom ^19`, `tailwindcss ^4.0.0` (all required).
- Bundled transitive deps include `@base-ui/react ^1.6.0`, `motion ^12.42.2` (used by Loader/drawer animations), `class-variance-authority`, `clsx`, `tailwind-merge`, `date-fns`.

### A2. Install steps (Vite + React + Tailwind v4)

Appica ships **no prebuilt stylesheet** and ships component **class names as source** for *your* Tailwind to compile. Setup is: (1) install, (2) point Tailwind at `node_modules` via `@source`, (3) import tokens after Tailwind, (4) wrap in `ThemeProvider`.

```bash
# Tailwind v4 + Vite plugin first
npm i tailwindcss @tailwindcss/vite

# React SPA boilerplate deps (React 19 required)
npm i react react-dom

# Appica
npm i @appica/ui-react
npm i @appica/icons-react   # optional, for icons

# vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css` (Vite global stylesheet — **import order matters**, and the `@source` path is relative to *this file*):

```css
@import 'tailwindcss';                /* Tailwind v4 MUST already work */
@source "../../node_modules/@appica/ui-react/dist"; /* count ../ to reach node_modules */
@import '@appica/ui-react/styles.css'; /* tokens + @custom-variant definitions AFTER Tailwind */
```

- The `@source` directive is **mandatory**: Tailwind ignores `node_modules` by default, so without it every Appica component renders unstyled.
- `styles.css` already contains `@custom-variant dark (&:is(.dark *))`, `@custom-variant motion-reduce` (also respects `[data-disable-animations]`), and the full `@theme inline` token block.
- If Tailwind isn't compiling your own classes yet, Appica components will render unstyled — get plain Tailwind working first.
- Vite framework slot: plugin `@tailwindcss/vite`, global stylesheet `src/index.css`, wrap the root component in `main.tsx`.

### A3. Subpath import convention (tree-shakeable)

Each component is exported both at the package root (`@appica/ui-react`) and via a **subpath** for the smallest bundle. Confirmed export map entries: components → `@appica/ui-react/{button,navigation,breadcrumb,avatar,drawer,collapsible,tabs,tooltip,kbd,toast,toc,scroll-area,loader,skeleton,dropdown-menu,separator,...}`. Hooks → `@appica/ui-react/hooks/{use-theme,use-reduced-motion,use-media-query,use-local-storage,use-direction,use-dismissible}`. Providers → `@appica/ui-react/providers/{theme-provider,reduced-motion-provider,direction-provider}`. Styles → `@appica/ui-react/styles.css`.

```tsx
import { Button } from '@appica/ui-react/button'
import { Navigation } from '@appica/ui-react/navigation'
import { useTheme } from '@appica/ui-react/hooks/use-theme'
import { ThemeProvider } from '@appica/ui-react/providers/theme-provider'
```

### A4. Theming tokens (CSS variables, no JS config)

- **Two layers.** (1) *Raw value tokens* are plain CSS custom properties, defined per theme: `:root`/`.light` hold light values, `.dark` holds dark values. (2) *Theme tokens* alias the raw values inside Tailwind's `@theme inline` block, which generates utilities.
- The `inline` keyword matters: `bg-primary` compiles to `var(--primary)` (raw), **not** `var(--color-primary)`. So in plain CSS use raw tokens like `var(--primary)`; in utilities use `text-(--primary)`, never `text-(--color-primary)`.
- Token groups to override after the import: colors (all `oklch`; semantic groups `--foreground-*`, `--background-*`, `--border-*`, `--primary-*`, `--secondary-*`, `--focus-ring-*`, `--error-*`, plus `--shadow-color`, `--selection-color`), radius (`--radius` single base drives `--radius-xs…4xl` via `calc()`), typography (`--font-sans`, `--font-mono`, `--text-sm`), shadows (`--shadow-sm…2xl`), `--border-width`, `--opacity-disabled`.
- Recolor by overriding a raw token *after* the import, e.g. `:root { --primary: oklch(60% 0.25 150); }`. Every component updates automatically. No theme objects, no JS config, no `@theme` re-import.

### A5. Dark mode (ThemeProvider + useTheme)

- **Class-based.** Toggling the `dark` class on `<html>` applies dark token values. `styles.css` defines `@custom-variant dark (&:is(.dark *))`, so `dark:*` utilities work in your own markup too.
- **`ThemeProvider`** (did smoke-tests: wraps app at root, inside `<body>`/root in `main.tsx`). It applies the correct class to `<html>` **before first paint** via an injected inline script (no FOUC), persists choice to `localStorage` under key `'theme'`, and optionally follows OS `prefers-color-scheme`.
  - Props: `themes` (`['light','dark']`), `defaultTheme` (`'system'` if `enableSystem`), `forcedTheme` (pin a subtree), `enableSystem` (`true`), `enableColorScheme` (`true` — sets `color-scheme`), `disableTransitionOnChange` (`false`), `storageKey` (`'theme'`), `value` (map theme name → class on `<html>`), `nonce`, `scriptProps`.
- **`useTheme`** (`@appica/ui-react/hooks/use-theme`) returns `{ theme, resolvedTheme, setTheme, systemTheme, mounted }`. Guard theme-dependent UI with `mounted` so first render matches storage/OS.

```tsx
const { resolvedTheme, setTheme, mounted } = useTheme()
if (!mounted) return null
return <Button variant="ghost" size="icon-md" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
```

### A6. Reduced motion

- Components honor OS `prefers-reduced-motion` automatically; `motion-reduce:` utilities are defined to also respect `[data-disable-animations]`.
- **`ReducedMotionProvider`** (`@appica/ui-react/providers/reduced-motion-provider`) with `disableAnimations` forcibly writes `data-disable-animations` to `<html>` (needed to reach Base UI portaled popups that render under `document.body`). **`useReducedMotion`** (`@appica/ui-react/hooks/use-reduced-motion`) returns `true` inside that subtree.

### A7. Component API shapes (verified from source)

Import from subpaths. All components accept `className`, local overrides via a `cn(...)` class-merge, and a `render` prop (Base UI `useRender`) to swap the underlying element.

- **Navigation** — `Navigation` (props: `orientation` `horizontal|vertical`, `variant` `pill|line` (±`indicator` for vertical), `size`, `activeLink`—the active link `value`), `NavigationList`, `NavigationItem`, `NavigationLink` (`active`, `disabled`, `value`, `indicator`; renders `aria-current="page"`/`data-active` when active). Great for a top/side nav.
- **Breadcrumb** — `Breadcrumb` (a `nav` with `aria-label`), `BreadcrumbList` (`ol`), `BreadcrumbItem`, `BreadcrumbLink` (`active`→renders `span`, `disabled`), `BreadcrumbSeparator`, `BreadcrumbEllipsis`.
- **Avatar** — `Avatar` (size `2xs…2xl` or number px, shape `rounded|circle`, default `md`/`circle`), `AvatarImage` (`src`,`alt`,`render`), `AvatarFallback`, `AvatarBadge`.
- **Drawer** — `Drawer` (`side` `top|bottom|left|right`, default `bottom`; wraps Base UI `Drawer.Root` with `snapPoints`, exposes `.createHandle`), `DrawerProvider`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerBody`, `DrawerFooter`, `DrawerClose`, `DrawerIndent`, `DrawerIndentBackground`. Good for a mobile table-of-contents / search drawer.
- **Collapsible** — `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` (Base UI `Root/Trigger/Panel`; animated height). Use for an expandable "on this page" or FAQ.
- **Tabs** — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (Base UI tabs; variants/sizes). For doc/section paging.
- **Tooltip** — `Tooltip` (Base UI popup). Not individually inspected; follows the popup + floating pattern.
- **Kbd** — `Kbd` (keyboard key capsule). For shortcut hints in the doc chrome.
- **Toast** — `ToastProvider`, `Toaster`, `ToastViewport` (position `top-*|bottom-*` + axis), `Toast`, `ToastIcon`, `ToastTitle`, `ToastDescription`, `ToastActions`, `ToastAction`, `ToastClose`, `ToastProgress` (`timeout`), plus `useToastManager` / `createToastManager` (the imperative push API). Use `Toaster`/`useToastManager` for app-level notifications.
- **Scroll Area** — `ScrollArea` (Base UI scroll area). For the article/sidebar scroll panes.
- **TOC** — `Toc` plus link/list parts; tracks visible headings via `IntersectionObserver`, exposes `activeIds`/`currentId` and `register(id, element)`. Ideal for a `Lane-agnostic` right-rail "On this page". (Root of the file itself; heading `id`s must line up with the marked heading slugifier — see B2.)
- **Loader / Spinner / Skeleton** — `Loader` (`variant` `bar|dots`, `currentColor`), `Spinner`, `Skeleton`. For page/article placeholders.
- **Dropdown Menu** — `DropdownMenu` + `DropdownMenuTrigger`/`DropdownMenuContent`/`DropdownMenuItem`/… (Base UI `Menu`; `size` sm/md/lg; uses floating helpers + `navigationLinkVariants`). For the avatar/user-action menu.
- **Separator** — `Separator`. For nav/section dividers.
- **Button** — `Button` with `variant` (`primary`, `primary-outline`, `secondary`, `soft`, `outline`, `ghost`, `destructive`, `light`) and `size` (`sm|md|lg`, `icon-sm|icon-md|icon-lg`); default `primary`/`md`. Supports `render` and icon slots.

---

## Lane B — marked extension recipe

### B1. Package + current version (frozen)

| Package | Version | Note |
| --- | --- | --- |
| `marked` | **18.0.9** (2026-08-04) | ESM-first; `marked` v16 removed the CJS build and set a minimum of **Node 20**. v18 requires TS v6 tooling and trims trailing blank lines in block tokens (breaking). |
| `dompurify` | **3.4.13** (2026-08-03) | marked has **no built-in sanitizer since v8** — DOMPurify is the docs-recommended final layer. |
| `marked-katex-extension` | **5.1.10** (UziTech, maintained) | Peer range `katex >=0.16 <0.18`; supports `marked` up to v18. **Pin `katex` to 0.17.x.** |
| `katex` | **0.17.x** (⚠ NOT 0.18.2) | `katex@0.18.2` shipped 2026-08-08 but is outside `marked-katex-extension`'s peer range — do not use 0.18 yet. |
| `mermaid` | **11.16.0** (2026-06-25) | Browser-only rendering; call `mermaid.run()` after DOM insert. |
| `marked-alert` | **2.1.2** (bent10/marked-extensions) | Enables GFM alerts (`> [!NOTE]`). Alternative maintained alert ext: `@fsegurai/marked-extended-alert`. Container/admonition alternative: `marked-admonition-extension`. |

### B2. `marked.parse` options + custom heading slugifier

- `gfm` (default `true`) — on. `breaks` (requires `gfm`) — **off** by default (GitHub file behavior); set `true` if you want soft-line-break `<br>`. `async` — set `true` only if you use an async `walkTokens`/extension; with `async:true`, `marked.parse` **returns a `Promise`**. If `async:false` is passed while an async extension is active, marked throws.
- Configure once at module scope via `marked.use({...})`. Do **not** call `marked.use` inside functions/loops (duplicate-extensions recursion). For isolation use `new Marked()`.
- Custom heading renderer with your exact slugify spec (`replace [\s.:：()（）%]+` → `-`, collapse dashes, strip leading/trailing dashes, prefix `_` if id starts with a digit):

```ts
import { marked } from 'marked'

const slugify = (raw: string): string => {
  const base = raw
    .toLowerCase()
    .replace(/[\s.:：()（）%]+/g, '-')   // whitespace + . : ： ( ) （ ） % → '-'
    .replace(/-{2,}/g, '-')              // collapse runs of dashes
    .replace(/^-+|-+$/g, '')             // strip edges
  return /^\d/.test(base) ? `_${base}` : base // prefix '_' for digit-start ids
}

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens)
      return `<h${depth} id="${slugify(text)}">${text}</h${depth}>`
    },
  },
})
```

**Important:** the heading `id` you produce here must match what the Appica `Toc` looks up with `document.getElementById(id)` (Lane A7) — every article heading that should appear in "On this page" needs an `id`.

### B3. Extensions

**GitHub alerts** — `npm i marked-alert`, then

```ts
import { Marked } from 'marked'
import markedAlert from 'marked-alert'
const md = new Marked().use(markedAlert())
const html = md.parse('> [!NOTE]\n> Some note')
```

Alternative maintained option: `@fsegurai/marked-extended-alert` (note/warning/tip/info variants). For admonition-style `!!!` containers, `marked-admonition-extension`.

**Task lists** — **built into marked** via `gfm:true`. `- [ ]` / `- [x]` render as checkbox `<input type="checkbox" disabled>` natively; no extra package needed. (Do not add `marked-task-lists` — it's for other parsers.)

**Custom containers `:::callout 💡 :::`** — no first-party container extension in marked. Use a custom **block-level** extension mirroring the official description-list example (`this.lexer.blockTokens` to parse inner blocks, `this.parser.parse` to render them):

```ts
const callout = {
  name: 'callout',
  level: 'block',
  start(src) { return src.match(/^:::(.*):?$/)?.index ?? -1 },
  tokenizer(src, tokens) {
    const m = /^:::(\s*\S{0,20})[\n\r]([\s\S]*?)\n?:::/.exec(src)
    if (!m) return undefined
    const token = {
      type: 'callout', raw: m[0], kind: m[1].trim() || 'callout', inner: m[2], tokens: [],
    }
    this.lexer.blockTokens(token.inner, token.tokens) // parse nested markdown
    return token
  },
  renderer(token) {
    return `<div class="callout"><span class="callout-kind">${token.kind}</span>${this.parser.parse(token.tokens)}</div>`
  },
}
marked.use({ extensions: [callout] })
```

Alternatively try `marked-directive` (bent10) for a declarative directive/container system. Escape user-controlled `kind` through DOMPurify (B6).

**Mermaid code fences** — intercept the `mermaid` fence and emit a placeholder that `mermaid` hydrates (browser-only; mermaid cannot render server-side):

```ts
marked.use({
  renderer: {
    code({ lang, text }) {
      if (lang?.toLowerCase() === 'mermaid') {
        return `<div class="mermaid">${text.replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]!))}</div>`
        // escape graph source, then after DOM insert call mermaid.run()
      }
      return false // fall back to default code renderer
    },
  },
})
```

After injecting the HTML, run `await mermaid.run()` (or target `.mermaid` elements) so schemas render. Two-step render keeps the parser pure. `mermaid@11.16.0`.

**Math/KaTeX** — use `marked-katex-extension` (UziTech) + `katex@^0.17`:

```ts
import markedKatex from 'marked-katex-extension'
import 'katex/dist/katex.min.css' // katex CSS required
marked.use(markedKatex({ throwOnError: false }))
```

⚠ Version pitfall: katex must be `>=0.16 <0.18`; the freshly-released katex 0.18 is **not** yet supported by the extension.

### B4. Rewriting languages, escaping placeholders, neutralizing bad image srcs

- **Rewrite fence languages (kconfig → txt, dts → txt, etc.):** override the `code` renderer (as above) — return `false` to fall back, or remap `lang` then emit `<pre><code class="language-…">`. Simplest: in the `code` renderer, map `lang` through a table before delegating.
- **Escape bare `<placeholder>` tags** (unknown/raw HTML in content): marked forwards raw HTML blocks as `html` tokens. Either (a) pre/post-process: replace unregistered placeholder tags with `&lt;tag&gt;`, or (b) override the `html` renderer to escape suspicious tags, or (c) rely on DOMPurify's tag allowlist as the belt-and-suspenders final layer. Suggested: normalize placeholders pre-parse, let marked keep real HTML, then allowlist via DOMPurify.
- **Neutralize broken image srcs (`C:`, `file://`, `/home/`):** override the `image`/`link` renderer to validate `href`/`src`; drop unsafe schemes (`file:`, `data:` beyond svg, `javascript:`), and rewrite `/home/...` and `C:\...` to a missing-asset placeholder. DOMPurify (B6) with an image config is the hard backstop.

### B5. Sanitization

```ts
import DOMPurify from 'dompurify'
const safeHtml = DOMPurify.sanitize(marked.parse(md), {
  ADD_TAGS: ['mermaid'],
  ADD_ATTR: ['target'],               // if you add target="_blank"
  // block mermaid from being stripped if needed
})
```

marked does **not** sanitize; always run output through DOMPurify before `dangerouslySetInnerHTML`. Keep `hooks`/`walkTokens`/renderer note: `marked.use` belongs at module scope, not per-render.

---

## Lane C — PWA with vite-plugin-pwa (React SPA)

### C1. Package + current version (frozen)

| Package | Version | Note |
| --- | --- | --- |
| `vite-plugin-pwa` | **1.3.0** (2026-05-05) | Requires Vite 5+ (works with current Vite). Add as `devDependency`. |
| `workbox-window` | latest (devDep) | **Required** as a devDependency to use `virtual:pwa-register/react`. |

```bash
npm i -D vite-plugin-pwa workbox-window
```

### C2. Prompt-update flow in React (`registerType: 'prompt'`)

The React virtual module `virtual:pwa-register/react` exposes `useRegisterSW()` returning `{ offlineReady: [boolean,setter], needRefresh: [boolean,setter], updateServiceWorker(reloadPage?) }`.

```tsx
// ReloadPrompt.tsx
import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
  const { offlineReady: [offlineReady], needRefresh: [needRefresh], updateServiceWorker } =
    useRegisterSW({ onNeedRefresh() {}, onOfflineReady() {} })

  return (
    <>
      {(offlineReady || needRefresh) && (
        <div role="status">
          {offlineReady ? <span>App is ready to work offline</span> : <span>New content available.</span>}
          {needRefresh && (
            <button onClick={() => updateServiceWorker(true)}>Reload</button>
          )}
          {needRefresh && <button onClick={() => updateServiceWorker(false)}>Dismiss</button>}
        </div>
      )}
    </>
  )
}
```

For a React typebelt add the virtual module declaration (`declare module 'virtual:pwa-register/react'`) or the plugin's associated `client.d.ts`/`react.d.ts`. Wire the toast/refesh prompt into the Appica `Toast` system.

### C3. Manifest + workbox config for a fully-offline SPA

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'EA Knowledge Base',
        short_name: 'EA KB',
        description: 'React SPA knowledge base (works offline)',
        theme_color: '#0f172b',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // SPA: all navigation requests fall back to index.html
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/$/],   // only intercept the entry point
        // Default globPatterns is '**/*.{js,css,html}'. Extend it so EVERYTHING
        // needed offline is precached, including bundled markdown content:
        globPatterns: ['**/*.{js,css,html,json,svg,png,ico,woff,woff2,md}'],
        cleanupOutdatedCaches: true,           // default is true; keep it on
      },
      includeAssets: ['favicon.ico', 'pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png'],
      devOptions: { enabled: true },          // run SW during `vite dev`
    }),
  ],
})
```

- **`navigateFallback: 'index.html'`** is the default for a `generateSW` SPA; keep it so deep routes load offline. `globPatterns` default is `**/*.{js,css,html}` — extend it to also precache fonts/images/JSON (and markdown if emitted as `.md` in `dist`).
- **Precaching "everything" for 100% offline after first load:** the service worker's precache manifest must include all needed resources. Because the whole SPA is bundled, all app JS/CSS (and *build-time-bundled* markdown, e.g. compiled into JS chunks or dropped as `dist/**/*.md`) is precached with the hashed assets. Keep `globPatterns` broad; do **not** disable `cleanupOutdatedCaches` (doing so risks blank screens from stale hashes — see issue #446).
- If you instead `fetch()` markdown at *runtime*, those fetches are **not** precached and will fail offline unless you add a `runtimeCaching` entry. Recommendation is to bundle markdown at build time so it lives inside the app bundle.
- **`devOptions.enabled: true`** enables the SW in `vite dev`. With `generateSW` strategy, dev builds only precache `navigateFallback` (one entry); `navigateFallbackAllowlist` defaults to `[/^\/$/]`. Add it only if dev routes are being intercepted.

### C4. Tailwind v4 + Appica + PWA cross-run pitfalls

- **Missing `@source`** ⇒ every Appica component renders unstyled (Tailwind doesn't scan `node_modules`).
- **React 18** ⇒ fails to compile/run (no `forwardRef` shims). Must be React 19.
- **`@import` order** in `src/index.css`: Tailwind first, then Appica tokens. Do not remove `@import 'tailwindcss'` from the consumer file (avoid double-up of Tailwind rules — if you also let `styles.css` emit it, you get duplicated Tailwind CSS).
- **`@appica/ui-react` is ESM + Node 20+** — mind your build env.
- **katex 0.18 not supported** by `marked-katex-extension` yet — pin `^0.17`.
- **marked v16+ removed CJS**; minimum Node 20. Do not call `marked.use` per-render (use `new Marked()` if per-document isolation is needed).
- **`workbox-window` devDependency** must be installed for `virtual:pwa-register/react`; `offlineReady` is only fired on first SW registration, `needRefresh` only fires with `registerType: 'prompt'`.
- **`registerType:'autoupdate'`** would skip the prompt entirely (auto-reload on new SW) — not what we want for a doc app; use `prompt`.
- **Appica TOC vs marked heading ids** must be aligned (B2) or right-rail TOC links break.

---

## Sources

- Kept:
  - Appica Installation — appica.dev/ui/docs/react/installation (package name, `@source`, import order, React 19/Tailwind 4 hard reqs, Vite framework notes)
  - Appica Theming — appica.dev/ui/docs/react/theming (token layers, `@theme inline`, raw vs theme tokens, radius, oklch)
  - Appica Dark Mode — appica.dev/ui/docs/react/dark-mode (class-based, ThemeProvider flow, `useTheme`, localStorage)
  - Appica Theme Provider — appica.dev/ui/docs/react/theme-provider (props: themes/defaultTheme/forcedTheme/enableSystem/storageKey/value/nonce)
  - Appica useTheme — appica.dev/ui/docs/react/use-theme (mounted guard + exact subpath)
  - Appica Fonts — appica.dev/ui/docs/react/fonts (`--font-sans/--font-mono`, self-hosting)
  - Appica Reduced Motion Provider — appica.dev/ui/docs/react/reduced-motion-provider (`ReducedMotionProvider`, `data-disable-animations`, `useReducedMotion`)
  - appica-dev/appica-ui on GitHub (`@appica/ui-react` package, subpath export map, versions, ESM, peer deps) — inspected directly from cloned source
  - Appica component source (navigation, breadcrumb, avatar, drawer, collapsible, tabs, toast, toc, loader, dropdown-menu, button) — inspected directly from cloned source for API shapes
  - marked.js.org/using_advanced (options: gfm/breaks/async, sanitize→DOMPurify, globals vs instance)
  - marked.js.org/using_pro (marked.use, extensions/tokenizer/renderer, container tokenizer with `this.lexer.blockTokens` + `this.parser.parse`)
  - marked-alert on npm / bent10/marked-extensions (GFM alerts)
  - marked-katex-extension on npm + GitHub (UziTech; maintained; katex >=0.16 <0.18)
  - UziTech/marked-katex-extension Releases (v5.1.10, marked v18 support)
  - mermaid npm (11.16.0) + mermaid-js/mermaid issue #2972 (custom marked mermaid renderer)
  - vite-pwa/vite-plugin-pwa docs/frameworks/react.md (virtual:pwa-register/react, `useRegisterSW`, ReloadPrompt pattern, workbox-window devDep)
  - vite-pwa/vite-plugin-pwa docs/guide/development.md (`devOptions.enabled`, navigateFallbackAllowlist, generateSW dev behavior)
  - vite-pwa/vite-plugin-pwa docs/guide/service-worker-precache.md + static-assets.md (`globPatterns` default `**/*.{js,css,html}`, includeAssets)
  - vite-pwa/vite-plugin-pwa GitHub issue #446 (cleanupOutdatedCaches caution), #350, #546 (navigateFallback)
  - paper: `adueck.github.io/blog/caching-everything...` (fully-offline Vite/React PWA approach)
  - Tailwind v4 (tailwindcss.com/blog/tailwindcss-v4, docs/installation/using-vite, docs on `@source`) + tailwindlabs discussion #18758 (library + `@source` requirement)
  - dompurify, marked, vite-plugin-pwa npm registry pages for frozen versions.
- Dropped:
  - Aplica DS / Material UI results — different (non-Appica) theming systems, not applicable.
  - `@maplezzk/llm-proxy` package-page hit — irrelevant to this stack.

## Gaps

- Appica `Toc`'s full sub-component export surface and whether `Toc` auto-picks up heading ids or must be wired (source read, but exact `TocLink` child API not fully enumerated) — verify against the `toc.tsx` exports during implementation.
- Exact `@source` relative path string for the final project layout must be computed from the real file tree (depends on where `index.css` lives — the shown `"../../node_modules/..."` is the npm default; count `../` accordingly).
- `marked` v18 `renderer.code({...})` token field names — confirmed token fields but verify `code` renderer signature against installed 18.0.9 typings at implementation time.
- Confirm `mermaid` + marked integration CSP needs (self-hosted mermaid is fine; `mermaid.run()` requires the DOM element already present).

Suggested next steps: scaffold the Vite React 19 project, apply the Lane-A install, then wire marked (Lane B) rendering into an article component using Appica `Toc`, then enable PWA (Lane C) and validate offline with a fresh build.
