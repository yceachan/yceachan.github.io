import { defineConfigWithTheme } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { VitePWA } from 'vite-plugin-pwa'
import container from 'markdown-it-container'
import taskLists from 'markdown-it-task-lists'
import fs from 'fs'
import path from 'path'
import { docTreePlugin } from './plugins/docTreePlugin'

type ProfileConfig = {
  photo?: string
  name?: string
  bio?: string
  mail?: string
  github?: string
  repo?: string
  friends?: string[]
  copyright?: string
}

type ThemeConfig = DefaultTheme.Config & {
  profile?: ProfileConfig
}

type DocTreeNode = {
  type: 'file' | 'dir'
  name: string
  path: string
  children?: DocTreeNode[]
}


// 读取个人资料信息
const profilePath = path.resolve(__dirname, '../public/profile.json')
const logoSvgPath = fs.readFileSync(path.resolve(__dirname, '../public/profile-photo.svg'), 'utf-8')
// base64 sbg using in VitePress theme.head (near by topic , non used in yceachan's custom)
const logoBase64Url = `data:image/svg+xml;base64,${Buffer.from(logoSvgPath).toString('base64')}`

let profileData = { name: '', bio: '', email: '', github: '', repo: '', jpg: '', friends: [] as string[] }
try {
  profileData = JSON.parse(fs.readFileSync(profilePath, 'utf-8'))
} catch (e) {
  console.warn('Could not read profile.json, using fallback.')
}

const SIDEBAR_EXCLUDE = new Set([
  'index.md',
  '保险箱.md',
  'library.md',
  '001-guide.md',
  'guide.md',
  'chat.md',
  '.gitignore'
])

function walkDocsTree(dir: string, baseDir: string): DocTreeNode[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const nodes: DocTreeNode[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/')

    if (entry.name.startsWith('.')) continue
    if (relPath.startsWith('public/')) continue
    if (relPath.startsWith('98-Private/')) continue

    if (entry.isDirectory()) {
      const children = walkDocsTree(fullPath, baseDir)
      if (children.length === 0) continue
      nodes.push({
        type: 'dir',
        name: entry.name,
        path: `/${relPath}/`,
        children
      })
      continue
    }

    if (!entry.name.endsWith('.md')) continue
    if (SIDEBAR_EXCLUDE.has(entry.name)) continue

    const fileNoExt = relPath.replace(/\.md$/, '')
    const title = entry.name.replace(/\.md$/, '')
    nodes.push({
      type: 'file',
      name: title,
      path: `/${fileNoExt}`
    })
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    const aAscii = a.name.charCodeAt(0) < 0x80
    const bAscii = b.name.charCodeAt(0) < 0x80
    if (aAscii !== bAscii) return aAscii ? -1 : 1
    return a.name.localeCompare(b.name, 'zh-Hans-CN')
  })

  return nodes
}

function toSidebarItems(nodes: DocTreeNode[]): DefaultTheme.SidebarItem[] {
  return nodes.map((node) => {
    if (node.type === 'file') {
      return {
        text: node.name,
        link: node.path
      }
    }
    return {
      text: node.name,
      collapsed: true,
      items: toSidebarItems(node.children || [])
    }
  })
}

function collectScopedSidebar(
  nodes: DocTreeNode[],
  target: DefaultTheme.SidebarMulti
) {
  for (const node of nodes) {
    if (node.type !== 'dir') continue
    target[node.path] = [
      {
        text: node.name,
        collapsed: false,
        items: toSidebarItems(node.children || [])
      }
    ]
    collectScopedSidebar(node.children || [], target)
  }
}

const docsRoot = path.resolve(__dirname, '../')
const docsTree = walkDocsTree(docsRoot, docsRoot)
const scopedSidebarConfig: DefaultTheme.SidebarMulti = {}
collectScopedSidebar(docsTree, scopedSidebarConfig)

