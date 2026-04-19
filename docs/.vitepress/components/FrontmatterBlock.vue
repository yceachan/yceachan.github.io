<template>
  <div v-if="yamlText" class="frontmatter-block vp-doc">
    <pre><code class="language-yaml">{{ yamlText }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

const { frontmatter } = useData()
const route = useRoute()

// Keys VitePress / our theme use for layout control — never render them
// as content metadata, they're plumbing.
const HIDE_KEYS = new Set([
  'layout', 'outline', 'lastUpdated', 'editLink', 'navbar',
  'sidebar', 'aside', 'pageClass', 'head', 'titleTemplate'
])

const serialize = (v: unknown, indent = 0): string => {
  const pad = '  '.repeat(indent)
  if (v === null || v === undefined) return '~'
  if (typeof v === 'string') {
    // Quote if the string would otherwise be ambiguous (contains colons,
    // starts with a YAML special char, or is a pure number).
    if (/^[-?:,\[\]{}#&*!|>'"%@`]|:\s|^\s|\s$|^\d+$/.test(v)) {
      return JSON.stringify(v)
    }
    return v
  }
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]'
    if (v.every(x => typeof x === 'string' || typeof x === 'number')) {
      return '[' + v.map(x => serialize(x, 0)).join(', ') + ']'
    }
    return '\n' + v.map(x => `${pad}- ${serialize(x, indent + 1).trimStart()}`).join('\n')
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return '\n' + entries.map(([k, val]) => {
      const s = serialize(val, indent + 1)
      return s.startsWith('\n')
        ? `${pad}${k}:${s}`
        : `${pad}${k}: ${s}`
    }).join('\n')
  }
  return String(v)
}

const yamlText = computed(() => {
  // Skip on home / explorer — index.md has its own layout.
  const p = route.path.replace(/\.html$/, '')
  if (p === '/' || p === '/index') return ''

  const fm = frontmatter.value || {}
  const entries = Object.entries(fm).filter(([k, v]) => {
    if (HIDE_KEYS.has(k)) return false
    if (v === undefined || v === null || v === '') return false
    return true
  })
  if (entries.length === 0) return ''

  return entries.map(([k, v]) => {
    const s = serialize(v, 1)
    return s.startsWith('\n') ? `${k}:${s}` : `${k}: ${s}`
  }).join('\n')
})
</script>

<style scoped>
.frontmatter-block {
  margin: 0 0 24px;
}
.frontmatter-block pre {
  margin: 0;
  padding: 14px 18px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  color: var(--vp-c-text-2);
}
.frontmatter-block code {
  font-family: var(--vp-font-family-mono);
  background: transparent;
  padding: 0;
  white-space: pre;
  color: inherit;
}
</style>
