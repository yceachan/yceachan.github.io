<template>
  <div class="nav-left-actions">
    <a
      v-if="showBack"
      :href="backHref"
      class="nav-left-link"
      :title="`返回 Explorer 目录: ${parentPath || '/'}`"
      @click="goBack"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 5 4 12l7 7" />
        <path d="M4 12h9a7 7 0 0 1 7 7" />
      </svg>
      <span>Back</span>
    </a>

    <a :href="homeHref" class="nav-left-link" title="回到首页" @click="goHome">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </svg>
      <span>Home</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, withBase } from 'vitepress'

const route = useRoute()
const router = useRouter()

const hiddenPaths = new Set(['/', '/index', '/保险箱', '/保险箱.html', '/library', '/library.html'])

const normalizePath = (raw: string) => {
  const withoutHtml = raw.replace(/\.html$/, '')
  try {
    return decodeURIComponent(withoutHtml)
  } catch {
    return withoutHtml
  }
}

const currentPath = computed(() => normalizePath(route.path))

const showBack = computed(() => !hiddenPaths.has(currentPath.value))

const parentPath = computed(() => {
  const parts = currentPath.value.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)
  parts.pop()
  return parts.join('/')
})

const backHref = computed(() => {
  if (!parentPath.value) {
    return withBase('/')
  }
  return withBase(`/?path=${encodeURIComponent(parentPath.value)}`)
})

const homeHref = computed(() => withBase('/'))

function goBack(e: MouseEvent) {
  e.preventDefault()
  router.go(backHref.value)
}

function goHome(e: MouseEvent) {
  e.preventDefault()
  router.go(homeHref.value)
}
</script>

<style scoped>
.nav-left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 10px;
}

.nav-left-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 13px;
  line-height: 1;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
}

.nav-left-link:hover {
  background: var(--vp-c-default-soft);
  border-color: var(--vp-c-divider);
}

.nav-left-link svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 959px) {
  .nav-left-actions {
    display: none;
  }
}
</style>