// https://vitepress.dev/reference/site-config
// this section sets the ui behavior of website page titile.
export default withMermaid(defineConfigWithTheme<ThemeConfig>({
  lang: 'zh-CN',
  title: `${profileData.name}'s Knowledge Base`,
  titleTemplate: false,
  description: profileData.bio || "As the stack grows",
  head: [
    ['link', { rel: 'manifest', href: '/manifest.webmanifest' }],
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'icon', href: '/profile-photo.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'alternate icon', href: logoBase64Url }],
    ['link', { rel: 'apple-touch-icon', href: '/profile-photo-192.jpg' }],
    ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }]
  ],

  // Upstream-synced notes reference source files outside the md-only tree
  // (e.g. `../../sdk/.../spinlock.c`) and occasional intra-repo orphans. Don't
  // fail the build on those — they'd require touching upstream content.
  ignoreDeadLinks: true,

  // Skip vendored / third-party READMEs whose raw HTML is too lax for Vue's
  // template compiler (e.g. unclosed <p> tags in Catppuccin's footer). The
  // files stay in the repo; they just aren't rendered as pages.
  srcExclude: [
    '**/windows-terminal-main/**',
  ],

  vite: {
    plugins: [
      docTreePlugin(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['profile-photo.svg', 'favicon.ico'],
        // 开发模式下也产出 manifest/SW，否则 dev 服务器请求
        // `/manifest.webmanifest` 会落到 SPA fallback 返回 HTML，
        // Chrome 解析时报 "Manifest: Line: 1, column: 1, Syntax error."
        devOptions: {
          enabled: true,
          type: 'module'
        },
        manifest: {
          name: `${profileData.name}'s Knowledge Base`,
          short_name: `${profileData.name}'s Knowledge Base`,
          description: 'Personal Knowledge Base powered by VitePress',
          theme_color: '#ffffff',
          scope: '/',      // 围墙是整个网站
          start_url: '/',  // 打开 App 第一眼看哪里
          id: '/',         // App 的唯一标识符
          icons: [
            {
              src: 'profile-photo-192.jpg',
              sizes: '192x192',
              type: 'image/jpeg'
            },
            {
              src: 'profile-photo-512.jpg',
              sizes: '512x512',
              type: 'image/jpeg'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          // Default is 2 MiB; the local search index grows past that once the
          // MPUthings note set lands. Bump to 5 MiB so build doesn't abort.
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          // VitePress is MPA — every page has its own .html. The default
          // navigateFallback ('index.html') would hijack `/?path=/MCUthings`
          // style navigations with a precache lookup that races the SW's
          // own installation, yielding `non-precached-url` on first load and
          // stale sidebar content until Ctrl+F5.
          navigateFallback: null,
          // Drop stale precaches from previous deploys so old SWs can't keep
          // serving broken chunks after we ship config changes.
          cleanupOutdatedCaches: true,
        }
      })
    ]
  },

  themeConfig: {
    siteTitle: `${profileData.name}'s Knowledge Base`,
    //this logo use in title bar ,non theme bar
    // logo: logoBase64Url,
    
    profile: {
      photo: profileData.jpg,
      name: profileData.name,
      bio: profileData.bio,
      mail: profileData.email,
      github: profileData.github,
      repo: profileData.repo,
      friends: profileData.friends,
      copyright: profileData.copyright
    },

    outline: {
      level: 'deep'
    },
    
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: scopedSidebarConfig,

    socialLinks: [
      { icon: 'github', link: `${profileData.repo}` }
    ],

    search: {
      provider: 'local'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © 2024-present ${profileData.name}`
    }

  },
  markdown: {
    math: true,
    anchor: {
      slugify: (str) => {
        const slug = str
          .trim()
          .toLowerCase()
          // 核心正则：匹配 空格、点、英文冒号、中文冒号、英文括号、中文括号、百分号
          .replace(/[\s.:：()（）%]+/g, '-') 
          // 将连续的多个横线合并为一个
          .replace(/-+/g, '-')
          // 去掉开头和结尾的横线
          .replace(/^-+|-+$/g, '');

        // 如果是数字开头，为了符合 HTML4 规范，加下划线前缀
        return /^\d/.test(slug) ? '_' + slug : slug;
      }
    },
    config: (md) => {
      // Rewrite fence languages that Shiki doesn't bundle to `txt`, so the
      // build doesn't fail on `dts`, `kconfig`, `assembly`, ... The fence is
      // still rendered as a code block — just without syntax highlighting.
      // Shiki's alias (languageAlias) doesn't help here: its plain-lang
      // fast-path tests the raw lang id before alias resolution runs.
      const UNSUPPORTED_LANGS = new Set([
        'kconfig', 'dts', 'devicetree', 'cfg', 'ld', 'assembly', 'pwsh', 'pfofile',
      ])
      md.core.ruler.after('block', 'downgrade-unsupported-fence-lang', (state) => {
        for (const tok of state.tokens) {
          if (tok.type !== 'fence') continue
          const lang = (tok.info || '').trim().split(/\s+/)[0].toLowerCase()
          if (UNSUPPORTED_LANGS.has(lang)) tok.info = 'txt'
        }
        return false
      })

      // Escape bare <identifier> placeholders (e.g. `<file>`, `<path>`, `<library>`
      // in prose / table cells). markdown-it tokenises them as html_inline and
      // passes them through raw, which makes Vue's template compiler see them
      // as unclosed tags and aborts the build. We rewrite such tokens to text
      // unless the tag name is in a known-safe allowlist of real inline HTML.
      const SAFE_INLINE_HTML = new Set([
        'a','abbr','audio','b','blockquote','br','code','del','details','div',
        'em','figcaption','figure','hr','i','iframe','img','ins','kbd','li',
        'mark','ol','p','pre','q','s','small','source','span','strong','sub',
        'summary','sup','table','tbody','td','th','thead','tr','u','ul','video',
      ])
      const PLACEHOLDER_RE = /^<\/?([a-zA-Z_][\w.\-]*)\s*\/?>$/
      md.core.ruler.after('inline', 'escape-bare-placeholders', (state) => {
        for (const block of state.tokens) {
          if (block.type !== 'inline' || !block.children) continue
          for (const tok of block.children) {
            if (tok.type !== 'html_inline') continue
            const m = tok.content.match(PLACEHOLDER_RE)
            if (!m) continue
            if (SAFE_INLINE_HTML.has(m[1].toLowerCase())) continue
            tok.type = 'text'
            tok.content = tok.content
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
          }
        }
        return false
      })

      // Neutralise images whose src is a local absolute path (Typora leftover
      // `C:\Users\...`, `file://...`, or any `/home/<user>/...`). Vite would
      // otherwise try to resolve them as module imports and abort the build.
      const BROKEN_SRC_RE = /^(?:[a-zA-Z]:(?:[\\/]|%5[Cc]|%2[Ff])|file:|\\\\|\/(?:home|Users|mnt|root|tmp)\/)/
      const HTML_IMG_SRC_RE = /<img\b([^>]*?)\bsrc\s*=\s*(["'])([^"']*)\2/gi
      md.core.ruler.after('inline', 'neutralise-broken-images', (state) => {
        const scrubHtml = (html: string) =>
          html.replace(HTML_IMG_SRC_RE, (full, pre, q, src) =>
            BROKEN_SRC_RE.test(src) ? `<img${pre}src=${q}data:,${q}` : full
          )
        for (const block of state.tokens) {
          if (block.type === 'html_block') {
            block.content = scrubHtml(block.content)
            continue
          }
          if (block.type !== 'inline' || !block.children) continue
          for (const tok of block.children) {
            if (tok.type === 'html_inline') {
              tok.content = scrubHtml(tok.content)
              continue
            }
            if (tok.type !== 'image') continue
            const srcIdx = tok.attrIndex('src')
            if (srcIdx < 0) continue
            const src = tok.attrs![srcIdx][1]
            if (!BROKEN_SRC_RE.test(src)) continue
            const alt = tok.children?.reduce((a, c) => a + (c.content || ''), '') || 'broken image'
            tok.type = 'text'
            tok.tag = ''
            tok.attrs = null
            tok.children = null
            tok.content = `[broken image: ${alt}]`
          }
        }
        return false
      })

      md.use(taskLists)
      md.use(container, 'callout', {
        validate: (params) => params.trim().match(/^callout\s+(.*)$/),
        render: (tokens, idx) => {
          const m = tokens[idx].info.trim().match(/^callout\s+(.*)$/);
          if (tokens[idx].nesting === 1) {
            const icon = m && m[1] ? m[1] : '💡';
            return `<div class="callout custom-block"><span class="callout-icon">${icon}</span><div class="callout-content">`;
          }
          else {
            return '</div></div>';
          }
        }
      })
      // ---------------------------------------------------------
      // 拦截 Markdown 内部链接，使其匹配上面的 Slugify 规则
      // ---------------------------------------------------------
      const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        const hrefIndex = token.attrIndex('href');

        if (hrefIndex >= 0) {
          const hrefAttr = token.attrs[hrefIndex];
          const url = hrefAttr[1];

          // 只处理带 # 的内部锚点链接
          if (url.includes('#') && !url.startsWith('http')) {
            const [path, hash] = url.split('#');
            
            if (hash) {
              let decoded = hash;
              try {
                decoded = decodeURIComponent(hash);
              } catch (e) {
                console.warn(`[VitePress] Malformed URI in hash: ${hash}`);
              }
              
              // 使用与上面 anchor.slugify 完全一致的逻辑处理链接
              let newHash = decoded
                .trim()
                .toLowerCase()
                .replace(/[\s.:：()（）]+/g, '-') 
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');

              if (/^\d/.test(newHash)) {
                newHash = '_' + newHash;
              }

              hrefAttr[1] = `${path}#${newHash}`;
            }
          }
        }
        return defaultRender(tokens, idx, options, env, self);
      };
    }
  }
}))
