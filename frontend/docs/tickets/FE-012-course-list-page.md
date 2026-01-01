# FE-012: コース一覧ページ実装

## 概要

コース一覧ページを実装し、検索、フィルター、ページネーション機能を提供します。

## 優先度

**High**

## 推定時間

3時間

## 依存関係

- FE-003: レイアウトコンポーネント実装
- FE-004: Vue Router 設定
- FE-011: コースAPIクライアント実装

## 実装内容

### 1. CourseCard.vue コンポーネント

`src/components/course/CourseCard.vue`:

```vue
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const thumbnailUrl = computed(() =>
  props.course.thumbnail_url || '/images/default-course.png'
)

const categoryName = computed(() =>
  props.course.category?.name_ja || 'カテゴリーなし'
)

const instructorName = computed(() =>
  props.course.instructor?.display_name || '講師名不明'
)

const videoCount = computed(() =>
  props.course.videos?.length || 0
)

function goToCourse() {
  router.push(`/courses/${props.course.id}`)
}
</script>

<template>
  <div
    class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
    @click="goToCourse"
  >
    <figure class="aspect-video">
      <img
        :src="thumbnailUrl"
        :alt="course.title_ja"
        class="w-full h-full object-cover"
      />
    </figure>

    <div class="card-body">
      <!-- カテゴリーバッジ -->
      <div class="badge badge-primary badge-sm">
        {{ categoryName }}
      </div>

      <!-- タイトル -->
      <h3 class="card-title text-lg line-clamp-2">
        {{ course.title_ja }}
      </h3>

      <!-- 説明 -->
      <p class="text-sm text-base-content/60 line-clamp-2">
        {{ course.description_ja }}
      </p>

      <!-- フッター -->
      <div class="card-actions justify-between items-center mt-4">
        <div class="flex items-center gap-2">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-full w-8">
              <span class="text-xs">{{ instructorName[0] }}</span>
            </div>
          </div>
          <span class="text-sm text-base-content/60">{{ instructorName }}</span>
        </div>

        <div class="badge badge-outline badge-sm">
          {{ videoCount }} 動画
        </div>
      </div>
    </div>
  </div>
</template>
```

### 2. CourseList.vue コンポーネント

`src/components/course/CourseList.vue`:

```vue
<script setup>
import CourseCard from './CourseCard.vue'

defineProps({
  courses: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div>
    <!-- ローディング状態 -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 6"
        :key="i"
        class="card bg-base-100 shadow-xl"
      >
        <div class="aspect-video bg-base-300 animate-pulse"></div>
        <div class="card-body">
          <div class="h-4 bg-base-300 rounded animate-pulse mb-2"></div>
          <div class="h-6 bg-base-300 rounded animate-pulse mb-2"></div>
          <div class="h-4 bg-base-300 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    </div>

    <!-- コース一覧 -->
    <div
      v-else-if="courses.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
      />
    </div>

    <!-- 空の状態 -->
    <div v-else class="text-center py-16">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-16 h-16 mx-auto text-base-content/30 mb-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
      <p class="text-lg font-medium text-base-content/60">
        コースが見つかりませんでした
      </p>
      <p class="text-sm text-base-content/40 mt-2">
        検索条件を変更してお試しください
      </p>
    </div>
  </div>
</template>
```

### 3. HomeView.vue ページ実装

`src/views/HomeView.vue`:

