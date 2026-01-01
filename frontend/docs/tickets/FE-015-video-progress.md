# FE-015: 視聴進捗管理実装

## 概要

動画の視聴進捗を記録・表示する機能を実装します。

## 優先度

**High**

## 推定時間

2時間

## 依存関係

- FE-014: 動画プレイヤーコンポーネント実装
- FE-006: 認証APIクライアント実装

## 実装内容

### 1. Progress API クライアント

`src/api/progress.js`:

```javascript
import client from './client'

/**
 * ユーザーの視聴進捗を取得
 * @param {string} userId - ユーザーID
 * @returns {Promise<array>} 視聴進捗リスト
 */
export async function getUserProgress(userId) {
  const response = await client.get(`/users/${userId}/progress`)
  return response.data
}

/**
 * 特定コースの視聴進捗を取得
 * @param {string} courseId - コースID
 * @returns {Promise<array>} 視聴進捗リスト
 */
export async function getCourseProgress(courseId) {
  const response = await client.get(`/courses/${courseId}/progress`)
  return response.data
}

/**
 * 動画の視聴進捗を更新
 * @param {string} videoId - 動画ID
 * @param {boolean} isCompleted - 完了フラグ
 * @returns {Promise<object>} 更新された進捗
 */
export async function updateVideoProgress(videoId, isCompleted) {
  const response = await client.post(`/videos/${videoId}/progress`, {
    is_completed: isCompleted
  })
  return response.data
}

/**
 * 動画の視聴進捗を削除
 * @param {string} videoId - 動画ID
 * @returns {Promise<void>}
 */
export async function deleteVideoProgress(videoId) {
  await client.delete(`/videos/${videoId}/progress`)
}
```

### 2. Progress Pinia Store

`src/stores/progress.js`:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getUserProgress as apiGetUserProgress,
  getCourseProgress as apiGetCourseProgress,
  updateVideoProgress as apiUpdateVideoProgress,
  deleteVideoProgress as apiDeleteVideoProgress
} from '@/api/progress'

