<template>
  <div class="border-t-2 border-pixel-border/30 bg-pixel-bg-dark/50 px-4 py-3">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-end gap-3 pixel-border bg-pixel-bg-deep p-2">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          :placeholder="isStreaming ? 'AI IS THINKING...' : 'INPUT YOUR EDA QUESTION...'"
          :disabled="isStreaming"
          rows="1"
          class="flex-1 bg-transparent text-pixel-text font-pixel-mono text-base resize-none outline-none placeholder:text-pixel-text-dim/30 disabled:opacity-50 min-h-[28px] max-h-[120px] leading-relaxed py-1"
          @keydown="handleKeydown"
          @input="autoResize"
        />
        <button
          v-if="isStreaming"
          class="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-red-500/50 bg-red-900/30 text-red-400 hover:bg-red-900/60 cursor-pointer font-pixel text-xs"
          @click="$emit('cancel')"
        >
          &#9632;
        </button>
        <button
          v-else
          class="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 cursor-pointer font-pixel text-sm"
          :class="inputText.trim()
            ? 'border-pixel-green/50 bg-pixel-green/10 text-pixel-green hover:bg-pixel-green/20'
            : 'border-pixel-text-dim/20 bg-pixel-bg-mid text-pixel-text-dim/30 cursor-not-allowed'"
          :disabled="!inputText.trim()"
          @click="handleSend"
        >
          &#9654;
        </button>
      </div>
      <p class="font-pixel text-[6px] text-pixel-text-dim/30 mt-1.5 text-center">
        PRESS ENTER TO SEND &middot; SHIFT+ENTER FOR NEW LINE
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

defineProps<{ isStreaming: boolean }>()
const emit = defineEmits<{
  send: [content: string]
  cancel: []
}>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

function handleSend() {
  if (!inputText.value.trim()) return
  emit('send', inputText.value)
  inputText.value = ''
  nextTick(autoResize)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize() {
  const el = textareaRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}
</script>
