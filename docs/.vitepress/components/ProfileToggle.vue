<template>
  <button class="profile-toggle" @click="toggle" aria-label="Toggle Profile">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { explorerStore } from '../explorerStore'

const toggle = () => {
  explorerStore.profileOpen = !explorerStore.profileOpen
}
</script>

<style scoped>
.profile-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}
.profile-toggle:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}
@media (max-width: 959px) {
  .profile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
