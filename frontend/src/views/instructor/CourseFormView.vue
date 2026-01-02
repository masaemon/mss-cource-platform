<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/course'
import { useToast } from '@/composables/useToast'
import { getCategories } from '@/api/categories'
import { toggleCoursePublish } from '@/api/courses'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const { success, error: showError } = useToast()

const courseId = route.params.id
const isEditMode = computed(() => !!courseId)

const formData = ref({
  title_ja: '',
  title_en: '',
  description_ja: '',
  description_en: '',
  category_id: '',
  thumbnail_url: '',
  is_published: false
})

const categories = ref([])
const loading = ref(false)
const submitting = ref(false)

onMounted(async () => {
  // カテゴリー取得
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }

  // 編集モードの場合、既存データを取得
  if (isEditMode.value) {
    loading.value = true
    try {
      const course = await courseStore.fetchCourse(courseId)
      formData.value = {
        title_ja: course.title_ja,
        title_en: course.title_en || '',
        description_ja: course.description_ja,
        description_en: course.description_en || '',
        category_id: course.category_id,
        thumbnail_url: course.thumbnail_url || '',
        is_published: course.is_published
      }
    } catch (err) {
      showError('コースの取得に失敗しました')
      console.error('Failed to fetch course:', err)
    } finally {
      loading.value = false
    }
  }
})

async function handleSubmit() {
  submitting.value = true

  try {
    if (isEditMode.value) {
      await courseStore.updateCourse(courseId, formData.value)
      success('コースを更新しました')
    } else {
      console.log('Creating course with data:', formData.value)
      const newCourse = await courseStore.createCourse(formData.value)
      console.log('Course created successfully:', newCourse)

      if (!newCourse || !newCourse.id) {
        console.error('Invalid course response:', newCourse)
        throw new Error('コース作成のレスポンスが不正です')
      }

      success('コースを作成しました。動画を追加するには、ダッシュボードから編集してください。')
      console.log('Redirecting to dashboard')

      // ダッシュボードにリダイレクト（シンプルで確実）
      setTimeout(() => {
        router.push('/instructor/dashboard')
      }, 1500)
      return
    }
  } catch (err) {
    console.error('Failed to save course - Full error:', err)
    console.error('Error response:', err.response)
    console.error('Error message:', err.message)
    showError(isEditMode.value ? 'コースの更新に失敗しました' : 'コースの作成に失敗しました')
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!confirm('本当にこのコースを削除しますか？この操作は取り消せません。')) {
    return
  }

  try {
    await courseStore.deleteCourse(courseId)
    success('コースを削除しました')
    router.push('/instructor/dashboard')
  } catch (err) {
    showError('コースの削除に失敗しました')
    console.error('Failed to delete course:', err)
  }
}

async function handleTogglePublish() {
  const newPublishState = !formData.value.is_published
  const action = newPublishState ? '公開' : '非公開'

  if (!confirm(`このコースを${action}にしますか？`)) {
    return
  }

  try {
    await toggleCoursePublish(courseId, newPublishState)
    formData.value.is_published = newPublishState
    success(`コースを${action}にしました`)
  } catch (err) {
    showError(`コースの${action}化に失敗しました`)
    console.error('Failed to toggle publish:', err)
  }
}

function goToManageVideos() {
  router.push(`/instructor/courses/${courseId}/videos`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-4xl font-bold mb-8">
      {{ isEditMode ? 'コース編集' : '新規コース作成' }}
    </h1>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 日本語タイトル -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">タイトル（日本語）*</span>
        </label>
        <input
          v-model="formData.title_ja"
          type="text"
          class="input input-bordered"
          placeholder="プログラミング入門コース"
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
          class="input input-bordered"
          placeholder="Introduction to Programming"
        />
      </div>

      <!-- カテゴリー -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">カテゴリー*</span>
        </label>
        <select
          v-model="formData.category_id"
          class="select select-bordered"
          required
        >
          <option value="">カテゴリーを選択</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name_ja }}
          </option>
        </select>
      </div>

      <!-- 日本語説明 -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">説明（日本語）*</span>
        </label>
        <textarea
          v-model="formData.description_ja"
          class="textarea textarea-bordered h-32"
          placeholder="このコースでは..."
          required
        ></textarea>
      </div>

      <!-- 英語説明 -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">説明（英語）</span>
        </label>
        <textarea
          v-model="formData.description_en"
          class="textarea textarea-bordered h-32"
          placeholder="In this course..."
        ></textarea>
      </div>

      <!-- サムネイル -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-semibold">サムネイル画像URL</span>
          <span class="label-text-alt">任意</span>
        </label>
        <input
          v-model="formData.thumbnail_url"
          type="url"
          class="input input-bordered"
          placeholder="https://example.com/image.jpg"
        />
        <label class="label">
          <span class="label-text-alt">画像のURLを入力してください</span>
        </label>
      </div>

      <!-- 公開設定 -->
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-4">
          <input
            v-model="formData.is_published"
            type="checkbox"
            class="toggle toggle-primary"
          />
          <div>
            <span class="label-text font-semibold">公開する</span>
            <p class="text-sm text-base-content/60">
              公開すると、すべてのユーザーがコースを閲覧できます
            </p>
          </div>
        </label>
      </div>

      <div class="divider"></div>

      <!-- 動画管理ボタン（編集モード時のみ） -->
      <div v-if="isEditMode" class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>コースの動画を追加・編集するには、動画管理ページへ移動してください</span>
        <button @click="goToManageVideos" class="btn btn-sm btn-primary">
          動画を管理
        </button>
      </div>

      <!-- ボタン -->
      <div class="flex gap-4 justify-between mt-6">
        <div class="flex gap-2">
          <!-- 公開/非公開切り替えボタン（編集モードのみ） -->
          <button
            v-if="isEditMode"
            type="button"
            @click="handleTogglePublish"
            class="btn"
            :class="formData.is_published ? 'btn-warning btn-outline' : 'btn-success'"
          >
            <svg v-if="formData.is_published" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ formData.is_published ? '非公開にする' : '公開する' }}
          </button>

          <!-- 削除ボタン（編集モードのみ） -->
          <button
            v-if="isEditMode"
            type="button"
            @click="handleDelete"
            class="btn btn-error btn-outline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            コースを削除
          </button>
        </div>

        <div class="flex gap-4 ml-auto">
          <button
            type="button"
            @click="router.back()"
            class="btn btn-ghost"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :class="{ 'loading': submitting }"
            :disabled="submitting"
          >
            {{ isEditMode ? '更新' : '作成' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
