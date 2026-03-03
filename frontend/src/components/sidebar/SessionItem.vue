<template>
  <div
    class="group relative flex items-center gap-2 px-3 py-2.5 cursor-pointer font-pixel-mono text-sm rounded-none"
    :class="active
      ? 'bg-pixel-green/10 text-pixel-green border-l-2 border-pixel-green'
      : 'text-pixel-text-dim hover:bg-pixel-bg-mid hover:text-pixel-text border-l-2 border-transparent'"
    @click="$emit('select')"
  >
    <span class="w-1.5 h-1.5 flex-shrink-0" :class="active ? 'bg-pixel-green' : 'bg-pixel-text-dim/30'" />
    <span class="truncate flex-1">{{ session.title }}</span>
    <button
      class="absolute right-2 text-pixel-text-dim/0 group-hover:text-pixel-text-dim hover:!text-red-400 font-pixel text-[10px] cursor-pointer"
      @click.stop="$emit('delete')"
    >
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Session } from '@/types'

defineProps<{
  session: Session
  active: boolean
}>()

defineEmits<{
  select: []
  delete: []
}>()
</script>
