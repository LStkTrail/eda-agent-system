<template>
  <div class="flex flex-col gap-0.5 py-1">
    <!-- Today -->
    <template v-if="todaySessions.length">
      <p class="font-pixel text-[7px] text-pixel-text-dim/60 uppercase px-2 pt-2 pb-1">Today</p>
      <SessionItem
        v-for="session in todaySessions"
        :key="session.id"
        :session="session"
        :active="session.id === chatStore.activeSessionId"
        @select="chatStore.selectSession(session.id)"
        @delete="chatStore.deleteSession(session.id)"
      />
    </template>

    <!-- Yesterday -->
    <template v-if="yesterdaySessions.length">
      <p class="font-pixel text-[7px] text-pixel-text-dim/60 uppercase px-2 pt-3 pb-1">Yesterday</p>
      <SessionItem
        v-for="session in yesterdaySessions"
        :key="session.id"
        :session="session"
        :active="session.id === chatStore.activeSessionId"
        @select="chatStore.selectSession(session.id)"
        @delete="chatStore.deleteSession(session.id)"
      />
    </template>

    <!-- Older -->
    <template v-if="olderSessions.length">
      <p class="font-pixel text-[7px] text-pixel-text-dim/60 uppercase px-2 pt-3 pb-1">Earlier</p>
      <SessionItem
        v-for="session in olderSessions"
        :key="session.id"
        :session="session"
        :active="session.id === chatStore.activeSessionId"
        @select="chatStore.selectSession(session.id)"
        @delete="chatStore.deleteSession(session.id)"
      />
    </template>

    <p v-if="!chatStore.sortedSessions.length" class="font-pixel text-[7px] text-pixel-text-dim/40 text-center py-8">
      NO SESSIONS
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import SessionItem from './SessionItem.vue'

const chatStore = useChatStore()

const now = Date.now()
const dayMs = 86400000

const todaySessions = computed(() =>
  chatStore.sortedSessions.filter(s => now - s.updatedAt < dayMs)
)
const yesterdaySessions = computed(() =>
  chatStore.sortedSessions.filter(s => now - s.updatedAt >= dayMs && now - s.updatedAt < 2 * dayMs)
)
const olderSessions = computed(() =>
  chatStore.sortedSessions.filter(s => now - s.updatedAt >= 2 * dayMs)
)
</script>
