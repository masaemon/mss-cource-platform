# FE-003: レイアウトコンポーネント作成

## 概要

アプリケーション全体で使用するレイアウトコンポーネント（ヘッダー、ナビバー、フッター）を作成します。

## 優先度

**High**

## 推定時間

2.5時間

## 依存関係

- FE-001: Vite + Vue 3 プロジェクトセットアップ
- FE-002: Tailwind CSS + DaisyUI セットアップ

## 実装内容

### 1. AppHeader.vue 作成

`src/components/layout/AppHeader.vue`:

```vue
<script setup>
import { ref } from 'vue'

// 仮のユーザー情報（FE-006 で Pinia ストアから取得するように変更）
const user = ref(null)

const toggleTheme = () => {
  const html = document.documentElement
  const currentTheme = html.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  html.setAttribute('data-theme', newTheme)
  // TODO: FE-006 で localStorage に保存する処理を追加
}

// 仮のログアウト処理（FE-006 で Pinia ストアと連携）
const logout = () => {
  // TODO: FE-006 で実装
  console.log('Logout clicked')
}
</script>

<template>
  <header class="navbar bg-base-100 shadow-lg">
    <div class="navbar-start">
      <!-- モバイルメニュー -->
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </label>
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li><router-link to="/">コース一覧</router-link></li>
          <li><router-link to="/categories">カテゴリー</router-link></li>
        </ul>
      </div>

      <!-- ロゴ -->
      <router-link to="/" class="btn btn-ghost text-xl">
        MSS Course
      </router-link>
    </div>

    <!-- デスクトップメニュー -->
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><router-link to="/">コース一覧</router-link></li>
        <li><router-link to="/categories">カテゴリー</router-link></li>
      </ul>
    </div>

    <div class="navbar-end gap-2">
      <!-- テーマ切り替え -->
      <button class="btn btn-ghost btn-circle" @click="toggleTheme">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <!-- 未認証時 -->
      <template v-if="!user">
        <router-link to="/auth/login" class="btn btn-ghost">ログイン</router-link>
        <router-link to="/auth/signup" class="btn btn-primary">サインアップ</router-link>
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
    </div>
  </header>
</template>
```

### 2. AppFooter.vue 作成

`src/components/layout/AppFooter.vue`:

```vue
<template>
  <footer class="footer footer-center p-10 bg-base-100 text-base-content mt-auto">
    <div>
      <p class="font-bold text-lg">MSS Course Platform</p>
      <p>オンライン動画講座プラットフォーム</p>
    </div>
    <div>
      <div class="grid grid-flow-col gap-4">
        <router-link to="/terms" class="link link-hover">利用規約</router-link>
        <router-link to="/privacy" class="link link-hover">プライバシーポリシー</router-link>
        <router-link to="/contact" class="link link-hover">お問い合わせ</router-link>
      </div>
    </div>
    <div>
      <p>Copyright © 2024 - All rights reserved</p>
    </div>
  </footer>
</template>
```

### 3. LoadingSpinner.vue 作成

`src/components/common/LoadingSpinner.vue`:

```vue
<script setup>
defineProps({
  size: {
    type: String,
    default: 'md', // xs, sm, md, lg
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  }
})
</script>

<template>
  <div class="flex justify-center items-center">
    <span
      class="loading loading-spinner"
      :class="{
        'loading-xs': size === 'xs',
        'loading-sm': size === 'sm',
        'loading-md': size === 'md',
        'loading-lg': size === 'lg'
      }"
    ></span>
  </div>
</template>
```

### 4. Toast.vue 作成（トースト通知コンポーネント）

`src/components/common/Toast.vue`:

```vue
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'info', // info, success, warning, error
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])
const visible = ref(true)

watch(visible, (newVal) => {
  if (!newVal) {
    emit('close')
  }
})

// 自動で非表示
setTimeout(() => {
  visible.value = false
}, props.duration)
</script>

<template>
  <div v-if="visible" class="toast toast-end">
    <div
      class="alert"
      :class="{
        'alert-info': type === 'info',
        'alert-success': type === 'success',
        'alert-warning': type === 'warning',
        'alert-error': type === 'error'
      }"
    >
      <span>{{ message }}</span>
      <button class="btn btn-sm btn-ghost" @click="visible = false">×</button>
    </div>
  </div>
</template>
```

### 5. App.vue 更新

レイアウトコンポーネントを統合:

```vue
<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1 container mx-auto px-4 py-8">
      <!-- ルーターコンテンツがここに入る（FE-004で実装） -->
      <h1 class="text-3xl font-bold">ホーム</h1>
      <p class="mt-4">レイアウトコンポーネント実装完了</p>
    </main>

    <AppFooter />
  </div>
</template>
```

## 実装ファイル

- `frontend/src/components/layout/AppHeader.vue`
- `frontend/src/components/layout/AppFooter.vue`
- `frontend/src/components/common/LoadingSpinner.vue`
- `frontend/src/components/common/Toast.vue`
- `frontend/src/App.vue` (更新)

## 検証方法

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
# 以下を確認:
# 1. ヘッダーが表示されている
# 2. ナビゲーションリンクが表示されている
# 3. テーマ切り替えボタンが動作する
# 4. フッターが表示されている
# 5. レスポンシブデザインが動作する（モバイルメニュー）
```

### テストコンポーネント追加（オプション）

App.vue にテストコードを追加して各コンポーネントを確認:

```vue
<template>
  <div id="app" class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1 container mx-auto px-4 py-8">
      <!-- LoadingSpinner テスト -->
      <div class="card bg-base-100 shadow-xl p-6 mb-4">
        <h2 class="text-2xl font-bold mb-4">Loading Spinner</h2>
        <div class="flex gap-4">
          <LoadingSpinner size="xs" />
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
        </div>
      </div>

      <!-- Toast テスト -->
      <button @click="showToast = true" class="btn btn-primary">
        Show Toast
      </button>
      <Toast v-if="showToast" message="テスト通知" type="success" @close="showToast = false" />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import LoadingSpinner from './components/common/LoadingSpinner.vue'
import Toast from './components/common/Toast.vue'

const showToast = ref(false)
</script>
```

## 完了条件

- [ ] AppHeader.vue が作成されている
- [ ] AppFooter.vue が作成されている
- [ ] LoadingSpinner.vue が作成されている
- [ ] Toast.vue が作成されている
- [ ] App.vue にレイアウトが統合されている
- [ ] ヘッダーとフッターが表示される
- [ ] テーマ切り替えが動作する
- [ ] レスポンシブデザインが動作する

## 備考

- テーマ切り替えは `localStorage` に保存するロジックを後で追加予定
- ユーザー情報は後で Pinia ストアから取得
- ルーティングは FE-004 で実装
- トースト通知は Composables でラップして使いやすくする（FE-005）
