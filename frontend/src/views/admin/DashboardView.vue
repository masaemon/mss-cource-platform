<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { getUsers } from '@/api/users'
import { getCourses } from '@/api/courses'
import { getCategories } from '@/api/categories'

const router = useRouter()
const authStore = useAuthStore()
const { error: showError } = useToast()

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
    const [users, coursesResponse, categories] = await Promise.all([
      getUsers(),
      getCourses(),
      getCategories()
    ])

    // getCourses は { courses: [...], total, page, limit } を返す可能性がある
    const courses = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse.courses

    stats.value = {
      totalUsers: users.length,
      totalInstructors: users.filter(u => u.role === 'instructor' || u.role === 'admin').length,
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.is_published).length,
      totalCategories: categories.length,
      totalVideos: courses.reduce((sum, c) => sum + (c.videos?.length || 0), 0)
    }
  } catch (err) {
    showError('データの取得に失敗しました')
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
      <router-link to="/admin/dashboard" class="tab tab-active">
        ダッシュボード
      </router-link>
      <router-link to="/admin/users" class="tab">
        ユーザー管理
      </router-link>
      <router-link to="/admin/categories" class="tab">
        カテゴリー管理
      </router-link>
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
          <div class="stat-figure text-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
          </div>
          <div class="stat-title">総動画数</div>
          <div class="stat-value text-info">{{ stats.totalVideos }}</div>
          <div class="stat-desc">全コース合計</div>
        </div>
      </div>
    </div>

    <!-- クイックアクション -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">クイックアクション</h2>
      <div class="flex gap-4">
        <router-link to="/admin/users" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          ユーザー管理
        </router-link>
        <router-link to="/admin/categories" class="btn btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
          カテゴリー管理
        </router-link>
      </div>
    </div>
  </div>
</template>
