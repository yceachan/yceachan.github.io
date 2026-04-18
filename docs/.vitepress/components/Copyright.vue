<template>
  <div class="site-copyright" :class="placement">
    {{ profile.copyright }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  placement: 'sidebar' | 'doc'
}>()

const { theme } = useData()
const profile = computed(() => theme.value.profile || {})
</script>

<style scoped>
.site-copyright {
  color: var(--vp-c-text-3);
  font-size: 12px;
  text-align: center;
}

.site-copyright.sidebar {
  padding: 16px;
  margin-top: auto;
}

.site-copyright.doc {
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
