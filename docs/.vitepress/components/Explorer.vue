<template>
  <div class="explorer-page">
    <div class="explorer-right">
      <ExplorerTopBar />
      <ExplorerList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'
import { explorerStore } from '../explorerStore'
import ExplorerTopBar from './ExplorerTopBar.vue'
import ExplorerList from './ExplorerList.vue'

const router = useRouter()

function syncPathFromUrl() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  explorerStore.currentPath = url.searchParams.get('path') || '/'
}

// VitePress keeps the Explorer mounted across `/?path=X` → `/?path=Y` clicks
// (same route, only the query changes), so onMounted fires once and popstate
// only covers back/forward. Hook onAfterRouteChange so every router.go call
// re-reads the query too.
const prevAfter = router.onAfterRouteChange
router.onAfterRouteChange = (to) => {
  prevAfter?.(to)
  syncPathFromUrl()
}

onMounted(() => {
  document.documentElement.classList.add('is-explorer')
  if (typeof window !== 'undefined') {
    const savedSort = localStorage.getItem('explorer:sort')
    if (savedSort) {
      const [key, order] = savedSort.split(':')
      if (key === 'name' || key === 'date') explorerStore.sortKey = key
      if (order === 'asc' || order === 'desc') explorerStore.sortOrder = order
    }
    syncPathFromUrl()
  }
})

onUnmounted(() => {
  document.documentElement.classList.remove('is-explorer')
  if (router.onAfterRouteChange !== prevAfter) {
    router.onAfterRouteChange = prevAfter
  }
})

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', syncPathFromUrl)
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
