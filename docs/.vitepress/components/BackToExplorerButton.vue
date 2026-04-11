<template>
  <a v-if="visible"
     :href="targetHref"
     class="back-to-explorer"
     :title="`返回此文档所在目录: ${parentPath || '根目录'}`"
     @click="go">
    <span class="icon">↰</span>
    <span class="label">同级目录</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, withBase } from 'vitepress'

const route = useRoute()
const router = useRouter()

const HIDDEN_PATHS = ['/', '/index', '/保险箱', '/保险箱.html', '/library', '/library.html']

const visible = computed(() => {
  const p = route.path.replace(/\.html$/, '')
  return !HIDDEN_PATHS.includes(p)
})

const parentPath = computed(() => {
  const segments = route.path.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '').split('/')
  segments.pop()
  return segments.join('/')
})

const targetHref = computed(() =>
  parentPath.value
    ? withBase(`/?path=${encodeURIComponent(parentPath.value)}`)
    : withBase('/')
)

function go(e: MouseEvent) {
  e.preventDefault()
  router.go(targetHref.value)
}
</script>

<style scoped>
.back-to-explorer {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  height: var(--vp-nav-height); /* Match navbar height for alignment */
}
.back-to-explorer:hover {
  color: var(--vp-c-brand);
}
.icon {
  font-size: 18px;
  margin-right: 4px;
}
@media (max-width: 959px) {
  .label {
    display: none;
  }
  .icon {
    margin-right: 0;
  }
}
</style>
