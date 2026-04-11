import { defineConfigWithTheme } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
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

// 自动获取侧边栏配置
const sidebarConfig = generateSidebar({
  documentRootPath: 'docs',
  useTitleFromFileHeading: true,
  collapsed: true,
  excludeByGlobPattern: ['index.md', '**/index.md', '.gitignore', '98-Private/**', 'chat.md','保险箱.md', 'guide.md','001-guide.md','library.md']
})

const SIDEBAR_EXCLUDE = new Set([
  'index.md',
  '保险箱.md',
  'library.md',
  '001-guide.md',
  'guide.md',
  'chat.md',
  '.gitignore'
])

function readH1Title(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const match = content.match(/^#\s+(.+)$/m)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

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
    const title = readH1Title(fullPath) || entry.name.replace(/\.md$/, '')
    nodes.push({
      type: 'file',
      name: title,
      path: `/${fileNoExt}`
    })
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
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
      collapsed: false,
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
const scopedSidebarConfig: DefaultTheme.SidebarMulti = {
  '/': sidebarConfig as DefaultTheme.SidebarItem[]
}
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
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }]
  ],

  ignoreDeadLinks: [
    '/index.md'
  ],

  vite: {
    plugins: [
      docTreePlugin(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['profile-photo.svg', 'favicon.ico'],
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
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
      friends: profileData.friends
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
