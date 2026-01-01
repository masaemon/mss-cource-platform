# FE-016~018: 検索・フィルター機能強化

## FE-016: 高度な検索機能

### 概要
検索機能を強化し、タイトル・説明文での全文検索を実装します。

### 優先度: Medium
### 推定時間: 1.5時間
### 依存関係: FE-012

### 実装内容

#### SearchBar.vue コンポーネント

`src/components/common/SearchBar.vue`:

```vue
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '検索...'
  },
  debounce: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const inputValue = ref(props.modelValue || '')
let debounceTimeout = null

watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue || ''
})

watch(inputValue, (newValue) => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    emit('update:modelValue', newValue)
    emit('search', newValue)
  }, props.debounce)
})

function handleClear() {
  inputValue.value = ''
}
</script>

<template>
  <div class="form-control relative">
    <input
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      class="input input-bordered w-full pr-20"
    />
    <button
      v-if="inputValue"
      @click="handleClear"
      class="absolute right-12 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
    >
      ×
    </button>
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
</template>
```

---

## FE-017: カテゴリーフィルター強化

### 概要
カテゴリーフィルターUIを改善し、マルチ選択やクリアボタンを追加します。

### 優先度: Medium
### 推定時間: 1時間

### 実装内容

#### CategoryFilter.vue コンポーネント

`src/components/course/CategoryFilter.vue`:

```vue
<script setup>
import { ref, watch, onMounted } from 'vue'
import { getCategories } from '@/api/categories'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue', 'change'])

const categories = ref([])
const loading = ref(false)
const selectedCategory = ref(props.modelValue || 'all')

watch(() => props.modelValue, (newValue) => {
  selectedCategory.value = newValue || 'all'
})

watch(selectedCategory, (newValue) => {
  const value = newValue === 'all' ? null : newValue
  emit('update:modelValue', value)
  emit('change', value)
})

onMounted(async () => {
  loading.value = true
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="form-control">
    <select
      v-model="selectedCategory"
      class="select select-bordered"
      :disabled="loading"
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
</template>
```

---

## FE-018: ソート機能

### 概要
コース一覧のソート機能（新着順、人気順など）を実装します。

### 優先度: Low
### 推定時間: 1時間

### 実装内容

#### SortSelector.vue コンポーネント

`src/components/course/SortSelector.vue`:

```vue
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'created_at_desc'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const sortOptions = [
  { value: 'created_at_desc', label: '新着順' },
  { value: 'created_at_asc', label: '古い順' },
  { value: 'title_asc', label: 'タイトル順（A-Z）' },
  { value: 'title_desc', label: 'タイトル順（Z-A）' }
]

const selectedSort = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  selectedSort.value = newValue
})

watch(selectedSort, (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
})
</script>

<template>
  <div class="form-control">
    <select
      v-model="selectedSort"
      class="select select-bordered"
    >
      <option
        v-for="option in sortOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
```

#### courses.js API 更新

`src/api/courses.js`:

```javascript
export async function getCourses(params = {}) {
  // sort パラメータを処理
  const { sort, ...otherParams } = params

  if (sort) {
    const [field, order] = sort.split('_')
    otherParams.sort_by = field
    otherParams.sort_order = order
  }

  const response = await client.get('/courses', { params: otherParams })
  return response.data
}
```

### HomeView.vue 更新

```vue
<script setup>
import SearchBar from '@/components/common/SearchBar.vue'
import CategoryFilter from '@/components/course/CategoryFilter.vue'
import SortSelector from '@/components/course/SortSelector.vue'

const sortBy = ref('created_at_desc')

function handleSortChange(value) {
  sortBy.value = value
  fetchCourses({ sort: value })
}
</script>

<template>
  <div class="flex gap-4 mb-6">
    <SearchBar
      v-model="searchInput"
      placeholder="コースを検索..."
      class="flex-1"
    />
    <CategoryFilter
      v-model="selectedCategory"
      @change="handleCategoryChange"
    />
    <SortSelector
      v-model="sortBy"
      @change="handleSortChange"
    />
  </div>
</template>
```

## 実装ファイル

### FE-016
- `frontend/src/components/common/SearchBar.vue` (新規作成)

### FE-017
- `frontend/src/components/course/CategoryFilter.vue` (新規作成)

### FE-018
- `frontend/src/components/course/SortSelector.vue` (新規作成)
- `frontend/src/api/courses.js` (更新)
- `frontend/src/views/HomeView.vue` (更新)

## 検証方法

### FE-016
- [ ] 検索フィールドで入力すると結果が絞り込まれる
- [ ] Debounce が動作する
- [ ] クリアボタンで検索がリセットされる

### FE-017
- [ ] カテゴリー選択で結果が絞り込まれる
- [ ] カテゴリー一覧が正しく表示される

### FE-018
- [ ] ソート順序が正しく適用される
- [ ] ソート変更で一覧が更新される

## 完了条件

### FE-016
- [ ] SearchBar コンポーネントが実装されている
- [ ] Debounce が動作する
- [ ] v-model で双方向バインディングされる

### FE-017
- [ ] CategoryFilter コンポーネントが実装されている
- [ ] カテゴリー一覧が取得できる

### FE-018
- [ ] SortSelector コンポーネントが実装されている
- [ ] API がソートパラメータを受け付ける
- [ ] ソート結果が正しく表示される
