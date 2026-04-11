<template>
  <div class="explorer-page">
    <div class="explorer-right">
      <ExplorerTopBar />
      <ExplorerList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vitepress'
import { explorerStore } from '../explorerStore'
import ExplorerTopBar from './ExplorerTopBar.vue'
import ExplorerList from './ExplorerList.vue'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  document.documentElement.classList.add('is-explorer')
  if (typeof window !== 'undefined') {
    const savedSort = localStorage.getItem('explorer:sort')
    if (savedSort) {
      const [key, order] = savedSort.split(':')
      if (key === 'name' || key === 'date') explorerStore.sortKey = key
      if (order === 'asc' || order === 'desc') explorerStore.sortOrder = order
    }
    
    // Parse query manually since Vitepress useRoute().query might be undefined during initial static mount
    const url = new URL(window.location.href)
    const queryPath = url.searchParams.get('path')
    if (queryPath) {
      explorerStore.currentPath = queryPath
    } else {
      explorerStore.currentPath = '/'
    }
  }
})

onUnmounted(() => {
  document.documentElement.classList.remove('is-explorer')
})

// watch hash/path change
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const url = new URL(window.location.href)
    const queryPath = url.searchParams.get('path')
    explorerStore.currentPath = queryPath || '/'
  })
}
</script>

<style scoped>
.explorer-page {
  position: fixed;
  top: var(--vp-nav-height);
  left: var(--vp-sidebar-width, 238px);
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  background-color: var(--vp-c-bg);
  z-index: 30; /* Higher than LocalNav but lower than VPSidebar (32) */
}
.explorer-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
@media (max-width: 959px) {
  .explorer-page {
    left: 0; /* Full screen on mobile */
  }
}
</style>
