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
    const response = await courseStore.fetchCourses({ limit: 100 })
    const allCourses = response.courses || response
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
