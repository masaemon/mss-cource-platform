# FE-030~033: 管理者機能実装

## FE-030: 管理者ダッシュボード

### 概要
管理者用のダッシュボードを実装し、システム全体の統計情報を表示します。

### 優先度: Medium
### 推定時間: 2時間
### 依存関係: FE-006

### 実装内容

`src/views/admin/DashboardView.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUsers } from '@/api/users'
import { getCourses } from '@/api/courses'
import { getCategories } from '@/api/categories'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  totalUsers: 0,
  totalInstructors: 0,
  totalCourses: 0,
  publishedCourses: 0,
  totalCategories: 0,
  totalVideos: 0
})

const loading = ref(true)

onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/')
    return
  }

  try {
    const [users, courses, categories] = await Promise.all([
      getUsers(),
      getCourses(),
      getCategories()
    ])

    stats.value = {
      totalUsers: users.length,
      totalInstructors: users.filter(u => u.role === 'instructor' || u.role === 'admin').length,
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.is_published).length,
      totalCategories: categories.length,
      totalVideos: courses.reduce((sum, c) => sum + (c.videos?.length || 0), 0)
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">管理者ダッシュボード</h1>

    <!-- ナビゲーション -->
    <div class="tabs tabs-boxed mb-8">
      <router-link to="/admin/dashboard" class="tab tab-active">ダッシュボード</router-link>
      <router-link to="/admin/users" class="tab">ユーザー管理</router-link>
      <router-link to="/admin/categories" class="tab">カテゴリー管理</router-link>
    </div>

    <!-- 統計情報 -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- ユーザー統計 -->
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="stat-title">総ユーザー数</div>
          <div class="stat-value text-primary">{{ stats.totalUsers }}</div>
          <div class="stat-desc">講師: {{ stats.totalInstructors }}人</div>
        </div>
      </div>

      <!-- コース統計 -->
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div class="stat-title">総コース数</div>
          <div class="stat-value text-secondary">{{ stats.totalCourses }}</div>
          <div class="stat-desc">公開中: {{ stats.publishedCourses }}件</div>
        </div>
      </div>

      <!-- カテゴリー統計 -->
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-figure text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div class="stat-title">カテゴリー数</div>
          <div class="stat-value text-accent">{{ stats.totalCategories }}</div>
        </div>
      </div>

      <!-- 動画統計 -->
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">総動画数</div>
          <div class="stat-value">{{ stats.totalVideos }}</div>
          <div class="stat-desc">全コース合計</div>
        </div>
      </div>
    </div>

    <!-- クイックアクション -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">クイックアクション</h2>
      <div class="flex gap-4">
        <router-link to="/admin/users" class="btn btn-primary">
          ユーザー管理
        </router-link>
        <router-link to="/admin/categories" class="btn btn-secondary">
          カテゴリー管理
        </router-link>
      </div>
    </div>
  </div>
</template>
```

---

## FE-031: ユーザー管理画面

### 概要
ユーザー一覧表示と役割変更機能を実装します。

### 優先度: Medium
### 推定時間: 2.5時間

### 実装内容

#### users.js API

`src/api/users.js`:

```javascript
import client from './client'

export async function getUsers() {
  const response = await client.get('/users')
  return response.data
}

export async function updateUserRole(userId, role) {
  const response = await client.patch(`/users/${userId}/role`, { role })
  return response.data
}
```

#### UsersView.vue

`src/views/admin/UsersView.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, updateUserRole } from '@/api/users'

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.email.toLowerCase().includes(query) ||
    user.display_name?.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  try {
    users.value = await getUsers()
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    loading.value = false
  }
})

async function handleRoleChange(user, newRole) {
  if (!confirm(`${user.email} の役割を ${newRole} に変更しますか？`)) {
    return
  }

  try {
    await updateUserRole(user.id, newRole)
    user.role = newRole
  } catch (err) {
    console.error('Failed to update role:', err)
  }
}

function getRoleBadgeClass(role) {
  switch (role) {
    case 'admin': return 'badge-error'
    case 'instructor': return 'badge-warning'
    default: return 'badge-ghost'
  }
}

function getRoleLabel(role) {
  switch (role) {
    case 'admin': return '管理者'
    case 'instructor': return '講師'
    default: return '一般ユーザー'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">ユーザー管理</h1>

    <!-- 検索 -->
    <div class="form-control mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="ユーザーを検索..."
        class="input input-bordered"
      />
    </div>

    <!-- ユーザー一覧 -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>メールアドレス</th>
            <th>表示名</th>
            <th>役割</th>
            <th>登録日</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.email }}</td>
            <td>{{ user.display_name || '-' }}</td>
            <td>
              <div :class="['badge', getRoleBadgeClass(user.role)]">
                {{ getRoleLabel(user.role) }}
              </div>
            </td>
            <td>{{ new Date(user.created_at).toLocaleDateString('ja-JP') }}</td>
            <td>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-xs">
                  変更
                </label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
                  <li v-if="user.role !== 'user'">
                    <a @click="handleRoleChange(user, 'user')">一般ユーザー</a>
                  </li>
                  <li v-if="user.role !== 'instructor'">
                    <a @click="handleRoleChange(user, 'instructor')">講師</a>
                  </li>
                  <li v-if="user.role !== 'admin'">
                    <a @click="handleRoleChange(user, 'admin')">管理者</a>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 text-sm text-base-content/60">
      {{ filteredUsers.length }}人のユーザー
    </div>
  </div>
</template>
```

