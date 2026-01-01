<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useToast } from '@/composables/useToast'
import { createVideo, updateVideo, deleteVideo, updateVideoOrder } from '@/api/videos'
import VideoForm from '@/components/instructor/VideoForm.vue'
import draggable from 'vuedraggable'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const { success, error: showError } = useToast()

const courseId = route.params.id
const course = ref(null)
const videos = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingVideo = ref(null)
const isDragging = ref(false)

onMounted(async () => {
  try {
    course.value = await courseStore.fetchCourse(courseId)
    videos.value = course.value.videos || []
  } catch (err) {
    showError('コースの取得に失敗しました')
    console.error('Failed to fetch course:', err)
  } finally {
    loading.value = false
  }
})

function openAddForm() {
  editingVideo.value = null
  showForm.value = true
}

function openEditForm(video) {
  editingVideo.value = video
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingVideo.value = null
}

async function handleSubmit(formData) {
  try {
    if (editingVideo.value) {
      // 更新
      const updated = await updateVideo(editingVideo.value.id, formData)
      const index = videos.value.findIndex(v => v.id === editingVideo.value.id)
      if (index !== -1) {
        videos.value[index] = updated
      }
      success('動画を更新しました')
    } else {
      // 新規作成
      const newVideo = await createVideo(courseId, formData)
      videos.value.push(newVideo)
      success('動画を追加しました')
    }
    closeForm()
  } catch (err) {
    showError(editingVideo.value ? '動画の更新に失敗しました' : '動画の追加に失敗しました')
    console.error('Failed to save video:', err)
  }
}

async function handleDelete(video) {
  if (!confirm(`「${video.title_ja}」を削除しますか？この操作は取り消せません。`)) {
    return
  }

  try {
    await deleteVideo(video.id)
    videos.value = videos.value.filter(v => v.id !== video.id)
    success('動画を削除しました')
  } catch (err) {
    showError('動画の削除に失敗しました')
    console.error('Failed to delete video:', err)
  }
}

function goToEditCourse() {
  router.push(`/instructor/courses/${courseId}/edit`)
}

async function handleOrderChange() {
  // 順序番号を更新
  videos.value.forEach((video, index) => {
    video.order_number = index + 1
  })

  // サーバーに順序を保存
  try {
    const videoIds = videos.value.map(v => v.id)
    await updateVideoOrder(courseId, videoIds)
    success('動画の順序を更新しました')
  } catch (err) {
    showError('順序の更新に失敗しました')
    console.error('Failed to update order:', err)
    // エラー時は再読み込み
    const freshCourse = await courseStore.fetchCourse(courseId)
    videos.value = freshCourse.videos || []
  }
}

function onDragStart() {
  isDragging.value = true
}

function onDragEnd() {
  isDragging.value = false
  handleOrderChange()
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- ヘッダー -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <button @click="goToEditCourse" class="btn btn-ghost btn-sm mb-2">
          ← コース編集に戻る
        </button>
        <h1 class="text-4xl font-bold">動画管理</h1>
        <p v-if="course" class="text-base-content/60 mt-2">{{ course.title_ja }}</p>
      </div>
      <button @click="openAddForm" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        動画を追加
      </button>
    </div>

    <!-- 動画追加/編集フォーム -->
    <div v-if="showForm" class="mb-8">
      <VideoForm
        :video="editingVideo"
        @submit="handleSubmit"
        @cancel="closeForm"
      />
    </div>

    <!-- ローディング -->
    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- 動画一覧 -->
    <div v-else-if="videos.length > 0">
      <div class="alert alert-info mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>動画をドラッグ&ドロップして順序を変更できます</span>
      </div>

      <draggable
        v-model="videos"
        @start="onDragStart"
        @end="onDragEnd"
        item-key="id"
        class="space-y-4"
        handle=".drag-handle"
      >
        <template #item="{ element: video, index }">
          <div
            class="card bg-base-100 shadow-xl transition-all"
            :class="{ 'opacity-50': isDragging }"
          >
            <div class="card-body">
              <div class="flex items-start gap-4">
                <!-- ドラッグハンドル -->
                <div class="drag-handle cursor-move flex-shrink-0 pt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-base-content/40">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </div>

                <!-- 順序番号 -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                  {{ index + 1 }}
                </div>

                <!-- 動画情報 -->
                <div class="flex-1">
                  <h3 class="font-bold text-lg">{{ video.title_ja }}</h3>
                  <p v-if="video.description_ja" class="text-sm text-base-content/60 mt-1 line-clamp-2">
                    {{ video.description_ja }}
                  </p>
                  <div class="flex gap-4 mt-2 text-sm text-base-content/60">
                    <span>YouTube ID: {{ video.youtube_video_id }}</span>
                  </div>
                </div>

                <!-- アクションボタン -->
                <div class="flex gap-2">
                  <button
                    @click="openEditForm(video)"
                    class="btn btn-outline btn-sm"
                  >
                    編集
                  </button>
                  <button
                    @click="handleDelete(video)"
                    class="btn btn-error btn-outline btn-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 空の状態 -->
    <div v-else class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto mb-4 text-base-content/30">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
      <p class="text-lg mb-4">まだ動画が追加されていません</p>
      <button @click="openAddForm" class="btn btn-primary">
        最初の動画を追加
      </button>
    </div>
  </div>
</template>
