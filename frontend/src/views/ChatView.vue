<template>
  <div class="h-full flex">
    <!-- Sidebar -->
    <SidebarPanel :open="uiStore.sidebarOpen" />

    <!-- Chat Area -->
    <div class="flex-1 min-w-0">
      <ChatContainer :sidebar-open="uiStore.sidebarOpen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import SidebarPanel from '@/components/sidebar/SidebarPanel.vue'
import ChatContainer from '@/components/chat/ChatContainer.vue'

const uiStore = useUiStore()
</script>
