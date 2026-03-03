<template>
  <PixelButton
    variant="secondary"
    size="md"
    class="w-full flex items-center justify-center gap-2"
    @click="chatStore.createNewSession()"
  >
    <span class="text-pixel-green">+</span> NEW CHAT
  </PixelButton>
</template>

<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import PixelButton from '@/components/common/PixelButton.vue'

const chatStore = useChatStore()
</script>
