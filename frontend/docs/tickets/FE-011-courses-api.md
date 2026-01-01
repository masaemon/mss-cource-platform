# FE-011: コースAPIクライアント実装

## 概要

コース関連のAPIクライアントとストアを実装します。

## 優先度

**High**

## 推定時間

2時間

## 依存関係

- FE-005: Pinia ストア設定

## 実装内容

### 1. api/courses.js 実装

`src/api/courses.js`:

```javascript
import client from './client'

/**
 * コース一覧取得
 * @param {object} params - クエリパラメータ
 * @param {string} params.category_id - カテゴリーID
 * @param {string} params.search - 検索キーワード
 * @param {number} params.page - ページ番号
 * @param {number} params.limit - 1ページあたりの件数
 * @returns {Promise<{courses: array, total: number, page: number, limit: number}>}
 */
export async function getCourses(params = {}) {
  const response = await client.get('/courses', { params })
  return response.data
}

/**
 * コース詳細取得
 * @param {string} id - コースID
 * @returns {Promise<object>} コース詳細
 */
export async function getCourse(id) {
  const response = await client.get(`/courses/${id}`)
  return response.data
}

/**
 * コース作成（講師のみ）
 * @param {object} data - コースデータ
 * @returns {Promise<object>} 作成されたコース
 */
export async function createCourse(data) {
  const response = await client.post('/courses', data)
  return response.data
}

/**
 * コース更新（講師のみ）
 * @param {string} id - コースID
 * @param {object} data - 更新データ
 * @returns {Promise<object>} 更新されたコース
 */
export async function updateCourse(id, data) {
  const response = await client.put(`/courses/${id}`, data)
  return response.data
}

/**
 * コース削除（講師のみ）
 * @param {string} id - コースID
 * @returns {Promise<void>}
 */
export async function deleteCourse(id) {
  await client.delete(`/courses/${id}`)
}

/**
 * コース公開/非公開切り替え（講師のみ）
 * @param {string} id - コースID
 * @param {boolean} isPublished - 公開状態
 * @returns {Promise<object>} 更新されたコース
 */
export async function toggleCoursePublish(id, isPublished) {
  const response = await client.patch(`/courses/${id}/publish`, {
    is_published: isPublished
  })
  return response.data
}
```

### 2. api/categories.js 実装

`src/api/categories.js`:

```javascript
import client from './client'

/**
 * カテゴリー一覧取得
 * @returns {Promise<array>} カテゴリー一覧
 */
export async function getCategories() {
  const response = await client.get('/categories')
  return response.data
}

/**
 * カテゴリー詳細取得
 * @param {string} id - カテゴリーID
 * @returns {Promise<object>} カテゴリー詳細
 */
export async function getCategory(id) {
  const response = await client.get(`/categories/${id}`)
  return response.data
}

/**
 * カテゴリー作成（管理者のみ）
 * @param {object} data - カテゴリーデータ
 * @returns {Promise<object>} 作成されたカテゴリー
 */
export async function createCategory(data) {
  const response = await client.post('/categories', data)
  return response.data
}

/**
 * カテゴリー更新（管理者のみ）
 * @param {string} id - カテゴリーID
 * @param {object} data - 更新データ
 * @returns {Promise<object>} 更新されたカテゴリー
 */
export async function updateCategory(id, data) {
  const response = await client.put(`/categories/${id}`, data)
  return response.data
}

/**
 * カテゴリー削除（管理者のみ）
 * @param {string} id - カテゴリーID
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  await client.delete(`/categories/${id}`)
}
```

### 3. stores/course.js 実装

`src/stores/course.js`:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCourses as apiGetCourses,
  getCourse as apiGetCourse,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse,
  deleteCourse as apiDeleteCourse
} from '@/api/courses'

