import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const username = ref(localStorage.getItem('auth_username') || '')
  const isAuthenticated = computed(() => !!localStorage.getItem('auth_token'))

  async function login(user: string, _password: string): Promise<boolean> {
    // Stub: always succeed, simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    localStorage.setItem('auth_token', 'stub-token-' + Date.now())
    localStorage.setItem('auth_username', user)
    username.value = user
    return true
  }

  function logout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
    username.value = ''
    router.push({ name: 'login' })
  }

  return { username, isAuthenticated, login, logout }
})
