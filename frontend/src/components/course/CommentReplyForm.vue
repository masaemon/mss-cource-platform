<script setup>
import { ref } from 'vue'
import { useCommentStore } from '@/stores/comment'

const props = defineProps({
  courseId: {
    type: String,
    required: true
  },
  parentId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['reply', 'cancel'])

const commentStore = useCommentStore()
const replyContent = ref('')
const submitting = ref(false)

async function handleReply() {
  if (!replyContent.value.trim()) return

  submitting.value = true

  try {
    await commentStore.replyToComment(
      props.courseId,
      props.parentId,
      replyContent.value
    )
    emit('reply')
  } catch (err) {
    console.error('Failed to reply:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="bg-base-100 rounded-lg p-3 mt-2">
    <textarea
      v-model="replyContent"
      class="textarea textarea-bordered w-full"
      rows="2"
      placeholder="返信を入力..."
    ></textarea>
    <div class="flex gap-2 justify-end mt-2">
      <button @click="emit('cancel')" class="btn btn-sm btn-ghost">
        キャンセル
      </button>
      <button
        @click="handleReply"
        class="btn btn-sm btn-primary"
        :disabled="!replyContent.trim() || submitting"
      >
        返信
      </button>
    </div>
  </div>
</template>
