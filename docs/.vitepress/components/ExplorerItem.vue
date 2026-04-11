<template>
  <div class="explorer-item" :class="{ 'is-icon': mode === 'icon' }" @click="handleClick">
    <div class="icon">{{ node.type === 'dir' ? '📂' : '📄' }}</div>
    <div class="name-container">
      <span class="name" :title="node.name">{{ node.name }}</span>
    </div>
    <div class="date" v-if="mode !== 'icon' && dateStr">{{ dateStr }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { explorerStore } from '../explorerStore'
import type { DocNode } from '../plugins/docTreePlugin'

const props = withDefaults(defineProps<{ node: DocNode; mode?: 'list' | 'icon' }>(), {
  mode: 'list'
})
const router = useRouter()

const dateStr = computed(() => {
  if (!props.node.mtime) return ''
  const d = new Date(props.node.mtime)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

function handleClick() {
  if (props.node.type === 'dir') {
    router.go(`/?path=${encodeURIComponent(props.node.path)}`)
  } else {
    router.go(withBase(props.node.path))
  }
}
</script>

<style scoped>
.explorer-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
}

.explorer-item.is-icon {
  --icon-name-font-size: 16px;
  --icon-name-line-height: 1.35;
  --icon-name-lines: 2;
  --icon-text-height: calc(var(--icon-name-font-size) * var(--icon-name-line-height) * var(--icon-name-lines));
  position: relative;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  min-height: 200px;
  height: 200px;
  padding: 16px 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
}

.explorer-item:hover {
  background-color: var(--vp-c-default-soft);
}
.icon {
  margin-right: 12px;
  font-size: 18px;
}

.explorer-item.is-icon .icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% - (var(--icon-text-height) / 2)));
  margin-right: 0;
  margin-bottom: 0;
  font-size: 68px;
  line-height: 1;
}

.name-container {
  flex: 1;
  min-width: 0;
}

.explorer-item.is-icon .name-container {
  flex: 0 1 auto;
  width: 100%;
  margin-top: 0;
  z-index: 1;
}

.name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--vp-c-text-1);
}

.explorer-item.is-icon .name {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: var(--icon-name-line-height);
  font-size: var(--icon-name-font-size);
  font-weight: 400;
}

.date {
  font-size: 13px;
  color: var(--vp-c-text-3);
  margin-left: 16px;
}

@media (max-width: 959px) {
  .explorer-item.is-icon {
    min-height: 92px;
    height: auto;
    padding: 10px 6px;
  }

  .explorer-item.is-icon .icon {
    position: static;
    transform: none;
    font-size: 28px;
    margin-bottom: 8px;
  }

  .explorer-item.is-icon .name {
    font-size: 13px;
  }
}
</style>