export const useCourseStore = defineStore('course', () => {
  // State
  const courses = ref([])
  const currentCourse = ref(null)
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Pagination
  const totalCourses = ref(0)
  const currentPage = ref(1)
  const limit = ref(12)

  // Filters
  const selectedCategory = ref(null)
  const searchQuery = ref('')

  // Getters
  const totalPages = computed(() => Math.ceil(totalCourses.value / limit.value))
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  // Actions
  async function fetchCourses(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await apiGetCourses({
        category_id: selectedCategory.value,
        search: searchQuery.value,
        page: currentPage.value,
        limit: limit.value,
        ...params
      })

      courses.value = response.courses || response
      totalCourses.value = response.total || response.length

      return response
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCourse(id) {
    loading.value = true
    error.value = null

    try {
      const course = await apiGetCourse(id)
      currentCourse.value = course
      return course
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCourse(data) {
    loading.value = true
    error.value = null

    try {
      const course = await apiCreateCourse(data)
      courses.value.unshift(course)
      return course
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの作成に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCourse(id, data) {
    loading.value = true
    error.value = null

    try {
      const course = await apiUpdateCourse(id, data)

      // ストア内のコースを更新
      const index = courses.value.findIndex(c => c.id === id)
      if (index !== -1) {
        courses.value[index] = course
      }

      if (currentCourse.value?.id === id) {
        currentCourse.value = course
      }

      return course
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの更新に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCourse(id) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteCourse(id)

      // ストアから削除
      courses.value = courses.value.filter(c => c.id !== id)

      if (currentCourse.value?.id === id) {
        currentCourse.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.detail || 'コースの削除に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Pagination
  function setPage(page) {
    currentPage.value = page
    fetchCourses()
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
      fetchCourses()
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
      fetchCourses()
    }
  }

  // Filters
  function setCategory(categoryId) {
    selectedCategory.value = categoryId
    currentPage.value = 1
    fetchCourses()
  }

  function setSearch(query) {
    searchQuery.value = query
    currentPage.value = 1
    fetchCourses()
  }

  function clearFilters() {
    selectedCategory.value = null
    searchQuery.value = ''
    currentPage.value = 1
    fetchCourses()
  }

  return {
    // State
    courses,
    currentCourse,
    categories,
    loading,
    error,
    totalCourses,
    currentPage,
    limit,
    selectedCategory,
    searchQuery,

    // Getters
    totalPages,
    hasNextPage,
    hasPrevPage,

    // Actions
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    setPage,
    nextPage,
    prevPage,
    setCategory,
    setSearch,
    clearFilters
  }
})
```

### 4. composables/useCourses.js 実装

`src/composables/useCourses.js`:

```javascript
import { useCourseStore } from '@/stores/course'
import { storeToRefs } from 'pinia'

export function useCourses() {
  const courseStore = useCourseStore()

  const {
    courses,
    currentCourse,
    loading,
    error,
    totalCourses,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    selectedCategory,
    searchQuery
  } = storeToRefs(courseStore)

  return {
    // State
    courses,
    currentCourse,
    loading,
    error,
    totalCourses,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    selectedCategory,
    searchQuery,

    // Actions
    fetchCourses: courseStore.fetchCourses,
    fetchCourse: courseStore.fetchCourse,
    createCourse: courseStore.createCourse,
    updateCourse: courseStore.updateCourse,
    deleteCourse: courseStore.deleteCourse,
    setPage: courseStore.setPage,
    nextPage: courseStore.nextPage,
    prevPage: courseStore.prevPage,
    setCategory: courseStore.setCategory,
    setSearch: courseStore.setSearch,
    clearFilters: courseStore.clearFilters
  }
}
```

## 実装ファイル

- `frontend/src/api/courses.js` (新規作成)
- `frontend/src/api/categories.js` (新規作成)
- `frontend/src/stores/course.js` (新規作成)
- `frontend/src/composables/useCourses.js` (新規作成)

## 検証方法

ブラウザコンソールで:

```javascript
import { useCourseStore } from '@/stores/course'

const courseStore = useCourseStore()

// コース一覧取得
await courseStore.fetchCourses()
console.log(courseStore.courses)

// コース詳細取得
await courseStore.fetchCourse('course-id')
console.log(courseStore.currentCourse)
```

## 完了条件

- [ ] コースAPIクライアントが実装されている
- [ ] カテゴリーAPIクライアントが実装されている
- [ ] コースストアが実装されている
- [ ] useCourses composable が実装されている
- [ ] API接続テストが成功する
- [ ] ページネーションが動作する
- [ ] フィルタリングが動作する

## 備考

### APIレスポンス形式

**コース一覧:**
```json
{
  "courses": [...],
  "total": 50,
  "page": 1,
  "limit": 12
}
```

または配列のみ:
```json
[...]
```

**コース詳細:**
```json
{
  "id": "uuid",
  "title_ja": "コースタイトル",
  "description_ja": "説明",
  "category_id": "uuid",
  "instructor_id": "uuid",
  "is_published": true,
  "videos": [...],
  "category": {...},
  "instructor": {...}
}
```
