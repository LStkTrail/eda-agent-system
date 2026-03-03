<template>
  <div class="flex items-center gap-1">
    <span
      v-for="i in 4"
      :key="i"
      class="w-2 h-2 bg-pixel-green"
      :class="{ 'opacity-100': activeIndex >= i, 'opacity-20': activeIndex < i }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const activeIndex = ref(0)
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    activeIndex.value = (activeIndex.value % 4) + 1
  }, 300)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
