<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment'
import { timeAgo } from '@/utils/date'
import CommentReplyForm from './CommentReplyForm.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true
  },
  courseId: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()
const commentStore = useCommentStore()

const isEditing = ref(false)
const editContent = ref(props.comment.content)
const showReplyForm = ref(false)

const isOwner = computed(() =>
  authStore.user?.id === props.comment.user_id
)

const isInstructor = computed(() =>
  authStore.isInstructor
)

const displayTimeAgo = computed(() =>
  timeAgo(props.comment.created_at)
)

async function handleUpdate() {
  try {
    await commentStore.updateComment(props.comment.id, editContent.value)
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update comment:', err)
  }
}

async function handleDelete() {
  if (!confirm('このコメントを削除しますか？')) return

  try {
    await commentStore.deleteComment(props.comment.id)
  } catch (err) {
    console.error('Failed to delete comment:', err)
  }
}

function cancelEdit() {
  isEditing.value = false
  editContent.value = props.comment.content
}
</script>

<template>
  <div class="comment-item">
    <div class="flex gap-3">
      <!-- アバター -->
      <div class="avatar placeholder">
        <div class="bg-neutral text-neutral-content rounded-full w-10">
          <span class="text-sm">{{ comment.user?.display_name?.[0] || '?' }}</span>
        </div>
      </div>

      <!-- コメント本体 -->
      <div class="flex-1">
        <div class="bg-base-200 rounded-lg p-3">
          <!-- ヘッダー -->
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="font-semibold">{{ comment.user?.display_name || '匿名' }}</span>
              <span v-if="comment.is_instructor_reply" class="badge badge-primary badge-sm ml-2">
                講師
              </span>
              <div class="text-xs text-base-content/60">{{ displayTimeAgo }}</div>
            </div>

            <!-- アクションメニュー -->
            <div v-if="isOwner" class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-xs">
                •••
              </label>
              <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                <li><a @click="isEditing = true">編集</a></li>
                <li><a @click="handleDelete" class="text-error">削除</a></li>
              </ul>
            </div>
          </div>

          <!-- コンテンツ -->
          <div v-if="!isEditing" class="whitespace-pre-wrap">
            {{ comment.content }}
          </div>

          <!-- 編集フォーム -->
          <div v-else class="space-y-2">
            <textarea
              v-model="editContent"
              class="textarea textarea-bordered w-full"
              rows="3"
            ></textarea>
            <div class="flex gap-2 justify-end">
              <button @click="cancelEdit" class="btn btn-sm btn-ghost">
                キャンセル
              </button>
              <button @click="handleUpdate" class="btn btn-sm btn-primary">
                更新
              </button>
            </div>
          </div>
        </div>

        <!-- 返信ボタン -->
        <button
          v-if="isInstructor && !comment.parent_id"
          @click="showReplyForm = !showReplyForm"
          class="btn btn-ghost btn-xs mt-2"
        >
          返信
        </button>

        <!-- 返信フォーム -->
        <CommentReplyForm
          v-if="showReplyForm"
          :course-id="courseId"
          :parent-id="comment.id"
          @reply="showReplyForm = false"
          @cancel="showReplyForm = false"
        />

        <!-- 返信一覧 -->
        <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 space-y-3">
          <CommentItem
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :course-id="courseId"
          />
        </div>
      </div>
    </div>
  </div>
</template>
