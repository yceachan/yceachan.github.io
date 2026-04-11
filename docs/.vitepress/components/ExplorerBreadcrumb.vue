<template>
  <div class="breadcrumb">
    <a href="javascript:void(0)" class="crumb-item" @click="go('/')">🏠</a>
    
    <template v-for="(segment, idx) in visibleSegments" :key="idx">
      <span class="separator">/</span>
      <span v-if="segment.isEllipsis" class="crumb-item ellipsis" :title="fullPath">...</span>
      <a v-else href="javascript:void(0)" class="crumb-item text" @click="go(segment.path)">{{ segment.name }}</a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vitepress'
import { explorerStore } from '../explorerStore'

const router = useRouter()

const fullPath = computed(() => explorerStore.currentPath)

const visibleSegments = computed(() => {
  const path = fullPath.value
  if (!path || path === '/') return []
  
  const parts = path.replace(/^\/+|\/+$/g, '').split('/')
  
  if (parts.length <= 3) {
    return parts.map((name, i) => ({
      name,
      path: '/' + parts.slice(0, i + 1).join('/'),
      isEllipsis: false
    }))
  } else {
    return [
      { name: '...', path: '', isEllipsis: true },
      { name: parts[parts.length - 2], path: '/' + parts.slice(0, parts.length - 1).join('/'), isEllipsis: false },
      { name: parts[parts.length - 1], path: '/' + parts.slice(0, parts.length).join('/'), isEllipsis: false }
    ]
  }
})

function go(path: string) {
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
</style>
