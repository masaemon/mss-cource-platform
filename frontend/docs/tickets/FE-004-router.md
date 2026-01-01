# FE-004: Vue Router 設定

## 概要

Vue Router 4 を設定し、基本的なルーティングとナビゲーションガードを実装します。

## 優先度

**High**

## 推定時間

2時間

## 依存関係

- FE-001: Vite + Vue 3 プロジェクトセットアップ
- FE-003: レイアウトコンポーネント作成

## 実装内容

### 1. router/index.js 作成

`src/router/index.js`:

```javascript
import { createRouter, createWebHistory } from 'vue-router'

// ページコンポーネント（後で作成）
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
      meta: { title: 'コース一覧' }
    },
    {
      path: '/courses/:id',
      name: 'CourseDetail',
      component: () => import('@/views/CourseDetailView.vue'),
      meta: { title: 'コース詳細' }
    },
    {
      path: '/auth/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { title: 'ログイン', requiresGuest: true }
    },
    {
      path: '/auth/signup',
      name: 'Signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { title: 'サインアップ', requiresGuest: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'プロフィール', requiresAuth: true }
    },
    {
      path: '/instructor/dashboard',
      name: 'InstructorDashboard',
      component: () => import('@/views/instructor/DashboardView.vue'),
      meta: { title: '講師ダッシュボード', requiresAuth: true, requiresInstructor: true }
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { title: '管理者ダッシュボード', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'ページが見つかりません' }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ナビゲーションガード（後で Pinia ストアと連携）
router.beforeEach((to, from, next) => {
  // ページタイトル設定
  document.title = to.meta.title
    ? `${to.meta.title} - MSS Course Platform`
    : 'MSS Course Platform'

  // 認証チェック（仮実装 - FE-005 で Pinia と連携）
  const isAuthenticated = !!localStorage.getItem('access_token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // ゲスト専用ページ（ログイン/サインアップ）
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Home' })
    return
  }

  // 認証必須ページ
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 講師専用ページ
  if (to.meta.requiresInstructor && user?.role !== 'instructor' && user?.role !== 'admin') {
    next({ name: 'Home' })
    return
  }

  // 管理者専用ページ
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router
```

### 2. main.js 更新

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.mount('#app')
```

### 3. App.vue 更新

```vue
<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1 container mx-auto px-4 py-8">
      <!-- Vue Router のコンテンツ -->
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
```

### 4. 基本ビューコンポーネント作成

**HomeView.vue**

`src/views/HomeView.vue`:

```vue
<script setup>
import { ref } from 'vue'

const courses = ref([
  { id: '1', title_ja: 'Vue 3 入門', description_ja: 'Vue 3 の基礎を学ぶ' },
  { id: '2', title_ja: 'FastAPI 入門', description_ja: 'FastAPI でAPI開発' }
])
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold mb-6">コース一覧</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="course in courses" :key="course.id" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{{ course.title_ja }}</h2>
          <p>{{ course.description_ja }}</p>
          <div class="card-actions justify-end">
            <router-link :to="`/courses/${course.id}`" class="btn btn-primary">
              詳細を見る
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

**CourseDetailView.vue**

`src/views/CourseDetailView.vue`:

```vue
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const courseId = route.params.id
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold mb-6">コース詳細</h1>
    <p>Course ID: {{ courseId }}</p>
    <router-link to="/" class="btn btn-ghost mt-4">← 戻る</router-link>
  </div>
</template>
```

**LoginView.vue**

`src/views/auth/LoginView.vue`:

```vue
<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-4xl font-bold mb-6">ログイン</h1>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <form @submit.prevent="handleLogin">
          <div class="form-control">
            <label class="label">
              <span class="label-text">メールアドレス</span>
            </label>
            <input type="email" class="input input-bordered" required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">パスワード</span>
            </label>
            <input type="password" class="input input-bordered" required />
          </div>

          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">ログイン</button>
          </div>
        </form>

        <div class="divider">または</div>

        <router-link to="/auth/signup" class="btn btn-ghost">
          サインアップ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const handleLogin = () => {
  console.log('Login submitted')
  // FE-006 で実装
}
</script>
```

**NotFoundView.vue**

`src/views/NotFoundView.vue`:

```vue
<template>
  <div class="text-center">
    <h1 class="text-6xl font-bold mb-4">404</h1>
    <p class="text-2xl mb-8">ページが見つかりません</p>
    <router-link to="/" class="btn btn-primary">
      ホームに戻る
    </router-link>
  </div>
</template>
```

### 5. AppHeader.vue と AppFooter.vue の確認

**注意**: FE-003 で作成した `AppHeader.vue` と `AppFooter.vue` は既に `<router-link>` を使用しています。以下の点を確認してください:

- ✅ すべての `<a href="...">` が `<router-link to="...">` に変更されている
- ✅ ロゴ、ナビゲーションメニュー、フッターリンクがすべて `<router-link>` を使用
- ✅ `logout` 関数が定義されている（仮実装）

もし FE-003 実装時に通常のリンクを使用していた場合は、以下のように修正してください:

```vue
<!-- Before: 通常のリンク -->
<a href="/" class="btn btn-ghost text-xl">MSS Course</a>

<!-- After: Vue Router のリンク -->
<router-link to="/" class="btn btn-ghost text-xl">MSS Course</router-link>
```

## 実装ファイル

- `frontend/src/router/index.js`
- `frontend/src/main.js` (更新)
- `frontend/src/App.vue` (更新)
- `frontend/src/views/HomeView.vue`
- `frontend/src/views/CourseDetailView.vue`
- `frontend/src/views/auth/LoginView.vue`
- `frontend/src/views/NotFoundView.vue`
- `frontend/src/components/layout/AppHeader.vue` (更新)

## 検証方法

```bash
# 開発サーバー起動
npm run dev

# ブラウザで以下を確認:
# 1. http://localhost:5173/ - ホームページ
# 2. http://localhost:5173/courses/1 - コース詳細ページ
# 3. http://localhost:5173/auth/login - ログインページ
# 4. http://localhost:5173/invalid - 404 ページ
# 5. ナビゲーションリンクをクリックしてページ遷移
# 6. ブラウザの戻る/進むボタンが動作する
# 7. スクロール位置がリセットされる
```

## 完了条件

- [ ] Vue Router がインストール・設定されている
- [ ] ルーティング定義が完成している
- [ ] ナビゲーションガードが実装されている
- [ ] 基本ビューコンポーネントが作成されている
- [ ] ページ遷移が動作する
- [ ] 404 ページが表示される
- [ ] ブラウザ履歴が正しく管理される
- [ ] ページタイトルが自動更新される

## 備考

- `lazy loading`: `() => import()` で動的インポート使用
- `scrollBehavior`: ページ遷移時にスクロール位置をトップに
- `meta.requiresAuth`: 認証必須ページを定義
- `meta.requiresInstructor`: 講師専用ページを定義
- 認証ロジックは FE-005 で Pinia ストアと連携
