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
  // State
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

  // Actions
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

  function clearComments() {
    comments.value = []
    error.value = null
  }

  return {
    // State
    comments,
    commentTree,
    loading,
    error,

    // Actions
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    replyToComment,
    clearComments
  }
})
