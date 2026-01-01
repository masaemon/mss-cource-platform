<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment'
import { useProgress } from '@/composables/useProgress'
import VideoPlayer from '@/components/course/VideoPlayer.vue'
import CommentForm from '@/components/course/CommentForm.vue'
import CommentList from '@/components/course/CommentList.vue'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const authStore = useAuthStore()
const commentStore = useCommentStore()
const {
  isVideoCompleted,
  getCourseCompletionRate,
  getCourseCompletedCount,
  fetchCourseProgress,
  toggleVideoCompletion,
  markVideoAsCompleted
} = useProgress()

const courseId = route.params.id
const loading = ref(true)
const error = ref(null)
const selectedVideo = ref(null)

const course = computed(() => courseStore.currentCourse)

const isInstructor = computed(() =>
  authStore.isInstructor &&
  course.value?.instructor_id === authStore.user?.id
)

const thumbnailUrl = computed(() =>
  course.value?.thumbnail_url || '/images/default-course.png'
)

const videoCount = computed(() =>
  course.value?.videos?.length || 0
)

const completionRate = computed(() =>
  getCourseCompletionRate.value(course.value?.videos || [])
)

const completedCount = computed(() =>
  getCourseCompletedCount.value(course.value?.videos || [])
)

function selectVideo(video) {
  selectedVideo.value = video
}

async function handleVideoEnded() {
  // 現在の動画を完了としてマーク
  if (selectedVideo.value && authStore.isAuthenticated) {
    try {
      await markVideoAsCompleted(selectedVideo.value.id)
    } catch (err) {
      console.error('Failed to mark video as completed:', err)
    }
  }

  // 次の動画を自動再生
  const currentIndex = course.value.videos.findIndex(v => v.id === selectedVideo.value.id)
  if (currentIndex < course.value.videos.length - 1) {
    selectedVideo.value = course.value.videos[currentIndex + 1]
  }
}

async function handleToggleProgress(videoId) {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  try {
    await toggleVideoCompletion(videoId)
  } catch (err) {
    console.error('Failed to toggle video completion:', err)
  }
}

onMounted(async () => {
  try {
    await courseStore.fetchCourse(courseId)
    // 最初の動画を選択
    if (course.value?.videos?.length > 0) {
      selectedVideo.value = course.value.videos[0]
    }

    // 認証済みユーザーの場合、進捗を取得
    if (authStore.isAuthenticated) {
      await fetchCourseProgress(courseId)
    }

    // コメント取得
    await commentStore.fetchComments(courseId)
  } catch (err) {
    error.value = err.response?.data?.detail || 'コースの取得に失敗しました'
  } finally {
    loading.value = false
  }
})

