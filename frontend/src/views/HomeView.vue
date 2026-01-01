<script setup>
import { ref, onMounted } from 'vue'
import { useCourses } from '@/composables/useCourses'
import CourseList from '@/components/course/CourseList.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import CategoryFilter from '@/components/course/CategoryFilter.vue'
import SortSelector from '@/components/course/SortSelector.vue'

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
  sortBy,
  fetchCourses,
  setCategory,
  setSearch,
  setSort,
  setPage,
  clearFilters
} = useCourses()

// 初期コース取得
onMounted(() => {
  fetchCourses()
})

// カテゴリー変更
function handleCategoryChange(categoryId) {
  setCategory(categoryId)
}

// ソート変更
function handleSortChange(value) {
  setSort(value)
}

// フィルターリセット
function handleClearFilters() {
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
          <SearchBar
            :model-value="searchQuery"
            @update:model-value="setSearch"
            placeholder="コースを検索..."
            class="flex-1"
          />

          <!-- カテゴリーフィルター -->
          <CategoryFilter
            :model-value="selectedCategory"
            @change="handleCategoryChange"
            class="md:w-64"
          />

          <!-- ソート -->
          <SortSelector
            :model-value="sortBy"
            @change="handleSortChange"
            class="md:w-48"
          />

          <!-- フィルタークリア -->
          <button
            v-if="selectedCategory || searchQuery || sortBy !== 'created_at_desc'"
            @click="handleClearFilters"
            class="btn btn-ghost"
          >
            リセット
          </button>
        </div>

        <!-- アクティブフィルター表示 -->
        <div v-if="selectedCategory || searchQuery || sortBy !== 'created_at_desc'" class="flex gap-2 mt-4">
          <span class="text-sm text-base-content/60">フィルター:</span>
          <div class="flex gap-2 flex-wrap">
            <div v-if="searchQuery" class="badge badge-primary gap-2">
              検索: {{ searchQuery }}
            </div>
            <div v-if="selectedCategory" class="badge badge-primary gap-2">
              カテゴリー選択中
            </div>
            <div v-if="sortBy !== 'created_at_desc'" class="badge badge-primary gap-2">
              ソート: {{ sortBy }}
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
