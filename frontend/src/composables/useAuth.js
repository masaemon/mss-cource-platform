import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isInstructor = computed(() => authStore.isInstructor)
  const isAdmin = computed(() => authStore.isAdmin)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)

  async function login(email, password) {
    try {
      await authStore.login(email, password)
      router.push('/')
    } catch (err) {
      console.error('Login failed:', err)
      throw err
    }
  }

  async function signup(email, display_name, password) {
    try {
      await authStore.signup(email, display_name, password)
      router.push('/')
    } catch (err) {
      console.error('Signup failed:', err)
      throw err
    }
  }

  function logout() {
    authStore.logout()
  }

  return {
    user,
    isAuthenticated,
    isInstructor,
    isAdmin,
    loading,
    error,
    login,
    signup,
    logout
  }
}
