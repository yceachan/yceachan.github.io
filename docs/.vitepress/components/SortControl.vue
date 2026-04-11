<template>
  <div class="sort-control">
    <select v-model="explorerStore.sortKey" @change="save" class="sort-select">
      <option value="name">名称</option>
      <option value="date">日期</option>
    </select>
    <button class="sort-order" @click="toggleOrder" :title="explorerStore.sortOrder === 'asc' ? '升序' : '降序'">
      {{ explorerStore.sortOrder === 'asc' ? '↑' : '↓' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { explorerStore } from '../explorerStore'

const toggleOrder = () => {
  explorerStore.sortOrder = explorerStore.sortOrder === 'asc' ? 'desc' : 'asc'
  save()
}

const save = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('explorer:sort', `${explorerStore.sortKey}:${explorerStore.sortOrder}`)
  }
}
</script>

<style scoped>
.sort-control {
  --sort-item-width: 7ch;
  --sort-item-px: 1ch;
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-default-soft);
  border-radius: 6px;
  padding: 2px 4px;
}
.sort-select {
  background: transparent;
  border: none;
  color: var(--vp-c-text-2);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  padding: 4px var(--sort-item-px);
  min-width: var(--sort-item-width);
  box-sizing: border-box;
}
.sort-order {
  background: transparent;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 4px var(--sort-item-px);
  min-width: auto;
  box-sizing: border-box;
  border-radius: 4px;
}
.sort-order:hover {
  background: var(--vp-c-default-mute);
  color: var(--vp-c-text-1);
}
</style>
