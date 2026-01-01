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
