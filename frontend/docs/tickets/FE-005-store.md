# FE-005: Pinia ストア設定

## 概要

Pinia を設定し、認証ストアと API クライアントを実装します。

## 優先度

**High**

## 推定時間

3時間

## 依存関係

- FE-001: Vite + Vue 3 プロジェクトセットアップ
- FE-004: Vue Router 設定

## 実装内容

### 1. main.js で Pinia を設定

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
```

### 2. API クライアント作成

**api/client.js**

`src/api/client.js`:

```javascript
import axios from 'axios'
import router from '@/router'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// リクエストインターセプター（JWT自動付与）
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター（エラーハンドリング）
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラー - ログアウトしてログインページへ
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      router.push('/auth/login')
    }
    return Promise.reject(error)
  }
)

export default client
```

**api/auth.js**

`src/api/auth.js`:

```javascript
import client from './client'

export async function login(email, password) {
  const response = await client.post('/auth/login', {
    email,
    password
  })
  return response.data
}

export async function signup(email, display_name, password) {
  const response = await client.post('/auth/signup', {
    email,
    display_name,
    password
  })
  return response.data
}

export async function getMe() {
  const response = await client.get('/auth/me')
  return response.data
}
```

### 3. 認証ストア作成

`src/stores/auth.js`:

```javascript
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
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        logout()
      }
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,

    // Getters
    isAuthenticated,
    isInstructor,
    isAdmin,

    // Actions
    login,
    signup,
    fetchUser,
    logout,
    initialize
  }
})
```

### 4. Composables 作成

**useAuth.js**

`src/composables/useAuth.js`:

```javascript
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
```

**useToast.js**

`src/composables/useToast.js`:

```javascript
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function showToast(message, type = 'info', duration = 3000) {
    const id = toastId++
    const toast = { id, message, type, duration }

    toasts.value.push(toast)

    setTimeout(() => {
      removeToast(id)
    }, duration)

    return id
  }

  function removeToast(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message, duration) {
    return showToast(message, 'success', duration)
  }

  function error(message, duration) {
    return showToast(message, 'error', duration)
  }

  function info(message, duration) {
    return showToast(message, 'info', duration)
  }

  function warning(message, duration) {
    return showToast(message, 'warning', duration)
  }

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
```

### 5. App.vue 更新（ストア初期化）

```vue
<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const authStore = useAuthStore()

onMounted(() => {
  // localStorageから認証情報を復元
  authStore.initialize()
})
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1 container mx-auto px-4 py-8">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
```

### 6. AppHeader.vue 更新（ストア使用）

```vue
<script setup>
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()

const toggleTheme = () => {
  const html = document.documentElement
  const currentTheme = html.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  html.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}
</script>

<template>
  <!-- ... 省略 ... -->
  <!-- 未認証時 -->
  <template v-if="!user">
    <!-- ... 省略 ... -->
  </template>

  <!-- 認証済み時 -->
  <template v-else>
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <img :src="user.avatar_url || '/images/default-avatar.png'" alt="avatar" />
        </div>
      </label>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <li><a>{{ user.display_name || user.email }}</a></li>
        <li><router-link to="/profile">プロフィール</router-link></li>
        <li v-if="user.role === 'instructor' || user.role === 'admin'">
          <router-link to="/instructor/dashboard">講師ダッシュボード</router-link>
        </li>
        <li v-if="user.role === 'admin'">
          <router-link to="/admin/dashboard">管理者</router-link>
        </li>
        <li><a @click.prevent="logout">ログアウト</a></li>
      </ul>
    </div>
  </template>
</template>
```

### 7. router/index.js 更新（Pinia と連携）

```javascript
import { useAuthStore } from '@/stores/auth'

// ... ルート定義 ...

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - MSS Course Platform`
    : 'MSS Course Platform'

  const authStore = useAuthStore()

  // ゲスト専用ページ
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  // 認証必須ページ
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 講師専用ページ
  if (to.meta.requiresInstructor && !authStore.isInstructor) {
    next({ name: 'Home' })
    return
  }

  // 管理者専用ページ
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' })
    return
  }

  next()
})
```

## 実装ファイル

- `frontend/src/main.js` (更新)
- `frontend/src/api/client.js`
- `frontend/src/api/auth.js`
- `frontend/src/stores/auth.js`
- `frontend/src/composables/useAuth.js`
- `frontend/src/composables/useToast.js`
- `frontend/src/App.vue` (更新)
- `frontend/src/components/layout/AppHeader.vue` (更新)
- `frontend/src/router/index.js` (更新)

## 検証方法

```bash
# 開発サーバー起動
npm run dev

# 以下を確認:
# 1. Pinia ストアが動作している（Vue DevTools で確認）
# 2. ログイン/ログアウトが動作する（仮実装でOK）
# 3. 認証状態がヘッダーに反映される
# 4. ルートガードが動作する（認証必須ページへのアクセス制御）
# 5. localStorageに認証情報が保存される
# 6. ページリロード後も認証状態が保持される
```

## 完了条件

- [ ] Pinia が設定されている
- [ ] Axios クライアントが作成されている
- [ ] 認証 API が実装されている
- [ ] 認証ストアが実装されている
- [ ] useAuth Composable が実装されている
- [ ] useToast Composable が実装されている
- [ ] ルートガードが Pinia と連携している
- [ ] 認証状態が UI に反映される
- [ ] localStorageで認証状態が永続化される

## 備考

- `.env` ファイルに API URL を設定可能:
  ```
  VITE_API_BASE_URL=http://localhost:8000/api/v1
  ```
- Pinia の `Setup Stores` パターンを使用（Composition API スタイル）
- Axios インターセプターで JWT トークンを自動付与
- 401 エラー時に自動ログアウト
- ログイン/サインアップの詳細実装は Phase 2 (FE-006~)
