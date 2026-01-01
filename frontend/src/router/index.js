import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'コース一覧' }
    },
    {
      path: '/courses/:id',
      name: 'CourseDetail',
      component: () => import('@/views/CourseDetailView.vue'),
      meta: { title: 'コース詳細' }
    },
    {
      path: '/auth/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { title: 'ログイン', requiresGuest: true }
    },
    {
      path: '/auth/signup',
      name: 'Signup',
      component: () => import('@/views/auth/SignupView.vue'),
      meta: { title: 'サインアップ', requiresGuest: true }
    },
    {
      path: '/auth/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { title: 'パスワードリセット', requiresGuest: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: 'プロフィール', requiresAuth: true }
    },
    {
      path: '/instructor/dashboard',
      name: 'InstructorDashboard',
      component: () => import('@/views/instructor/DashboardView.vue'),
      meta: { title: '講師ダッシュボード', requiresAuth: true, requiresInstructor: true }
    },
    {
      path: '/instructor/courses/new',
      name: 'CreateCourse',
      component: () => import('@/views/instructor/CourseFormView.vue'),
      meta: { title: '新規コース作成', requiresAuth: true, requiresInstructor: true }
    },
    {
      path: '/instructor/courses/:id/edit',
      name: 'EditCourse',
      component: () => import('@/views/instructor/CourseFormView.vue'),
      meta: { title: 'コース編集', requiresAuth: true, requiresInstructor: true }
    },
    {
      path: '/instructor/courses/:id/videos',
      name: 'ManageVideos',
      component: () => import('@/views/instructor/VideoManageView.vue'),
      meta: { title: '動画管理', requiresAuth: true, requiresInstructor: true }
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard'
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { title: '管理者ダッシュボード', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: () => import('@/views/admin/UsersView.vue'),
      meta: { title: 'ユーザー管理', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/categories',
      name: 'AdminCategories',
      component: () => import('@/views/admin/CategoriesView.vue'),
      meta: { title: 'カテゴリー管理', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'ページが見つかりません' }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0 }
    }
  }
})

// グローバルナビゲーションガード
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const { showToast } = useToast()

  // ページタイトル設定
  document.title = to.meta.title
    ? `${to.meta.title} - MSS Course Platform`
    : 'MSS Course Platform'

  // 認証状態の確認
  const isAuthenticated = authStore.isAuthenticated

  // トークンがある場合、ユーザー情報を取得（初回のみ）
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      // トークンが無効な場合はログアウト
      authStore.logout()
    }
  }

  // ゲスト専用ページ（ログイン/サインアップ）
  if (to.meta.requiresGuest && isAuthenticated) {
    showToast('すでにログインしています', 'info')
    next({ name: 'Home' })
    return
  }

  // 認証必須ページ
  if (to.meta.requiresAuth && !isAuthenticated) {
    showToast('ログインが必要です', 'warning')
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 講師専用ページ
  if (to.meta.requiresInstructor && !authStore.isInstructor) {
    showToast('講師のみアクセスできます', 'error')
    next({ name: 'Home' })
    return
  }

  // 管理者専用ページ
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    showToast('管理者のみアクセスできます', 'error')
    next({ name: 'Home' })
    return
  }

  next()
})

// エラーハンドラー
router.onError((error) => {
  console.error('Router error:', error)
  const { showToast } = useToast()
  showToast('ページの読み込みに失敗しました', 'error')
})

export default router
