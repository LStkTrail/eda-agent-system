<template>
  <button
    :class="[
      baseClasses,
      variants[variant || 'primary'],
      sizes[size || 'md'],
      (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="inline-block animate-blink mr-2">&#9608;</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  click: [e: MouseEvent]
}>()

const baseClasses = 'font-pixel uppercase tracking-wider border-2 active:translate-y-[2px] cursor-pointer select-none'

const variants: Record<string, string> = {
  primary: 'bg-pixel-green text-pixel-bg-deep border-pixel-green-dim shadow-pixel-btn active:shadow-pixel-btn-active hover:brightness-110',
  secondary: 'bg-pixel-bg-mid text-pixel-green border-pixel-border hover:bg-pixel-bg-panel hover:shadow-pixel-border-glow',
  danger: 'bg-red-900/60 text-red-400 border-red-700/60 hover:bg-red-900/80',
  ghost: 'bg-transparent text-pixel-text-dim border-transparent hover:text-pixel-green hover:border-pixel-border',
}

const sizes: Record<string, string> = {
  sm: 'px-3 py-1 text-[8px]',
  md: 'px-4 py-2 text-[10px]',
  lg: 'px-6 py-3 text-xs',
}
</script>
