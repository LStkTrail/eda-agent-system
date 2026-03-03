<template>
  <div class="relative">
    <label v-if="label" class="block font-pixel text-[8px] text-pixel-green mb-2 uppercase tracking-wider">
      {{ label }}
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full bg-pixel-bg-deep text-pixel-text font-pixel-mono text-xl px-4 py-3 border-2 border-pixel-border outline-none placeholder:text-pixel-text-dim/40 disabled:opacity-50 disabled:cursor-not-allowed focus:border-pixel-green focus:shadow-pixel-border-glow caret-pixel-green"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter="$emit('enter')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  label?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'enter': []
}>()
</script>
