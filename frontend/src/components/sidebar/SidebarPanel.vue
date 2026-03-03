<template>
  <div
    class="h-full flex flex-col bg-pixel-bg-dark border-r-2 border-pixel-border/30 select-none"
    :class="{ 'w-64': open, 'w-0 overflow-hidden border-r-0': !open }"
    style="transition: width 0.15s steps(4)"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-4 border-b border-pixel-border/20">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 bg-pixel-green animate-glow-pulse" />
        <span class="font-pixel text-pixel-green text-[8px] pixel-text-glow">EDA AGENT</span>
      </div>
      <button
        class="text-pixel-text-dim hover:text-pixel-green text-lg font-pixel-mono cursor-pointer"
        @click="uiStore.toggleSidebar()"
      >
        &times;
      </button>
    </div>

    <!-- New Chat Button -->
    <div class="px-3 py-3">
      <NewChatButton />
    </div>

    <!-- Session List -->
    <div class="flex-1 overflow-y-auto px-2">
      <SessionList />
    </div>

    <!-- Footer: User info -->
    <div class="px-4 py-3 border-t border-pixel-border/20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 bg-pixel-yellow" />
          <span class="font-pixel-mono text-pixel-text-dim text-sm truncate max-w-[120px]">
            {{ authStore.username || 'USER' }}
          </span>
        </div>
        <button
          class="font-pixel text-[7px] text-pixel-text-dim hover:text-red-400 cursor-pointer uppercase"
          @click="authStore.logout()"
        >
          EXIT
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import NewChatButton from './NewChatButton.vue'
import SessionList from './SessionList.vue'

defineProps<{ open: boolean }>()

const authStore = useAuthStore()
const uiStore = useUiStore()
</script>
