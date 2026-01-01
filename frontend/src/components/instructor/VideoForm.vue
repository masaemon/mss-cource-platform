<script setup>
import { ref, watch } from 'vue'
import { extractYouTubeVideoId } from '@/utils/youtube'

const props = defineProps({
  video: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = ref({
  title_ja: '',
  title_en: '',
  description_ja: '',
  description_en: '',
  youtube_url: '',
  youtube_video_id: '',
  order_number: 1
})

// 既存動画データがあれば設定
watch(() => props.video, (newVideo) => {
  if (newVideo) {
    formData.value = {
      title_ja: newVideo.title_ja || '',
      title_en: newVideo.title_en || '',
      description_ja: newVideo.description_ja || '',
      description_en: newVideo.description_en || '',
      youtube_url: newVideo.youtube_url || '',
      youtube_video_id: newVideo.youtube_video_id || '',
      order_number: newVideo.order_number || 1
    }
  }
}, { immediate: true })

// YouTube URLから動画IDを抽出
watch(() => formData.value.youtube_url, (newUrl) => {
  if (newUrl) {
    const videoId = extractYouTubeVideoId(newUrl)
    if (videoId) {
      formData.value.youtube_video_id = videoId
    }
  }
})

function handleSubmit() {
  emit('submit', formData.value)
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h3 class="card-title">{{ video ? '動画編集' : '動画追加' }}</h3>

      <form @submit.prevent="handleSubmit" class="space-y-4 mt-4">
        <!-- 日本語タイトル -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">タイトル（日本語）*</span>
          </label>
          <input
            v-model="formData.title_ja"
            type="text"
            class="input input-bordered input-sm"
            placeholder="レッスン1: プログラミングの基礎"
            required
          />
        </div>

        <!-- 英語タイトル -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">タイトル（英語）</span>
          </label>
          <input
            v-model="formData.title_en"
            type="text"
            class="input input-bordered input-sm"
            placeholder="Lesson 1: Programming Basics"
          />
        </div>

        <!-- YouTube URL -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">YouTube URL*</span>
          </label>
          <input
            v-model="formData.youtube_url"
            type="url"
            class="input input-bordered input-sm"
            placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
            required
          />
          <label class="label">
            <span class="label-text-alt">
              {{ formData.youtube_video_id ? `動画ID: ${formData.youtube_video_id}` : 'YouTube動画のURLを入力してください' }}
            </span>
          </label>
        </div>

        <!-- 日本語説明 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">説明（日本語）</span>
          </label>
          <textarea
            v-model="formData.description_ja"
            class="textarea textarea-bordered textarea-sm h-20"
            placeholder="このレッスンでは..."
          ></textarea>
        </div>

        <!-- 英語説明 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">説明（英語）</span>
          </label>
          <textarea
            v-model="formData.description_en"
            class="textarea textarea-bordered textarea-sm h-20"
            placeholder="In this lesson..."
          ></textarea>
        </div>

        <!-- 順序番号 -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">表示順序</span>
          </label>
          <input
            v-model.number="formData.order_number"
            type="number"
            min="1"
            class="input input-bordered input-sm w-32"
          />
        </div>

        <!-- ボタン -->
        <div class="flex gap-2 justify-end">
          <button
            type="button"
            @click="handleCancel"
            class="btn btn-ghost btn-sm"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-sm"
          >
            {{ video ? '更新' : '追加' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