export const useProgressStore = defineStore('progress', () => {
  // State
  const progressMap = ref({}) // { [videoId]: progressObject }
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isVideoCompleted = computed(() => (videoId) => {
    return progressMap.value[videoId]?.is_completed || false
  })

  const getVideoProgress = computed(() => (videoId) => {
    return progressMap.value[videoId] || null
  })

  const getCourseCompletionRate = computed(() => (courseId, videos) => {
    if (!videos || videos.length === 0) return 0

    const completedCount = videos.filter(video =>
      isVideoCompleted.value(video.id)
    ).length

    return Math.round((completedCount / videos.length) * 100)
  })

  // Actions
  async function fetchUserProgress(userId) {
    loading.value = true
    error.value = null

    try {
      const progressList = await apiGetUserProgress(userId)

      // Map形式に変換
      progressMap.value = {}
      progressList.forEach(progress => {
        progressMap.value[progress.video_id] = progress
      })

      return progressList
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗の取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCourseProgress(courseId) {
    loading.value = true
    error.value = null

    try {
      const progressList = await apiGetCourseProgress(courseId)

      // Map形式に変換（既存のデータに追加）
      progressList.forEach(progress => {
        progressMap.value[progress.video_id] = progress
      })

      return progressList
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗の取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleVideoCompletion(videoId) {
    const currentProgress = progressMap.value[videoId]
    const newStatus = !currentProgress?.is_completed

    try {
      const updatedProgress = await apiUpdateVideoProgress(videoId, newStatus)
      progressMap.value[videoId] = updatedProgress
      return updatedProgress
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗の更新に失敗しました'
      throw err
    }
  }

  async function markAsCompleted(videoId) {
    try {
      const updatedProgress = await apiUpdateVideoProgress(videoId, true)
      progressMap.value[videoId] = updatedProgress
      return updatedProgress
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗の更新に失敗しました'
      throw err
    }
  }

  async function markAsIncomplete(videoId) {
    try {
      const updatedProgress = await apiUpdateVideoProgress(videoId, false)
      progressMap.value[videoId] = updatedProgress
      return updatedProgress
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗の更新に失敗しました'
      throw err
    }
  }

  async function resetVideoProgress(videoId) {
    try {
      await apiDeleteVideoProgress(videoId)
      delete progressMap.value[videoId]
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗のリセットに失敗しました'
      throw err
    }
  }

  function clearProgress() {
    progressMap.value = {}
    error.value = null
  }

  return {
    // State
    progressMap,
    loading,
    error,

    // Getters
    isVideoCompleted,
    getVideoProgress,
    getCourseCompletionRate,

    // Actions
    fetchUserProgress,
    fetchCourseProgress,
    toggleVideoCompletion,
    markAsCompleted,
    markAsIncomplete,
    resetVideoProgress,
    clearProgress
  }
})
```

### 3. useProgress Composable

`src/composables/useProgress.js`:

```javascript
import { useProgressStore } from '@/stores/progress'
import { storeToRefs } from 'pinia'

export function useProgress() {
  const progressStore = useProgressStore()

  const {
    progressMap,
    loading,
    error,
    isVideoCompleted,
    getVideoProgress,
    getCourseCompletionRate
  } = storeToRefs(progressStore)

  return {
    // State
    progressMap,
    loading,
    error,
    isVideoCompleted,
    getVideoProgress,
    getCourseCompletionRate,

    // Actions
    fetchUserProgress: progressStore.fetchUserProgress,
    fetchCourseProgress: progressStore.fetchCourseProgress,
    toggleVideoCompletion: progressStore.toggleVideoCompletion,
    markAsCompleted: progressStore.markAsCompleted,
    markAsIncomplete: progressStore.markAsIncomplete,
    resetVideoProgress: progressStore.resetVideoProgress,
    clearProgress: progressStore.clearProgress
  }
}
```

### 4. CourseDetailView.vue 更新

動画リストにチェックボックスを追加:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useProgress } from '@/composables/useProgress'
import VideoPlayer from '@/components/course/VideoPlayer.vue'

const route = useRoute()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const {
  isVideoCompleted,
  getCourseCompletionRate,
  fetchCourseProgress,
  toggleVideoCompletion
} = useProgress()

const courseId = route.params.id
const course = computed(() => courseStore.currentCourse)
const selectedVideo = ref(null)

const completionRate = computed(() => {
  if (!course.value?.videos) return 0
  return getCourseCompletionRate.value(courseId, course.value.videos)
})

async function handleToggleProgress(videoId) {
  if (!authStore.isAuthenticated) {
    alert('ログインが必要です')
    return
  }

  try {
    await toggleVideoCompletion(videoId)
  } catch (err) {
    console.error('Failed to toggle progress:', err)
  }
}

async function handleVideoEnded() {
  // 動画終了時に自動的に完了としてマーク
  if (selectedVideo.value && authStore.isAuthenticated) {
    try {
      await toggleVideoCompletion(selectedVideo.value.id)
    } catch (err) {
      console.error('Failed to mark as completed:', err)
    }
  }

  // 次の動画へ
  const currentIndex = course.value.videos.findIndex(v => v.id === selectedVideo.value.id)
  if (currentIndex < course.value.videos.length - 1) {
    selectedVideo.value = course.value.videos[currentIndex + 1]
  }
}

onMounted(async () => {
  await courseStore.fetchCourse(courseId)

  if (authStore.isAuthenticated) {
    await fetchCourseProgress(courseId)
  }

  if (course.value?.videos?.length > 0) {
    selectedVideo.value = course.value.videos[0]
  }
})
</script>

<template>
  <!-- ... 既存のコード -->

  <!-- 進捗率表示 -->
  <div v-if="authStore.isAuthenticated" class="mb-6">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium">コース進捗</span>
      <span class="text-sm text-base-content/60">{{ completionRate }}%</span>
    </div>
    <progress
      class="progress progress-primary w-full"
      :value="completionRate"
      max="100"
    ></progress>
  </div>

  <!-- 動画リスト（チェックボックス付き） -->
  <div
    v-for="(video, index) in course.videos"
    :key="video.id"
    class="card bg-base-200 hover:bg-base-300 transition-colors"
    :class="{ 'ring-2 ring-primary': selectedVideo?.id === video.id }"
  >
    <div class="card-body p-4">
      <div class="flex items-center gap-4">
        <!-- チェックボックス -->
        <input
          v-if="authStore.isAuthenticated"
          type="checkbox"
          :checked="isVideoCompleted(video.id)"
          @click.stop="handleToggleProgress(video.id)"
          class="checkbox checkbox-primary"
        />

        <!-- 動画番号 -->
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold">
          {{ index + 1 }}
        </div>

        <!-- 動画情報 -->
        <div class="flex-1 cursor-pointer" @click="selectVideo(video)">
          <h4 class="font-medium flex items-center gap-2">
            {{ video.title_ja }}
            <svg
              v-if="isVideoCompleted(video.id)"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="w-5 h-5 text-success"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
            </svg>
          </h4>
          <p class="text-sm text-base-content/60 line-clamp-1">
            {{ video.description_ja }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 実装ファイル

- `frontend/src/api/progress.js` (新規作成)
- `frontend/src/stores/progress.js` (新規作成)
- `frontend/src/composables/useProgress.js` (新規作成)
- `frontend/src/views/CourseDetailView.vue` (更新)

## 検証方法

```bash
npm run dev
# ログイン後、コース詳細ページで動画のチェックボックスをクリック
```

以下を確認:
- [ ] 視聴進捗が保存される
- [ ] チェックボックスが正しく表示される
- [ ] 進捗率が正しく計算される
- [ ] 動画終了時に自動的に完了マークされる
- [ ] ページをリロードしても進捗が保持される
- [ ] 未ログイン時はチェックボックスが表示されない

## 完了条件

- [ ] Progress API クライアントが実装されている
- [ ] Progress ストアが実装されている
- [ ] チェックボックスで進捗を更新できる
- [ ] 進捗率が表示される
- [ ] 動画終了時に自動完了する

## 備考

### UX改善

- 動画終了時の自動完了
- 進捗率の可視化
- 完了アイコンの表示

### パフォーマンス

- 進捗はMap形式で管理（O(1)アクセス）
- 不要なAPI呼び出しを避ける

### 今後の拡張

- 最後に視聴した動画を記憶
- 視聴時間の記録
- 学習統計の表示
