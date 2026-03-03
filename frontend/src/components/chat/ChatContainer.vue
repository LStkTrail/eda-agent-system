<template>
  <div class="flex flex-col h-full bg-pixel-bg-deep/50">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b-2 border-pixel-border/20 bg-pixel-bg-dark/30">
      <div class="flex items-center gap-3">
        <button
          v-if="!sidebarOpen"
          class="text-pixel-text-dim hover:text-pixel-green font-pixel-mono text-xl cursor-pointer"
          @click="uiStore.setSidebarOpen(true)"
        >
          &#9776;
        </button>
        <h2 class="font-pixel text-[9px] text-pixel-text truncate max-w-[300px]">
          {{ chatStore.activeSession?.title || 'EDA AGENT' }}
        </h2>
        <PixelLoader v-if="chatStore.isStreaming" />
      </div>
    </div>

    <!-- Chat content -->
    <WelcomeScreen
      v-if="!chatStore.messages.length"
      @quick-prompt="handleQuickPrompt"
    />
    <MessageList
      v-else
      :messages="chatStore.messages"
    />

    <!-- Input -->
    <ChatInputBar
      :is-streaming="chatStore.isStreaming"
      @send="chatStore.sendMessage($event)"
      @cancel="chatStore.cancelStream()"
    />
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useUiStore } from '@/stores/ui'
import PixelLoader from '@/components/common/PixelLoader.vue'
import MessageList from './MessageList.vue'
import ChatInputBar from './ChatInputBar.vue'
import WelcomeScreen from './WelcomeScreen.vue'

defineProps<{ sidebarOpen: boolean }>()

const chatStore = useChatStore()
const uiStore = useUiStore()

function handleQuickPrompt(text: string) {
  chatStore.sendMessage(text)
}
</script>
