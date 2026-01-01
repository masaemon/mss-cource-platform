import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, signup as apiSignup, getMe as apiGetMe } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isInstructor = computed(() =>
    user.value?.role === 'instructor' || user.value?.role === 'admin'
  )
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      const response = await apiLogin(email, password)

      token.value = response.access_token
      user.value = response.user

      localStorage.setItem('access_token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'ログインに失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signup(email, display_name, password) {
    loading.value = true
    error.value = null

    try {
      const response = await apiSignup(email, display_name, password)

      token.value = response.access_token
      user.value = response.user

      localStorage.setItem('access_token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'サインアップに失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const userData = await apiGetMe()
      user.value = userData
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (err) {
      // トークンが無効な場合
      logout()
      throw err
    }
  }

  function logout() {
    user.value = null
    token.value = null
    error.value = null

    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    router.push('/')
  }

  // 初期化: localStorageからユーザー情報を復元
  function initialize() {
    if (initialized.value) return

    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        logout()
      }
    }

    initialized.value = true
  }

  // トークンの有効性チェック（定期実行）
  function startTokenCheck() {
    setInterval(() => {
      if (token.value && user.value) {
        fetchUser().catch(() => {
          // トークンが無効な場合は自動ログアウト
          console.log('Token expired, logging out')
        })
      }
    }, 10 * 60 * 1000) // 10分ごと
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    initialized,

    // Getters
    isAuthenticated,
    isInstructor,
    isAdmin,

    // Actions
    login,
    signup,
    fetchUser,
    logout,
    initialize,
    startTokenCheck
  }
})