```vue
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCourses } from '@/composables/useCourses'
import { getCategories } from '@/api/categories'
import CourseList from '@/components/course/CourseList.vue'

const {
  courses,
  loading,
  totalCourses,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  selectedCategory,
  searchQuery,
  fetchCourses,
  setCategory,
  setSearch,
  setPage,
  clearFilters
} = useCourses()

const categories = ref([])
const loadingCategories = ref(false)
const searchInput = ref('')

// カテゴリー取得
onMounted(async () => {
  loadingCategories.value = true
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loadingCategories.value = false
  }

  // 初期コース取得
  fetchCourses()
})

// 検索処理（debounce付き）
let searchTimeout = null
watch(searchInput, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    setSearch(newValue)
  }, 300)
})

// カテゴリー変更
function handleCategoryChange(categoryId) {
  setCategory(categoryId === 'all' ? null : categoryId)
}

// フィルターリセット
function handleClearFilters() {
  searchInput.value = ''
  clearFilters()
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- ヘッダー -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">コース一覧</h1>
      <p class="text-base-content/60">
        学びたいコースを見つけましょう
      </p>
    </div>

    <!-- 検索・フィルター -->
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 検索 -->
          <div class="form-control flex-1">
            <div class="relative">
              <input
                v-model="searchInput"
                type="text"
                placeholder="コースを検索..."
                class="input input-bordered w-full pr-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          <!-- カテゴリーフィルター -->
          <div class="form-control md:w-64">
            <select
              :value="selectedCategory || 'all'"
              @change="handleCategoryChange($event.target.value)"
              class="select select-bordered"
            >
              <option value="all">すべてのカテゴリー</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name_ja }}
              </option>
            </select>
          </div>

          <!-- フィルタークリア -->
          <button
            v-if="selectedCategory || searchQuery"
            @click="handleClearFilters"
            class="btn btn-ghost"
          >
            リセット
          </button>
        </div>

        <!-- アクティブフィルター表示 -->
        <div v-if="selectedCategory || searchQuery" class="flex gap-2 mt-4">
          <span class="text-sm text-base-content/60">フィルター:</span>
          <div class="flex gap-2 flex-wrap">
            <div v-if="searchQuery" class="badge badge-primary gap-2">
              検索: {{ searchQuery }}
            </div>
            <div v-if="selectedCategory" class="badge badge-primary gap-2">
              {{ categories.find(c => c.id === selectedCategory)?.name_ja }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- コース数表示 -->
    <div class="flex justify-between items-center mb-6">
      <p class="text-base-content/60">
        {{ totalCourses }} 件のコースが見つかりました
      </p>
    </div>

    <!-- コース一覧 -->
    <CourseList :courses="courses" :loading="loading" />

    <!-- ページネーション -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="join">
        <button
          @click="setPage(currentPage - 1)"
          class="join-item btn"
          :disabled="!hasPrevPage"
        >
          «
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          @click="setPage(page)"
          class="join-item btn"
          :class="{ 'btn-active': page === currentPage }"
        >
          {{ page }}
        </button>

        <button
          @click="setPage(currentPage + 1)"
          class="join-item btn"
          :disabled="!hasNextPage"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>
```

### 4. Router 更新

`src/router/index.js` にホームルートを追加:

```javascript
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'ホーム'
    }
  },
  // ... 他のルート
]
```

## 実装ファイル

- `frontend/src/components/course/CourseCard.vue` (新規作成)
- `frontend/src/components/course/CourseList.vue` (新規作成)
- `frontend/src/views/HomeView.vue` (新規作成)
- `frontend/src/router/index.js` (更新)

## 検証方法

```bash
npm run dev
# http://localhost:5173/ にアクセス
```

以下を確認:
- [ ] コース一覧が表示される
- [ ] コースカードがクリック可能
- [ ] 検索機能が動作する（300ms debounce）
- [ ] カテゴリーフィルターが動作する
- [ ] ページネーションが動作する
- [ ] ローディング状態が表示される
- [ ] 空の状態が表示される
- [ ] レスポンシブデザインが動作する

## 完了条件

- [ ] CourseCard コンポーネントが実装されている
- [ ] CourseList コンポーネントが実装されている
- [ ] HomeView ページが実装されている
- [ ] 検索機能が動作する
- [ ] カテゴリーフィルターが動作する
- [ ] ページネーションが動作する
- [ ] ローディング・空の状態が適切に表示される

## 備考

### レスポンシブデザイン

- モバイル: 1列
- タブレット: 2列
- デスクトップ: 3列

### パフォーマンス最適化

- 検索は300msのdebounce
- 画像はlazy loading（必要に応じて）
- ページネーションで大量データに対応

### アクセシビリティ

- カードはキーボード操作可能
- 適切な alt テキスト
- スクリーンリーダー対応
