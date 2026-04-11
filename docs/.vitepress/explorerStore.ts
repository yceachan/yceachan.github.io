import { reactive } from 'vue'

export const explorerStore = reactive({
  currentPath: '/',
  sortKey: 'name' as 'name' | 'date',
  sortOrder: 'asc' as 'asc' | 'desc',
  profileOpen: false,
})
