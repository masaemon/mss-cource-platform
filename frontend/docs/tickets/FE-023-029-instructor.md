# FE-023~029: 講師機能実装

## FE-023: 講師ダッシュボード

### 概要
講師用のダッシュボードを実装し、作成したコースの一覧を表示します。

### 優先度: High
### 推定時間: 2時間
### 依存関係: FE-006, FE-011

### 実装内容

`src/views/instructor/DashboardView.vue`:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/course'

const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()

const myCourses = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!authStore.isInstructor) {
    router.push('/')
    return
  }

  try {
    const allCourses = await courseStore.fetchCourses()
    myCourses.value = allCourses.filter(
      course => course.instructor_id === authStore.user.id
    )
  } catch (err) {
    console.error('Failed to fetch courses:', err)
  } finally {
    loading.value = false
  }
})

function goToCreateCourse() {
  router.push('/instructor/courses/new')
}

function goToEditCourse(courseId) {
  router.push(`/instructor/courses/${courseId}/edit`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold">講師ダッシュボード</h1>
      <button @click="goToCreateCourse" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        新規コース作成
      </button>
    </div>

    <!-- 統計 -->
    <div class="stats shadow mb-8 w-full">
      <div class="stat">
        <div class="stat-title">作成したコース</div>
        <div class="stat-value">{{ myCourses.length }}</div>
      </div>

      <div class="stat">
        <div class="stat-title">公開中</div>
        <div class="stat-value text-primary">
          {{ myCourses.filter(c => c.is_published).length }}
        </div>
      </div>

      <div class="stat">
        <div class="stat-title">下書き</div>
        <div class="stat-value text-base-content/60">
          {{ myCourses.filter(c => !c.is_published).length }}
        </div>
      </div>
    </div>

    <!-- コース一覧 -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else-if="myCourses.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto mb-4 text-base-content/30">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
      <p class="text-lg mb-4">まだコースを作成していません</p>
      <button @click="goToCreateCourse" class="btn btn-primary">
        最初のコースを作成
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="course in myCourses"
        :key="course.id"
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
      >
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="card-title">{{ course.title_ja }}</h3>
                <div
                  class="badge"
                  :class="course.is_published ? 'badge-success' : 'badge-ghost'"
                >
                  {{ course.is_published ? '公開中' : '下書き' }}
                </div>
              </div>
              <p class="text-base-content/60 line-clamp-2">
                {{ course.description_ja }}
              </p>
              <div class="mt-4 flex gap-4 text-sm text-base-content/60">
                <span>動画: {{ course.videos?.length || 0 }}本</span>
                <span>カテゴリー: {{ course.category?.name_ja }}</span>
              </div>
            </div>

            <button
              @click="goToEditCourse(course.id)"
              class="btn btn-outline btn-sm"
            >
              編集
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## FE-024: コース作成・編集フォーム

### 概要
コースの作成・編集フォームを実装します。

### 優先度: High
### 推定時間: 3時間

### 実装内容

`src/views/instructor/CourseFormView.vue`:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { getCategories } from '@/api/categories'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const courseId = route.params.id
const isEditMode = computed(() => !!courseId)

const formData = ref({
  title_ja: '',
  title_en: '',
  description_ja: '',
  description_en: '',
  category_id: '',
  thumbnail_url: '',
  is_published: false
})

const categories = ref([])
const loading = ref(false)
const submitting = ref(false)

onMounted(async () => {
  // カテゴリー取得
  categories.value = await getCategories()

  // 編集モードの場合、既存データを取得
  if (isEditMode.value) {
    loading.value = true
    try {
      const course = await courseStore.fetchCourse(courseId)
      formData.value = {
        title_ja: course.title_ja,
        title_en: course.title_en || '',
        description_ja: course.description_ja,
        description_en: course.description_en || '',
        category_id: course.category_id,
        thumbnail_url: course.thumbnail_url || '',
        is_published: course.is_published
      }
    } finally {
      loading.value = false
    }
  }
})

async function handleSubmit() {
  submitting.value = true

  try {
    if (isEditMode.value) {
      await courseStore.updateCourse(courseId, formData.value)
    } else {
      const newCourse = await courseStore.createCourse(formData.value)
      router.push(`/instructor/courses/${newCourse.id}/edit`)
    }
  } catch (err) {
    console.error('Failed to save course:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-4xl font-bold mb-8">
      {{ isEditMode ? 'コース編集' : '新規コース作成' }}
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 日本語タイトル -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">タイトル（日本語）*</span>
        </label>
        <input
          v-model="formData.title_ja"
          type="text"
          class="input input-bordered"
          required
        />
      </div>

      <!-- 英語タイトル -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">タイトル（英語）</span>
        </label>
        <input
          v-model="formData.title_en"
          type="text"
          class="input input-bordered"
        />
      </div>

      <!-- カテゴリー -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">カテゴリー*</span>
        </label>
        <select
          v-model="formData.category_id"
          class="select select-bordered"
          required
        >
          <option value="">カテゴリーを選択</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name_ja }}
          </option>
        </select>
      </div>

      <!-- 日本語説明 -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">説明（日本語）*</span>
        </label>
        <textarea
          v-model="formData.description_ja"
          class="textarea textarea-bordered h-32"
          required
        ></textarea>
      </div>

      <!-- 英語説明 -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">説明（英語）</span>
        </label>
        <textarea
          v-model="formData.description_en"
          class="textarea textarea-bordered h-32"
        ></textarea>
      </div>

      <!-- サムネイル -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">サムネイル画像URL</span>
        </label>
        <input
          v-model="formData.thumbnail_url"
          type="url"
          class="input input-bordered"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <!-- 公開設定 -->
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-4">
          <input
            v-model="formData.is_published"
            type="checkbox"
            class="toggle toggle-primary"
          />
          <span class="label-text">公開する</span>
        </label>
      </div>

      <!-- ボタン -->
      <div class="flex gap-4 justify-end">
        <button
          type="button"
          @click="router.back()"
          class="btn btn-ghost"
        >
          キャンセル
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="submitting"
        >
          {{ isEditMode ? '更新' : '作成' }}
        </button>
      </div>
    </form>
  </div>
</template>
```

---

## FE-025~029: 動画管理・その他機能

### 概要

以下の講師機能を実装:

- **FE-025**: 動画管理画面（動画一覧、追加、削除）
- **FE-026**: 動画編集フォーム
- **FE-027**: ドラッグ&ドロップで動画順序変更
- **FE-028**: コース削除機能
- **FE-029**: 公開/非公開切り替え

### 優先度: Medium
### 推定時間: FE-025(2h), FE-026(2h), FE-027(2h), FE-028(1h), FE-029(1h)

### 実装内容概要

#### FE-025: 動画管理画面

`src/views/instructor/VideoManageView.vue` を作成し:
- 動画一覧表示（順序付き）
- 動画追加ボタン
- 動画編集・削除ボタン
- YouTube URL から動画ID抽出

#### FE-026: 動画編集フォーム

`src/components/instructor/VideoForm.vue` を作成し:
- タイトル（日英）
- 説明（日英）
- YouTube URL入力
- 順序番号

#### FE-027: ドラッグ&ドロップ順序変更

VueDraggable ライブラリを使用:
```bash
npm install vuedraggable@next
```

```vue
<script setup>
import draggable from 'vuedraggable'

const videos = ref([...])

async function handleOrderChange() {
  // 順序を更新するAPI呼び出し
  videos.value.forEach((video, index) => {
    video.order_number = index + 1
  })
  // バックエンドに保存
}
</script>

<template>
  <draggable
    v-model="videos"
    @end="handleOrderChange"
    item-key="id"
  >
    <template #item="{element}">
      <div class="video-item">{{ element.title_ja }}</div>
    </template>
  </draggable>
</template>
```

#### FE-028: コース削除

`CourseFormView.vue` に削除ボタン追加:
```vue
<script setup>
async function handleDelete() {
  if (!confirm('本当にこのコースを削除しますか？この操作は取り消せません。')) {
    return
  }

  try {
    await courseStore.deleteCourse(courseId)
    router.push('/instructor/dashboard')
  } catch (err) {
    console.error('Failed to delete course:', err)
  }
}
</script>

<template>
  <button
    v-if="isEditMode"
    @click="handleDelete"
    class="btn btn-error btn-outline"
  >
    コースを削除
  </button>
</template>
```

#### FE-029: 公開/非公開切り替え

`CourseFormView.vue` に切り替えボタン追加:
```vue
<script setup>
import { toggleCoursePublish } from '@/api/courses'

async function handleTogglePublish() {
  try {
    await toggleCoursePublish(courseId, !formData.value.is_published)
    formData.value.is_published = !formData.value.is_published
  } catch (err) {
    console.error('Failed to toggle publish:', err)
  }
}
</script>

<template>
  <button
    v-if="isEditMode"
    @click="handleTogglePublish"
    class="btn"
    :class="formData.is_published ? 'btn-warning' : 'btn-success'"
  >
    {{ formData.is_published ? '非公開にする' : '公開する' }}
  </button>
</template>
```

## 実装ファイル

### FE-023
- `frontend/src/views/instructor/DashboardView.vue` (新規作成)

### FE-024
- `frontend/src/views/instructor/CourseFormView.vue` (新規作成)

### FE-025
- `frontend/src/views/instructor/VideoManageView.vue` (新規作成)

### FE-026
- `frontend/src/components/instructor/VideoForm.vue` (新規作成)

### FE-027
- `package.json` (vuedraggable 追加)
- 動画管理画面に draggable 適用

### FE-028, FE-029
- `frontend/src/views/instructor/CourseFormView.vue` (更新)

## Router 更新

```javascript
const routes = [
  // ... 既存のルート
  {
    path: '/instructor/dashboard',
    name: 'InstructorDashboard',
    component: () => import('@/views/instructor/DashboardView.vue'),
    meta: { requiresAuth: true, requiresInstructor: true }
  },
  {
    path: '/instructor/courses/new',
    name: 'CreateCourse',
    component: () => import('@/views/instructor/CourseFormView.vue'),
    meta: { requiresAuth: true, requiresInstructor: true }
  },
  {
    path: '/instructor/courses/:id/edit',
    name: 'EditCourse',
    component: () => import('@/views/instructor/CourseFormView.vue'),
    meta: { requiresAuth: true, requiresInstructor: true }
  },
  {
    path: '/instructor/courses/:id/videos',
    name: 'ManageVideos',
    component: () => import('@/views/instructor/VideoManageView.vue'),
    meta: { requiresAuth: true, requiresInstructor: true }
  }
]
```

## 検証方法

### FE-023
- [ ] 講師ダッシュボードが表示される
- [ ] 作成したコースの一覧が表示される
- [ ] 統計情報が正しい

### FE-024
- [ ] コース作成フォームが動作する
- [ ] コース編集フォームが動作する
- [ ] バリデーションが動作する

### FE-025~029
- [ ] 動画管理画面が動作する
- [ ] 動画の追加・編集・削除ができる
- [ ] ドラッグ&ドロップで順序変更できる
- [ ] コースを削除できる
- [ ] 公開/非公開を切り替えられる

## 完了条件

- [ ] 講師ダッシュボードが実装されている
- [ ] コース作成・編集フォームが実装されている
- [ ] 動画管理機能が実装されている
- [ ] ドラッグ&ドロップが動作する
- [ ] コース削除が実装されている
- [ ] 公開/非公開切り替えが実装されている
