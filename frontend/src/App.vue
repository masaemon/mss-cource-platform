<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import ToastContainer from './components/common/ToastContainer.vue'

const authStore = useAuthStore()

onMounted(() => {
  // 認証情報を復元
  authStore.initialize()

  // トークンの定期チェックを開始
  authStore.startTokenCheck()
})
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen">
    <AppHeader />

    <main class="flex-1 container mx-auto px-4 py-8">
      <!-- Vue Router のコンテンツ -->
      <RouterView />
    </main>

    <AppFooter />

    <!-- Toast通知コンテナ -->
    <ToastContainer />
  </div>
</template>
