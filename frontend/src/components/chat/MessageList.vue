<template>
  <div ref="listRef" class="flex-1 overflow-y-auto px-4 py-4">
    <div class="max-w-3xl mx-auto flex flex-col gap-4">
      <MessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '@/types'
import MessageBubble from './MessageBubble.vue'

const props = defineProps<{ messages: Message[] }>()

const listRef = ref<HTMLElement>()

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    }
  })
}

// Watch for message changes (new messages and streaming content updates)
watch(
  () => {
    const msgs = props.messages
    const lastMsg = msgs[msgs.length - 1]
    return lastMsg ? `${msgs.length}-${lastMsg.content.length}` : '0'
  },
  () => scrollToBottom(),
  { flush: 'post' }
)
</script>
