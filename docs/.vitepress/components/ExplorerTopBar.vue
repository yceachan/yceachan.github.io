<template>
  <div class="explorer-topbar">
    <ProfileToggle />
    <ExplorerBreadcrumb />
    <div class="spacer"></div>
    <SortControl />
  </div>
</template>

<script setup lang="ts">
import ProfileToggle from './ProfileToggle.vue'
import ExplorerBreadcrumb from './ExplorerBreadcrumb.vue'
import SortControl from './SortControl.vue'
</script>

<style scoped>
.explorer-topbar {
  flex-shrink: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.spacer {
  flex: 1;
}
@media (max-width: 959px) {
  .explorer-topbar {
    padding: 12px 16px;
  }
}
</style>
