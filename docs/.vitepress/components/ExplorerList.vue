<template>
  <div class="explorer-main">
    <div v-if="currentNodes.length === 0" class="empty-state">
      该目录下没有文件
    </div>
    <div class="explorer-grid" :class="{ 'is-root-grid': isRoot }" v-else>
      <ExplorerItem 
        v-for="node in currentNodes" 
        :key="node.path" 
        :node="node"
        :mode="isRoot ? 'icon' : 'list'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore
import docTree from 'virtual:doc-tree'
import { explorerStore } from '../explorerStore'
import ExplorerItem from './ExplorerItem.vue'
import type { DocNode } from '../plugins/docTreePlugin'

const tree = docTree as DocNode[]

function findNodeByPath(nodes: DocNode[], path: string): DocNode[] | null {
  if (path === '' || path === '/') return nodes
  
  const segments = path.replace(/^\/+|\/+$/g, '').split('/')
  let current: DocNode[] | undefined = nodes

  for (const segment of segments) {
    if (!current) return null
    const found = current.find(n => n.type === 'dir' && n.rawName === segment)
    if (!found) return null
    current = found.children
  }
  return current || null
}

const currentNodes = computed(() => {
  const nodes = findNodeByPath(tree, explorerStore.currentPath) || []
  
  const dirs = nodes.filter(n => n.type === 'dir')
  const files = nodes.filter(n => n.type === 'file')

  const nameCmp = (a: DocNode, b: DocNode) => {
    const aAscii = a.name.charCodeAt(0) < 0x80
    const bAscii = b.name.charCodeAt(0) < 0x80
    if (aAscii !== bAscii) return aAscii ? -1 : 1
    return a.name.localeCompare(b.name, 'zh-Hans-CN')
  }
  const cmp = explorerStore.sortKey === 'name'
    ? nameCmp
    : (a: DocNode, b: DocNode) => a.mtime - b.mtime

  dirs.sort(cmp)
  files.sort(cmp)

  if (explorerStore.sortOrder === 'desc') {
    dirs.reverse()
    files.reverse()
  }

  return [...dirs, ...files]
})

const isRoot = computed(() => {
  const p = explorerStore.currentPath || '/'
  return p === '/' || p === ''
})
</script>

<style scoped>
.explorer-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}
.empty-state {
  color: var(--vp-c-text-2);
  text-align: center;
  padding: 48px;
}
.explorer-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.explorer-grid.is-root-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 16px;
  justify-content: flex-start;
}

@media (max-width: 959px) {
  .explorer-grid.is-root-grid {
    grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
    gap: 10px;
  }
}
</style>
