import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSidebarOpen(val: boolean) {
    sidebarOpen.value = val
  }

  return { sidebarOpen, toggleSidebar, setSidebarOpen }
})
