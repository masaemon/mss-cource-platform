# Vue 3 SPA Frontend - ドキュメント

## 概要

FastAPIバックエンドを利用するVue 3ベースのSPAフロントエンドの実装ドキュメントです。

## ディレクトリ構成

```
frontend/docs/
├── README.md          # このファイル
├── TICKETS.md         # チケット一覧
└── tickets/           # 詳細チケット
    ├── FE-001-setup.md
    ├── FE-002-tailwind-setup.md
    ├── FE-003-layout.md
    ├── FE-004-router.md
    ├── FE-005-store.md
    └── ...
```

## チケット管理

### チケット命名規則

`FE-XXX-<name>.md`

- `FE`: Frontend
- `XXX`: 3桁の連番（001, 002, ...）
- `<name>`: チケット名（英語、ハイフン区切り）

### チケット作成状況

| Phase | チケット範囲 | 作成済み | 未作成 |
|-------|------------|---------|--------|
| Phase 1 | FE-001 ~ FE-005 | 0 | 5 |
| Phase 2 | FE-006 ~ FE-010 | 0 | 5 |
| Phase 3 | FE-011 ~ FE-018 | 0 | 8 |
| Phase 4 | FE-019 ~ FE-022 | 0 | 4 |
| Phase 5 | FE-023 ~ FE-029 | 0 | 7 |
| Phase 6 | FE-030 ~ FE-033 | 0 | 4 |
| Phase 7 | FE-034 ~ FE-037 | 0 | 4 |

**合計**: 0 / 37 チケット作成済み

## 実装優先順位

### 最優先（Phase 1）

Vue 3 基盤構築:

1. FE-001: Vite + Vue 3 プロジェクトセットアップ
2. FE-002: Tailwind CSS + DaisyUI セットアップ
3. FE-003: レイアウトコンポーネント作成
4. FE-004: Vue Router 設定
5. FE-005: Pinia ストア設定

### 高優先度（Phase 2）

認証機能:

- FE-006 ~ FE-010: 認証ストア、ログイン/サインアップページ、ルートガード

### 中優先度（Phase 3）

コア機能:

- FE-011 ~ FE-018: コース一覧、詳細、動画プレイヤー、進捗

### その他（Phase 4-7）

- Phase 4: コメント機能
- Phase 5: 講師ダッシュボード
- Phase 6: 管理者機能
- Phase 7: 最適化・改善

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Vue | 3.x | フロントエンドフレームワーク |
| Vite | 5.x | ビルドツール |
| Vue Router | 4.x | ルーティング |
| Pinia | 2.x | 状態管理 |
| Axios | 1.x | HTTP通信 |
| Tailwind CSS | v4 | スタイリング |
| DaisyUI | 4.4.19 | UIコンポーネント |
| FastAPI | 0.109+ | バックエンド（既存） |

## アーキテクチャ

### Vue 3 Composition API

**モダンなコンポーネント定義:**

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCourseStore } from '@/stores/course'

const courseStore = useCourseStore()
const courses = computed(() => courseStore.courses)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await courseStore.fetchCourses()
  loading.value = false
})
</script>

<template>
  <div class="container mx-auto">
    <div v-if="loading" class="loading loading-spinner"></div>
    <CourseList v-else :courses="courses" />
  </div>
</template>
```

### Pinia 状態管理

```javascript
// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    const response = await apiLogin(email, password)
    token.value = response.access_token
    user.value = response.user
    localStorage.setItem('access_token', token.value)
  }

  return { user, token, isAuthenticated, login }
})
```

### Vue Router

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/courses/:id',
      name: 'CourseDetail',
      component: () => import('@/views/CourseDetailView.vue')
    },
    {
      path: '/instructor/dashboard',
      name: 'InstructorDashboard',
      component: () => import('@/views/instructor/DashboardView.vue'),
      meta: { requiresAuth: true, requiresInstructor: true }
    }
  ]
})

// ルートガード
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } else if (to.meta.requiresInstructor && !authStore.isInstructor) {
    next('/')
  } else {
    next()
  }
})

export default router
```

### Axios API Client

```javascript
// api/client.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const client = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
})

// リクエストインターセプター
client.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// レスポンスインターセプター
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/auth/login')
    }
    return Promise.reject(error)
  }
)

export default client
```

## ディレクトリ構成

```
frontend/
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppNavbar.vue
│   │   │   └── AppFooter.vue
│   │   ├── course/
│   │   │   ├── CourseCard.vue
│   │   │   ├── CourseList.vue
│   │   │   └── VideoPlayer.vue
│   │   └── common/
│   │       ├── LoadingSpinner.vue
│   │       └── Toast.vue
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── CourseDetailView.vue
│   │   ├── auth/
│   │   ├── instructor/
│   │   └── admin/
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   ├── auth.js
│   │   ├── course.js
│   │   └── progress.js
│   ├── api/
│   │   ├── client.js
│   │   ├── auth.js
│   │   ├── courses.js
│   │   └── videos.js
│   └── composables/
│       ├── useAuth.js
│       └── useToast.js
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## 開発ガイドライン

### コンポーネント作成

**Single File Component (SFC) 形式:**

```vue
<script setup>
// Composition API
import { ref, computed } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.course.id)
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">{{ course.title_ja }}</h2>
      <p>{{ course.description_ja }}</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary" @click="handleClick">
          詳細を見る
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* コンポーネント固有のスタイル */
</style>
```

### Composables（再利用ロジック）

```javascript
// composables/useAuth.js
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isInstructor = computed(() => authStore.isInstructor)

  async function login(email, password) {
    try {
      await authStore.login(email, password)
      router.push('/')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  function logout() {
    authStore.logout()
    router.push('/')
  }

  return {
    user,
    isAuthenticated,
    isInstructor,
    login,
    logout
  }
}
```

### API 通信

```javascript
// api/courses.js
import client from './client'

export async function getCourses(params = {}) {
  const response = await client.get('/courses', { params })
  return response.data
}

export async function getCourse(id) {
  const response = await client.get(`/courses/${id}`)
  return response.data
}

export async function createCourse(data) {
  const response = await client.post('/courses', data)
  return response.data
}

export async function updateCourse(id, data) {
  const response = await client.put(`/courses/${id}`, data)
  return response.data
}

export async function deleteCourse(id) {
  await client.delete(`/courses/${id}`)
}
```

## 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動 (localhost:5173)
npm run dev

# プロダクションビルド
npm run build

# プレビュー
npm run preview

# リンター実行
npm run lint
```

## 参考リンク

- [Vue 3 ドキュメント](https://vuejs.org/)
- [Vite ドキュメント](https://vitejs.dev/)
- [Vue Router ドキュメント](https://router.vuejs.org/)
- [Pinia ドキュメント](https://pinia.vuejs.org/)
- [Axios ドキュメント](https://axios-http.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)

## 次のステップ

1. Phase 1 のチケット（FE-001 ~ FE-005）を作成する
2. 各チケットを実装する
3. 動作確認とフィードバック
4. Phase 2 以降の実装

---

**最終更新**: 2025-12-31
