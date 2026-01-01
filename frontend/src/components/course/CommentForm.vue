<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment'
import { useRouter } from 'vue-router'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()
const commentStore = useCommentStore()
const router = useRouter()

const content = ref('')
const submitting = ref(false)

async function handleSubmit() {
  if (!authStore.isAuthenticated) {
    if (confirm('コメントするにはログインが必要です。ログインページに移動しますか？')) {
      router.push('/auth/login')
    }
    return
  }

  if (!content.value.trim()) return

  submitting.value = true

  try {
    await commentStore.createComment(props.courseId, content.value)
    content.value = ''
  } catch (err) {
    console.error('Failed to create comment:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h3 class="card-title text-lg">コメントを投稿</h3>

      <form @submit.prevent="handleSubmit">
        <textarea
          v-model="content"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="コメントを入力..."
          :disabled="!authStore.isAuthenticated || submitting"
        ></textarea>

        <div class="card-actions justify-end mt-4">
          <button
            type="submit"
            class="btn btn-primary"
            :class="{ 'loading': submitting }"
            :disabled="!content.trim() || submitting"
          >
            投稿
          </button>
        </div>
      </form>

      <div v-if="!authStore.isAuthenticated" class="alert alert-info mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>コメントを投稿するには<router-link to="/auth/login" class="link">ログイン</router-link>してください</span>
      </div>
    </div>
  </div>
</template>
