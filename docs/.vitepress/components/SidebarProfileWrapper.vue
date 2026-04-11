<template>
  <div v-if="isExplorer" class="sidebar-profile-wrapper">
    <ProfileSidebar class="profile-sidebar-component" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'
import ProfileSidebar from './ProfileSidebar.vue'

const route = useRoute()
const isExplorer = computed(() => {
  const path = route.path.replace(/\.html$/, '')
  return path === '/' || path === '/index'
})
</script>

<style scoped>
@media (min-width: 960px) {
  .sidebar-profile-wrapper {
    position: fixed;
    top: var(--vp-nav-height);
    bottom: 0;
    left: 0;
    width: var(--vp-sidebar-width, 254px);
    z-index: 35; /* Above .VPSidebar but below other stuff */
  }
  .profile-sidebar-component {
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
}
</style>
