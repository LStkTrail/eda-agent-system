<template>
  <div
    class="flex animate-pixel-slide-in"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <div class="max-w-[80%] flex gap-3" :class="isUser ? 'flex-row-reverse' : 'flex-row'">
      <!-- Avatar -->
      <div
        class="w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 font-pixel text-[8px]"
        :class="isUser
          ? 'bg-pixel-yellow/20 border-pixel-yellow/40 text-pixel-yellow'
          : 'bg-pixel-green/20 border-pixel-green/40 text-pixel-green'"
      >
        {{ isUser ? 'U' : 'AI' }}
      </div>

      <!-- Bubble -->
      <div
        class="px-4 py-3 border-2"
        :class="isUser
          ? 'bg-pixel-yellow/5 border-pixel-yellow/30 text-pixel-text'
          : 'bg-pixel-bg-mid border-pixel-border/40 text-pixel-text'"
      >
        <div class="font-pixel-mono text-base leading-relaxed whitespace-pre-wrap break-words message-content" v-html="renderedContent" />
        <StreamingCursor v-if="message.isStreaming" />
        <p class="font-pixel text-[6px] mt-2 opacity-30">
          {{ formattedTime }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'
import StreamingCursor from './StreamingCursor.vue'

const props = defineProps<{ message: Message }>()

const isUser = computed(() => props.message.role === 'user')

const formattedTime = computed(() => {
  const d = new Date(props.message.timestamp)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})

const renderedContent = computed(() => {
  let text = props.message.content

  // Simple markdown rendering
  // Code blocks
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre class="bg-pixel-bg-deep border border-pixel-border/30 p-3 my-2 overflow-x-auto font-pixel-mono text-sm text-pixel-green"><code>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-pixel-bg-deep px-1 py-0.5 text-pixel-blue font-pixel-mono text-sm border border-pixel-border/20">$1</code>')

  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-pixel-green font-bold">$1</strong>')

  // Tables (basic)
  text = text.replace(/\|(.+)\|\n\|[-|]+\|\n((?:\|.+\|\n?)*)/g, (_m, header, body) => {
    const ths = header.split('|').filter(Boolean).map((h: string) => `<th class="px-3 py-1 border border-pixel-border/30 text-pixel-green font-pixel text-[8px]">${h.trim()}</th>`).join('')
    const rows = body.trim().split('\n').map((row: string) => {
      const tds = row.split('|').filter(Boolean).map((cell: string) => `<td class="px-3 py-1 border border-pixel-border/20">${cell.trim()}</td>`).join('')
      return `<tr>${tds}</tr>`
    }).join('')
    return `<table class="w-full my-2 border-collapse"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`
  })

  // List items
  text = text.replace(/^- (.+)$/gm, '<span class="flex gap-2"><span class="text-pixel-green">&#9656;</span><span>$1</span></span>')
  text = text.replace(/^(\d+)\. (.+)$/gm, '<span class="flex gap-2"><span class="text-pixel-green">$1.</span><span>$2</span></span>')

  return text
})

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
</script>

<style scoped>
.message-content :deep(pre) {
  scrollbar-width: thin;
  scrollbar-color: #00b32c #0a0a0f;
}
</style>
