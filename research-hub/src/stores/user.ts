import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginRequest } from '@/types'
import { authApi } from '@/api'
import { STORAGE_KEYS } from '@/constants'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN))
  const refreshToken = ref<string | null>(localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN))

  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username ?? '')
  const displayName = computed(() => userInfo.value?.displayName ?? '')
  const avatar = computed(() => userInfo.value?.avatar ?? '')
  const roles = computed(() => userInfo.value?.roles ?? [])
  const permissions = computed(() => userInfo.value?.permissions ?? [])

  function hasPermission(code: string): boolean {
    if (!userInfo.value) return false
    if (roles.value.some((r) => r.code === 'admin')) return true
    return permissions.value.includes(code) || permissions.value.includes('*')
  }

  function hasAnyPermission(codes: string[]): boolean {
    return codes.some((c) => hasPermission(c))
  }

  async function login(data: LoginRequest): Promise<string | null> {
    const res = await authApi.login(data)
    if (res.code !== 0) return res.message
    const { accessToken, refreshToken: rt, userInfo: info } = res.data
    token.value = accessToken
    refreshToken.value = rt
    userInfo.value = info
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, rt)
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(info))
    return null
  }

  async function logout(): Promise<void> {
    await authApi.logout()
    token.value = null
    refreshToken.value = null
    userInfo.value = null
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  }

  function restoreSession(): void {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO)
    if (stored) {
      try { userInfo.value = JSON.parse(stored) } catch { /* ignore */ }
    }
  }

  return {
    userInfo, token, refreshToken, isLoggedIn, username, displayName, avatar, roles, permissions,
    hasPermission, hasAnyPermission, login, logout, restoreSession,
  }
})
