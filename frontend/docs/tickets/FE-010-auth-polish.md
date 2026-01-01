# FE-010: 認証機能の仕上げとテスト

## 概要

認証機能の仕上げ、統合テスト、UX改善を行います。

## 優先度

**High**

## 推定時間

2.5時間

## 依存関係

- FE-006: 認証APIクライアント実装
- FE-007: ログインページ実装
- FE-008: サインアップページ実装
- FE-009: プロフィールページ実装

## 実装内容

### 1. ルートガードの完全実装

`src/router/index.js` 更新:

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ... 既存のルート定義 ...
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

// グローバルナビゲーションガード
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { showToast } = useToast()

  // ページタイトル設定
  document.title = to.meta.title
    ? `${to.meta.title} - MSS Course Platform`
    : 'MSS Course Platform'

  // 認証状態の確認
  const isAuthenticated = authStore.isAuthenticated

  // トークンがある場合、ユーザー情報を取得（初回のみ）
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      // トークンが無効な場合はログアウト
      authStore.logout()
    }
  }

  // ゲスト専用ページ（ログイン/サインアップ）
  if (to.meta.requiresGuest && isAuthenticated) {
    showToast('すでにログインしています', 'info')
    next({ name: 'Home' })
    return
  }

  // 認証必須ページ
  if (to.meta.requiresAuth && !isAuthenticated) {
    showToast('ログインが必要です', 'warning')
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 講師専用ページ
  if (to.meta.requiresInstructor && !authStore.isInstructor) {
    showToast('講師のみアクセスできます', 'error')
    next({ name: 'Home' })
    return
  }

  // 管理者専用ページ
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    showToast('管理者のみアクセスできます', 'error')
    next({ name: 'Home' })
    return
  }

  next()
})

// エラーハンドラー
router.onError((error) => {
  console.error('Router error:', error)
  const { showToast } = useToast()
  showToast('ページの読み込みに失敗しました', 'error')
})

export default router
```

### 2. 認証ストアの改善

`src/stores/auth.js` 更新:

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

  // 初期化
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
```

### 3. App.vue 更新（トークンチェック追加）

```vue
<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const authStore = useAuthStore()

onMounted(() => {
  // 認証情報を復元
  authStore.initialize()

  // トークンの定期チェックを開始
  authStore.startTokenCheck()
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

### 4. Toast通知の改善

`src/components/common/ToastContainer.vue` (新規作成):

```vue
<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast toast-end z-50">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="alert shadow-lg"
      :class="{
        'alert-info': toast.type === 'info',
        'alert-success': toast.type === 'success',
        'alert-warning': toast.type === 'warning',
        'alert-error': toast.type === 'error'
      }"
    >
      <div>
        <svg
          v-if="toast.type === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg
          v-else-if="toast.type === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg
          v-else-if="toast.type === 'warning'"
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current flex-shrink-0 h-6 w-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>
```

App.vue に追加:

```vue
<script setup>
import ToastContainer from './components/common/ToastContainer.vue'
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <AppHeader />
    <main class="flex-1 container mx-auto px-4 py-8">
      <RouterView />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>
```

### 5. テストシナリオドキュメント

`frontend/docs/auth-test-scenarios.md`:

```markdown
# 認証機能テストシナリオ

## 1. サインアップ

### 正常系
- [ ] 新規ユーザーでサインアップ → 成功 → ホームへリダイレクト
- [ ] サインアップ後に認証状態になっている
- [ ] ヘッダーにユーザー名が表示される

### 異常系
- [ ] 空のフォーム送信 → バリデーションエラー
- [ ] 無効なメールアドレス → バリデーションエラー
- [ ] 弱いパスワード → バリデーションエラー
- [ ] パスワード不一致 → バリデーションエラー
- [ ] 既存のメールアドレス → APIエラー
- [ ] 利用規約未同意 → ボタン無効

## 2. ログイン