---

## FE-032: カテゴリー管理画面

### 概要
カテゴリーの作成・編集・削除機能を実装します。

### 優先度: Medium
### 推定時間: 2時間

### 実装内容

`src/views/admin/CategoriesView.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/categories'

const categories = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingCategory = ref(null)

const formData = ref({
  name_ja: '',
  name_en: '',
  slug: ''
})

onMounted(async () => {
  await fetchCategories()
})

async function fetchCategories() {
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingCategory.value = null
  formData.value = { name_ja: '', name_en: '', slug: '' }
  showModal.value = true
}

function openEditModal(category) {
  editingCategory.value = category
  formData.value = {
    name_ja: category.name_ja,
    name_en: category.name_en || '',
    slug: category.slug
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, formData.value)
    } else {
      await createCategory(formData.value)
    }

    showModal.value = false
    await fetchCategories()
  } catch (err) {
    console.error('Failed to save category:', err)
  }
}

async function handleDelete(category) {
  if (!confirm(`カテゴリー「${category.name_ja}」を削除しますか？`)) {
    return
  }

  try {
    await deleteCategory(category.id)
    await fetchCategories()
  } catch (err) {
    console.error('Failed to delete category:', err)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold">カテゴリー管理</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        新規カテゴリー作成
      </button>
    </div>

    <!-- カテゴリー一覧 -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="card bg-base-100 shadow-xl"
      >
        <div class="card-body">
          <h3 class="card-title">{{ category.name_ja }}</h3>
          <p class="text-sm text-base-content/60">{{ category.name_en }}</p>
          <p class="text-xs text-base-content/40">slug: {{ category.slug }}</p>

          <div class="card-actions justify-end mt-4">
            <button
              @click="openEditModal(category)"
              class="btn btn-sm btn-ghost"
            >
              編集
            </button>
            <button
              @click="handleDelete(category)"
              class="btn btn-sm btn-error btn-outline"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- モーダル -->
    <dialog :open="showModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ editingCategory ? 'カテゴリー編集' : '新規カテゴリー作成' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">名前（日本語）*</span>
            </label>
            <input
              v-model="formData.name_ja"
              type="text"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">名前（英語）</span>
            </label>
            <input
              v-model="formData.name_en"
              type="text"
              class="input input-bordered"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">スラッグ*</span>
            </label>
            <input
              v-model="formData.slug"
              type="text"
              class="input input-bordered"
              required
            />
          </div>

          <div class="modal-action">
            <button
              type="button"
              @click="showModal = false"
              class="btn btn-ghost"
            >
              キャンセル
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingCategory ? '更新' : '作成' }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showModal = false">close</button>
      </form>
    </dialog>
  </div>
</template>
```

---

## FE-033: 管理者Router設定

### 概要
管理者用のルート設定を追加します。

### 優先度: Medium
### 推定時間: 0.5時間

### 実装内容

`src/router/index.js`:

```javascript
const routes = [
  // ... 既存のルート
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/UsersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('@/views/admin/CategoriesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]
```

## 実装ファイル

### FE-030
- `frontend/src/views/admin/DashboardView.vue` (新規作成)

### FE-031
- `frontend/src/api/users.js` (新規作成)
- `frontend/src/views/admin/UsersView.vue` (新規作成)

### FE-032
- `frontend/src/views/admin/CategoriesView.vue` (新規作成)

### FE-033
- `frontend/src/router/index.js` (更新)

## 検証方法

### FE-030
- [ ] 管理者ダッシュボードが表示される
- [ ] 統計情報が正しく表示される
- [ ] クイックアクションが動作する

### FE-031
- [ ] ユーザー一覧が表示される
- [ ] ユーザーの役割を変更できる
- [ ] 検索機能が動作する

### FE-032
- [ ] カテゴリー一覧が表示される
- [ ] カテゴリーを作成できる
- [ ] カテゴリーを編集できる
- [ ] カテゴリーを削除できる

### FE-033
- [ ] 管理者ページへのルーティングが動作する
- [ ] 管理者以外はアクセスできない

## 完了条件

- [ ] 管理者ダッシュボードが実装されている
- [ ] ユーザー管理機能が実装されている
- [ ] カテゴリー管理機能が実装されている
- [ ] 管理者用ルートが設定されている
- [ ] アクセス制御が動作している
