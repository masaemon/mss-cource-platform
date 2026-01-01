# FE-019~022: コメント機能実装

## FE-019: コメントAPI・ストア実装

### 概要
コメント機能のAPIクライアントとPiniaストアを実装します。

### 優先度: Medium
### 推定時間: 2時間
### 依存関係: FE-006

### 実装内容

#### comments.js API

`src/api/comments.js`:

```javascript
import client from './client'

/**
 * コースのコメント一覧取得
 */
export async function getCourseComments(courseId) {
  const response = await client.get(`/courses/${courseId}/comments`)
  return response.data
}

/**
 * コメント投稿
 */
export async function createComment(courseId, content) {
  const response = await client.post(`/courses/${courseId}/comments`, {
    content
  })
  return response.data
}

/**
 * コメント更新
 */
export async function updateComment(commentId, content) {
  const response = await client.put(`/comments/${commentId}`, {
    content
  })
  return response.data
}

/**
 * コメント削除
 */
export async function deleteComment(commentId) {
  await client.delete(`/comments/${commentId}`)
}

/**
 * 講師の返信投稿
 */
export async function replyToComment(courseId, parentId, content) {
  const response = await client.post(`/courses/${courseId}/comments`, {
    content,
    parent_id: parentId,
    is_instructor_reply: true
  })
  return response.data
}
```

#### comment.js Store

`src/stores/comment.js`:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCourseComments as apiGetComments,
  createComment as apiCreateComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
  replyToComment as apiReplyToComment
} from '@/api/comments'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // ツリー構造に変換
  const commentTree = computed(() => {
    const tree = []
    const commentMap = {}

    // まずすべてのコメントをMapに格納
    comments.value.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] }
    })

    // 親子関係を構築
    Object.values(commentMap).forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap[comment.parent_id]
        if (parent) {
          parent.replies.push(comment)
        }
      } else {
        tree.push(comment)
      }
    })

    return tree
  })

  async function fetchComments(courseId) {
    loading.value = true
    error.value = null

    try {
      comments.value = await apiGetComments(courseId)
      return comments.value
    } catch (err) {
      error.value = err.response?.data?.detail || 'コメントの取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createComment(courseId, content) {
    loading.value = true
    error.value = null

    try {
      const newComment = await apiCreateComment(courseId, content)
      comments.value.unshift(newComment)
      return newComment
    } catch (err) {
      error.value = err.response?.data?.detail || 'コメントの投稿に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateComment(commentId, content) {
    loading.value = true
    error.value = null

    try {
      const updated = await apiUpdateComment(commentId, content)

      const index = comments.value.findIndex(c => c.id === commentId)
      if (index !== -1) {
        comments.value[index] = updated
      }

      return updated
    } catch (err) {
      error.value = err.response?.data?.detail || 'コメントの更新に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteComment(commentId) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteComment(commentId)
      comments.value = comments.value.filter(c => c.id !== commentId)
    } catch (err) {
      error.value = err.response?.data?.detail || 'コメントの削除に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function replyToComment(courseId, parentId, content) {
    loading.value = true
    error.value = null

    try {
      const reply = await apiReplyToComment(courseId, parentId, content)
      comments.value.push(reply)
      return reply
    } catch (err) {
      error.value = err.response?.data?.detail || '返信の投稿に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    comments,
    commentTree,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    replyToComment
  }
})
```

---

## FE-020: コメント表示コンポーネント

### 概要
コメント一覧とツリー表示のコンポーネントを実装します。

### 優先度: Medium
### 推定時間: 2時間

### 実装内容

#### CommentItem.vue

`src/components/course/CommentItem.vue`:

```vue
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

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

const timeAgo = computed(() =>
  formatDistanceToNow(new Date(props.comment.created_at), {
    addSuffix: true,
    locale: ja
  })
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
              <div class="text-xs text-base-content/60">{{ timeAgo }}</div>
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
```

#### CommentList.vue

`src/components/course/CommentList.vue`:

```vue
<script setup>
import { computed } from 'vue'
import { useCommentStore } from '@/stores/comment'
import CommentItem from './CommentItem.vue'

defineProps({
  courseId: {
    type: String,
    required: true
  }
})

const commentStore = useCommentStore()

const comments = computed(() => commentStore.commentTree)
const loading = computed(() => commentStore.loading)
</script>

<template>
  <div class="comment-list">
    <!-- ローディング -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-md"></span>
    </div>

    <!-- コメント一覧 -->
    <div v-else-if="comments.length > 0" class="space-y-4">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :course-id="courseId"
      />
    </div>

    <!-- 空の状態 -->
    <div v-else class="text-center py-8 text-base-content/60">
      まだコメントがありません
    </div>
  </div>
</template>
```

---

## FE-021: コメント投稿フォーム

### 概要
コメント投稿フォームを実装します。

### 優先度: Medium
### 推定時間: 1.5時間

### 実装内容

#### CommentForm.vue

`src/components/course/CommentForm.vue`:

```vue
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
```

---

## FE-022: 講師返信機能

### 概要
講師がコメントに返信できる機能を実装します。

### 優先度: Medium
### 推定時間: 1時間

### 実装内容

#### CommentReplyForm.vue

`src/components/course/CommentReplyForm.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { useCommentStore } from '@/stores/comment'

const props = defineProps({
  courseId: String,
  parentId: String
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
```

### CourseDetailView.vue 更新

```vue
<script setup>
import { onMounted } from 'vue'
import { useCommentStore } from '@/stores/comment'
import CommentForm from '@/components/course/CommentForm.vue'
import CommentList from '@/components/course/CommentList.vue'

const commentStore = useCommentStore()

onMounted(async () => {
  await courseStore.fetchCourse(courseId)
  await commentStore.fetchComments(courseId)
})
</script>

<template>
  <!-- コメントセクション -->
  <div class="mt-12">
    <h2 class="text-2xl font-bold mb-6">コメント</h2>

    <div class="space-y-6">
      <CommentForm :course-id="courseId" />
      <CommentList :course-id="courseId" />
    </div>
  </div>
</template>
```

## 実装ファイル

### FE-019
- `frontend/src/api/comments.js` (新規作成)
- `frontend/src/stores/comment.js` (新規作成)

### FE-020
- `frontend/src/components/course/CommentItem.vue` (新規作成)
- `frontend/src/components/course/CommentList.vue` (新規作成)

### FE-021
- `frontend/src/components/course/CommentForm.vue` (新規作成)

### FE-022
- `frontend/src/components/course/CommentReplyForm.vue` (新規作成)
- `frontend/src/views/CourseDetailView.vue` (更新)

## 検証方法

### FE-019
- [ ] コメントAPI が動作する
- [ ] コメントストアが動作する
- [ ] ツリー構造が正しく構築される

### FE-020
- [ ] コメント一覧が表示される
- [ ] ツリー表示が正しく動作する
- [ ] 時間表示が正しい

### FE-021
- [ ] コメントを投稿できる
- [ ] 未ログイン時の処理が正しい
- [ ] バリデーションが動作する

### FE-022
- [ ] 講師が返信できる
- [ ] 返信が正しくツリー表示される
- [ ] 講師バッジが表示される

## 完了条件

- [ ] コメントAPI・ストアが実装されている
- [ ] コメント表示が実装されている
- [ ] コメント投稿が実装されている
- [ ] 講師返信が実装されている
- [ ] ツリー表示が動作する
