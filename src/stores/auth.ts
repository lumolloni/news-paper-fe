import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AUTH_TOKEN_KEY } from '@/api/client'
import { login as apiLogin, register as apiRegister, getMe } from '@/api/auth'
import { trackEvent } from '@/analytics'
import type { User } from '@/types'

const USER_KEY = 'meridian-user'

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Hydrate synchronously from storage so the router guard sees the session on
  // first navigation (no async gap on reload).
  const jwt = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY))
  const user = ref<User | null>(readStoredUser())

  const isAuthenticated = computed(() => !!jwt.value)

  function persist() {
    if (jwt.value) localStorage.setItem(AUTH_TOKEN_KEY, jwt.value)
    else localStorage.removeItem(AUTH_TOKEN_KEY)
    if (user.value) localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    else localStorage.removeItem(USER_KEY)
  }

  function setSession(newJwt: string, newUser: User) {
    jwt.value = newJwt
    user.value = newUser
    persist()
  }

  async function login(identifier: string, password: string) {
    const res = await apiLogin(identifier, password)
    setSession(res.jwt, res.user)
    trackEvent('login', { method: 'local' })
  }

  async function register(username: string, email: string, password: string) {
    const res = await apiRegister(username, email, password)
    setSession(res.jwt, res.user)
    trackEvent('sign_up', { method: 'local' })
  }

  function logout() {
    jwt.value = null
    user.value = null
    persist()
  }

  /**
   * Validate a restored token against the server. If it's stale/invalid, clear
   * the session so the UI doesn't show a logged-in state that the API rejects.
   */
  async function refresh() {
    if (!jwt.value) return
    try {
      user.value = await getMe()
      persist()
    } catch {
      logout()
    }
  }

  return { jwt, user, isAuthenticated, login, register, logout, refresh }
})
