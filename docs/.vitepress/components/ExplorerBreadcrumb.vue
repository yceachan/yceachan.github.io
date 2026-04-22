<template>
  <div class="breadcrumb" v-if="shouldShow">
    <a href="javascript:void(0)" class="crumb-item" @click="go('/')">🏠</a>

    <template v-for="(segment, idx) in visibleSegments" :key="idx">
      <span class="separator">/</span>
      <span v-if="segment.isEllipsis" class="crumb-item ellipsis" :title="fullPath">...</span>
      <span v-else-if="segment.isCurrent" class="crumb-item text current">{{ segment.name }}</span>
      <a v-else href="javascript:void(0)" class="crumb-item text" @click="go(segment.path)">{{ segment.name }}</a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vitepress'
import { explorerStore } from '../explorerStore'

const props = withDefaults(defineProps<{ context?: 'doc' | 'explorer' }>(), {
  context: 'doc'
})

const router = useRouter()
const route = useRoute()

const isExplorer = computed(() => {
  const p = route.path.replace(/\.html$/, '')
  return p === '/' || p === '/index'
})

// Two instances render on the home page: one inside ExplorerTopBar
// (context=explorer) and one via the `doc-before` slot (context=doc).
// Suppress the doc-slot one on the explorer page so the breadcrumb
// doesn't duplicate underneath the Explorer overlay — only the TopBar
// copy remains.
const shouldShow = computed(() => {
  if (props.context === 'doc' && isExplorer.value) return false
  return visibleSegments.value.length > 0 || props.context === 'explorer'
})

const fullPath = computed(() => {
  if (isExplorer.value) return explorerStore.currentPath
  return route.path.replace(/\.html$/, '')
})

const visibleSegments = computed(() => {
  const path = fullPath.value
  if (!path || path === '/') return []

  const parts = path.replace(/^\/+|\/+$/g, '').split('/').map(decodeURIComponent)
  const lastIdx = parts.length - 1

  const makeSeg = (i: number) => ({
    name: parts[i],
    // On md page the last segment is the file itself, not a dir — mark
    // as non-clickable current crumb. In explorer mode every segment is a
    // dir and remains clickable.
    path: '/' + parts.slice(0, i + 1).join('/'),
    isEllipsis: false,
    isCurrent: !isExplorer.value && i === lastIdx
  })

  if (parts.length <= 3) {
    return parts.map((_, i) => makeSeg(i))
  }
  return [
    { name: '...', path: '', isEllipsis: true, isCurrent: false },
    makeSeg(lastIdx - 1),
    makeSeg(lastIdx)
  ]
})

function go(path: string) {
  // Explorer 内原地跳转时先同步 store，避免仅依赖 router.onAfterRouteChange：
  // 同路由仅 query 变化时该钩子偶发不触发，会出现 URL 已改但视图未刷新的情况。
  if (isExplorer.value) explorerStore.currentPath = path
  router.go(`/?path=${encodeURIComponent(path)}`)
}
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
}
.crumb-item {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}
.crumb-item.text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.crumb-item:hover {
  color: var(--vp-c-brand);
}
.separator {
  color: var(--vp-c-text-3);
  margin: 0 6px;
}
.ellipsis {
  cursor: default;
}
.ellipsis:hover {
  color: var(--vp-c-text-2);
}
.crumb-item.current {
  color: var(--vp-c-text-1);
  font-weight: 600;
  cursor: default;
}
</style>
