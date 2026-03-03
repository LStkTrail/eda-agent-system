<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-5 w-full">
    <PixelInput
      v-model="username"
      label="USERNAME"
      placeholder="ENTER USERNAME"
      :disabled="isLoading"
      @enter="handleSubmit"
    />
    <PixelInput
      v-model="password"
      label="PASSWORD"
      placeholder="ENTER PASSWORD"
      type="password"
      :disabled="isLoading"
      @enter="handleSubmit"
    />
    <p v-if="errorMsg" class="font-pixel text-[8px] text-red-400 pixel-text-glow animate-blink">
      {{ errorMsg }}
    </p>
    <PixelButton
      variant="primary"
      size="lg"
      :loading="isLoading"
      :disabled="isLoading"
      class="mt-2 w-full"
    >
      {{ isLoading ? 'LOADING...' : 'PRESS START' }}
    </PixelButton>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import PixelInput from '@/components/common/PixelInput.vue'
import PixelButton from '@/components/common/PixelButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  if (!username.value.trim()) {
    errorMsg.value = '> ERROR: USERNAME REQUIRED'
    return
  }
  if (!password.value.trim()) {
    errorMsg.value = '> ERROR: PASSWORD REQUIRED'
    return
  }
  errorMsg.value = ''
  isLoading.value = true
  try {
    await authStore.login(username.value, password.value)
    router.push({ name: 'chat' })
  } catch {
    errorMsg.value = '> ERROR: LOGIN FAILED'
  } finally {
    isLoading.value = false
  }
}
</script>
