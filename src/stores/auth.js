import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token        = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const user         = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isPremium  = computed(() => !!user.value?.is_premium)

  function _saveSession(data) {
    token.value        = data.access_token
    user.value         = data.user
    refreshToken.value = data.refresh_token ?? refreshToken.value
    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    _saveSession(res.data)
    return res.data
  }

  async function register(data) {
    const res = await api.post('/auth/register', data)
    if (res.data.access_token) _saveSession(res.data)
    return res.data
  }

  async function logout() {
    try { await api.post('/auth/logout') } catch {}
    token.value        = null
    user.value         = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refresh_token')
  }

  async function tryRefresh() {
    if (!refreshToken.value) return false
    try {
      const res = await api.post('/auth/refresh', { refresh_token: refreshToken.value })
      _saveSession(res.data)
      return true
    } catch {
      logout()
      return false
    }
  }

  async function refreshUser() {
    try {
      const res = await api.get('/users/profile')
      user.value = { ...user.value, ...res.data }
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch {}
  }

  function setUser(data) {
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
  }

  return {
    token, refreshToken, user,
    isLoggedIn, isPremium,
    login, register, logout, tryRefresh, refreshUser, setUser,
  }
})