function goToEditCourse() {
  router.push(`/instructor/courses/${courseId}/edit`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- ローディング -->
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- エラー -->
    <div v-else-if="error" class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- コース詳細 -->
    <div v-else-if="course">
      <!-- ヘッダー -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="breadcrumbs text-sm mb-2">
            <ul>
              <li><router-link to="/">ホーム</router-link></li>
              <li>{{ course.title_ja }}</li>
            </ul>
          </div>
          <h1 class="text-4xl font-bold">{{ course.title_ja }}</h1>
        </div>

        <!-- 講師用編集ボタン -->
        <button
          v-if="isInstructor"
          @click="goToEditCourse"
          class="btn btn-outline btn-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          編集
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- メインコンテンツ -->
        <div class="lg:col-span-2">
          <!-- 動画プレイヤー（動画が選択されている場合） -->
          <div v-if="selectedVideo" class="mb-6">
            <VideoPlayer
              :video="selectedVideo"
              @ended="handleVideoEnded"
            />
          </div>

          <!-- サムネイル（動画が選択されていない場合） -->
          <figure v-else class="aspect-video mb-6 rounded-lg overflow-hidden">
            <img
              :src="thumbnailUrl"
              :alt="course.title_ja"
              class="w-full h-full object-cover"
            />
          </figure>

          <!-- タブ -->
          <div role="tablist" class="tabs tabs-lifted">
            <input
              type="radio"
              name="course_tabs"
              role="tab"
              class="tab"
              aria-label="概要"
              checked
            />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <h2 class="text-2xl font-bold mb-4">コース概要</h2>
              <p class="text-base-content/80 whitespace-pre-wrap">
                {{ course.description_ja }}
              </p>

              <!-- カテゴリー -->
              <div class="mt-6">
                <h3 class="text-lg font-semibold mb-2">カテゴリー</h3>
                <div class="badge badge-primary">
                  {{ course.category?.name_ja }}
                </div>
              </div>

              <!-- 統計 -->
              <div class="stats shadow mt-6 w-full">
                <div class="stat">
                  <div class="stat-title">動画数</div>
                  <div class="stat-value text-primary">{{ videoCount }}</div>
                  <div class="stat-desc">本のレッスン</div>
                </div>

                <div class="stat">
                  <div class="stat-title">公開状態</div>
                  <div class="stat-value text-sm">
                    {{ course.is_published ? '公開中' : '非公開' }}
                  </div>
                </div>

                <div v-if="authStore.isAuthenticated" class="stat">
                  <div class="stat-title">進捗</div>
                  <div class="stat-value text-sm">
                    {{ completionRate }}%
                  </div>
                  <div class="stat-desc">{{ completedCount }} / {{ videoCount }} 完了</div>
                </div>
              </div>

              <!-- 進捗バー -->
              <div v-if="authStore.isAuthenticated" class="mt-6">
                <h3 class="text-lg font-semibold mb-2">コース進捗</h3>
                <div class="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                  <div
                    class="bg-primary h-full transition-all duration-300 flex items-center justify-center text-xs text-primary-content font-semibold"
                    :style="{ width: `${completionRate}%` }"
                  >
                    <span v-if="completionRate >= 15">{{ completionRate }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <input
              type="radio"
              name="course_tabs"
              role="tab"
              class="tab"
              aria-label="動画"
            />
            <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
              <h2 class="text-2xl font-bold mb-4">レッスン動画</h2>

              <!-- 動画リスト -->
              <div v-if="course.videos && course.videos.length > 0" class="space-y-3">
                <div
                  v-for="(video, index) in course.videos"
                  :key="video.id"
                  class="card bg-base-200 hover:bg-base-300 transition-colors"
                  :class="{ 'ring-2 ring-primary': selectedVideo?.id === video.id }"
                >
                  <div class="card-body p-4">
                    <div class="flex items-center gap-4">
                      <!-- 動画番号または完了アイコン -->
                      <div
                        class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold cursor-pointer"
                        :class="isVideoCompleted(video.id) ? 'bg-success text-success-content' : 'bg-primary text-primary-content'"
                        @click="selectVideo(video)"
                      >
                        <svg v-if="isVideoCompleted(video.id)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span v-else>{{ index + 1 }}</span>
                      </div>

                      <!-- 動画情報 -->
                      <div class="flex-1 cursor-pointer" @click="selectVideo(video)">
                        <h4 class="font-medium" :class="{ 'line-through text-base-content/60': isVideoCompleted(video.id) }">
                          {{ video.title_ja }}
                        </h4>
                        <p class="text-sm text-base-content/60 line-clamp-1">
                          {{ video.description_ja }}
                        </p>
                      </div>

                      <!-- 進捗チェックボックス -->
                      <div v-if="authStore.isAuthenticated" class="flex-shrink-0">
                        <input
                          type="checkbox"
                          :checked="isVideoCompleted(video.id)"
                          @click.stop="handleToggleProgress(video.id)"
                          class="checkbox checkbox-primary"
                        />
                      </div>

                      <!-- 再生アイコン -->
                      <div class="flex-shrink-0 cursor-pointer" @click="selectVideo(video)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 動画なし -->
              <div v-else class="text-center py-8 text-base-content/60">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                </svg>
                <p>動画がまだ追加されていません</p>
              </div>
            </div>
          </div>
        </div>

        <!-- サイドバー -->
        <div class="lg:col-span-1">
          <!-- 講師情報カード -->
          <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
              <h3 class="card-title text-lg mb-4">講師</h3>

              <div class="flex items-center gap-3 mb-4">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-12">
                    <span class="text-lg">
                      {{ course.instructor?.display_name?.[0] || '?' }}
                    </span>
                  </div>
                </div>
                <div>
                  <p class="font-semibold">
                    {{ course.instructor?.display_name || '講師名不明' }}
                  </p>
                  <p class="text-sm text-base-content/60">
                    {{ course.instructor?.email }}
                  </p>
                </div>
              </div>

              <div v-if="course.instructor?.bio" class="divider my-2"></div>

              <p v-if="course.instructor?.bio" class="text-sm text-base-content/70">
                {{ course.instructor.bio }}
              </p>
            </div>
          </div>

          <!-- アクションカード -->
          <div class="card bg-primary text-primary-content shadow-xl">
            <div class="card-body">
              <h3 class="card-title">学習を始めましょう</h3>
              <p class="text-sm opacity-80">
                {{ videoCount }}本の動画で構成されています
              </p>
              <div class="card-actions justify-end mt-4">
                <button class="btn btn-secondary w-full">
                  最初の動画を見る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- コメントセクション -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold mb-6">コメント</h2>

        <div class="space-y-6">
          <CommentForm :course-id="courseId" />
          <CommentList :course-id="courseId" />
        </div>
      </div>
    </div>
  </div>
</template>
