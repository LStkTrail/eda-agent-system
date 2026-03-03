<template>
  <div class="flex-1 flex flex-col items-center justify-center px-4 animate-pixel-fade-in">
    <div class="text-center mb-8">
      <!-- Pixel art logo -->
      <pre class="font-pixel-mono text-pixel-green text-xs leading-tight pixel-text-glow mb-4 select-none">
 ███████╗██████╗  █████╗
 ██╔════╝██╔══██╗██╔══██╗
 █████╗  ██║  ██║███████║
 ██╔══╝  ██║  ██║██╔══██║
 ███████╗██████╔╝██║  ██║
 ╚══════╝╚═════╝ ╚═╝  ╚═╝</pre>
      <p class="font-pixel text-pixel-green text-[10px] mb-2 pixel-text-glow">AGENT SYSTEM</p>
      <p class="font-pixel-mono text-pixel-text-dim text-lg">EDA智能助手 &middot; 准备就绪</p>
    </div>

    <!-- Quick prompts -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
      <button
        v-for="prompt in prompts"
        :key="prompt.text"
        class="group pixel-border bg-pixel-bg-dark/60 hover:bg-pixel-bg-mid px-4 py-3 text-left cursor-pointer hover:shadow-pixel-border-glow"
        @click="$emit('quickPrompt', prompt.text)"
      >
        <p class="font-pixel text-[7px] text-pixel-green mb-1 uppercase">{{ prompt.label }}</p>
        <p class="font-pixel-mono text-sm text-pixel-text-dim group-hover:text-pixel-text">{{ prompt.text }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ quickPrompt: [text: string] }>()

const prompts = [
  { label: 'RTL Design', text: '如何用Verilog实现一个带异步复位的D触发器？' },
  { label: 'STA Analysis', text: '什么是Setup Time和Hold Time？' },
  { label: 'Synthesis', text: 'Synopsys DC的基本综合流程是什么？' },
  { label: 'Low Power', text: '芯片低功耗设计有哪些常用技术？' },
]
</script>
