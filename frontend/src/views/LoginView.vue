<template>
  <div class="h-full flex items-center justify-center relative overflow-hidden">
    <!-- Floating pixel particles -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="particle-1 absolute w-1 h-1 bg-pixel-green/30 top-[20%] left-[15%]" />
      <div class="particle-2 absolute w-1.5 h-1.5 bg-pixel-blue/20 top-[40%] right-[20%]" />
      <div class="particle-3 absolute w-1 h-1 bg-pixel-green/25 top-[60%] left-[70%]" />
      <div class="particle-1 absolute w-2 h-2 bg-pixel-green/15 top-[80%] left-[30%]" style="animation-delay: -2s" />
      <div class="particle-2 absolute w-1 h-1 bg-pixel-yellow/20 top-[30%] left-[50%]" style="animation-delay: -3s" />
      <div class="particle-3 absolute w-1.5 h-1.5 bg-pixel-blue/15 top-[70%] right-[35%]" style="animation-delay: -1s" />
    </div>

    <!-- Login card -->
    <div class="relative z-10 w-full max-w-md px-6">
      <div class="pixel-border-strong bg-pixel-bg-dark/90 p-8 backdrop-blur-sm">
        <!-- Pixel robot avatar -->
        <div class="flex justify-center mb-6">
          <div class="grid grid-cols-8 gap-0 w-16 h-16">
            <template v-for="(row, ri) in avatar" :key="ri">
              <div
                v-for="(cell, ci) in row"
                :key="`${ri}-${ci}`"
                class="w-2 h-2"
                :class="cell === 1 ? 'bg-pixel-green' : cell === 2 ? 'bg-pixel-blue' : 'bg-transparent'"
              />
            </template>
          </div>
        </div>

        <!-- Title -->
        <h1 class="font-pixel text-pixel-green text-center text-sm pixel-text-glow mb-2">
          EDA AGENT
        </h1>
        <p class="font-pixel text-pixel-text-dim text-center text-[8px] mb-8 tracking-widest">
          SYSTEM LOGIN v1.0
        </p>

        <!-- Login form -->
        <LoginForm />

        <!-- Footer -->
        <p class="font-pixel text-pixel-text-dim/40 text-center text-[6px] mt-8 leading-relaxed">
          &copy; 2025 EDA SYSTEM<br />INSERT COIN TO CONTINUE
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/login/LoginForm.vue'

// Pixel art robot avatar (8x8 grid: 0=empty, 1=green, 2=blue)
const avatar = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 2, 1, 1, 2, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
]
</script>