### 正常系
- [ ] 正しい認証情報でログイン → 成功 → ホームへリダイレクト
- [ ] Remember me でログイン → 次回メールが保存される
- [ ] リダイレクトパラメータ付きログイン → 指定ページへリダイレクト

### 異常系
- [ ] 空のフォーム送信 → バリデーションエラー
- [ ] 無効な認証情報 → APIエラー
- [ ] 存在しないユーザー → APIエラー

## 3. ログアウト

- [ ] ログアウト → 認証状態が解除される
- [ ] ヘッダーがログイン前の状態に戻る
- [ ] localStorageがクリアされる
- [ ] 保護されたページにアクセス → ログインページへリダイレクト

## 4. プロフィール

### 表示
- [ ] プロフィール情報が表示される
- [ ] アバター画像が表示される
- [ ] 役割バッジが表示される

### 編集
- [ ] プロフィール情報を変更 → 保存 → 反映される
- [ ] キャンセル → 変更が破棄される

### パスワード変更
- [ ] 正しいパスワードで変更 → 成功
- [ ] 誤った現在のパスワード → エラー
- [ ] 弱い新しいパスワード → バリデーションエラー

## 5. ルートガード

### 認証必須ページ
- [ ] 未ログインで /profile → ログインページへリダイレクト
- [ ] ログイン後に元のページへリダイレクト

### ゲスト専用ページ
- [ ] ログイン済みで /auth/login → ホームへリダイレクト
- [ ] ログイン済みで /auth/signup → ホームへリダイレクト

### 講師専用ページ
- [ ] 一般ユーザーで /instructor/dashboard → アクセス拒否
- [ ] 講師で /instructor/dashboard → アクセス許可

### 管理者専用ページ
- [ ] 一般ユーザーで /admin/dashboard → アクセス拒否
- [ ] 講師で /admin/dashboard → アクセス拒否
- [ ] 管理者で /admin/dashboard → アクセス許可

## 6. トークン管理

- [ ] ページリロード → 認証状態が保持される
- [ ] トークン期限切れ → 自動ログアウト
- [ ] 401エラー → ログインページへリダイレクト

## 7. UX

- [ ] ローディング状態が表示される
- [ ] エラーメッセージが適切に表示される
- [ ] 成功メッセージがtoastで表示される
- [ ] フォームバリデーションがリアルタイムで動作する
```

## 実装ファイル

- `frontend/src/router/index.js` (更新)
- `frontend/src/stores/auth.js` (更新)
- `frontend/src/App.vue` (更新)
- `frontend/src/components/common/ToastContainer.vue` (新規作成)
- `frontend/docs/auth-test-scenarios.md` (新規作成)

## 検証方法

### 1. 自動テスト（手動実行）

上記のテストシナリオをすべて実行し、チェックマークを付ける。

### 2. ブラウザテスト

複数ブラウザで動作確認:
- Chrome
- Firefox
- Safari
- Edge

### 3. レスポンシブテスト

デバイスサイズごとに確認:
- デスクトップ (1920x1080)
- タブレット (768x1024)
- モバイル (375x667)

## 完了条件

- [ ] ルートガードが完全に動作する
- [ ] トークンチェックが動作する
- [ ] Toast通知が統合されている
- [ ] すべてのテストシナリオがパスする
- [ ] エラーハンドリングが適切に動作する
- [ ] UXが良好である

## 備考

### パフォーマンス

- トークンチェックは10分ごと（調整可能）
- 不要なAPI呼び出しを避ける
- ローディング状態を適切に表示

### セキュリティ

- トークンの期限切れを検知
- 401エラーで自動ログアウト
- XSS対策（Vue が自動でサニタイズ）

### 今後の改善

- E2Eテストの追加（Playwright, Cypress）
- ユニットテストの追加（Vitest）
- リフレッシュトークンの実装
- OAuth連携（Google, GitHub等）
