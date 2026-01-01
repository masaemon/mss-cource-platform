import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getUserProgress as apiGetUserProgress,
  getCourseProgress as apiGetCourseProgress,
  updateVideoProgress as apiUpdateVideoProgress,
  deleteVideoProgress as apiDeleteVideoProgress
} from '@/api/progress'

/**
 * 視聴進捗ストア
 */
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

  const getCourseCompletionRate = computed(() => (videos) => {
    if (!videos || videos.length === 0) return 0
    const completedCount = videos.filter(video =>
      isVideoCompleted.value(video.id)
    ).length
    return Math.round((completedCount / videos.length) * 100)
  })

  const getCourseCompletedCount = computed(() => (videos) => {
    if (!videos || videos.length === 0) return 0
    return videos.filter(video => isVideoCompleted.value(video.id)).length
  })

  // Actions
  async function fetchUserProgress(userId) {
    loading.value = true
    error.value = null

    try {
      const progressList = await apiGetUserProgress(userId)
      progressList.forEach(progress => {
        progressMap.value[progress.video_id] = progress
      })
      return progressList
    } catch (err) {
      error.value = err.response?.data?.detail || 'ユーザー進捗の取得に失敗しました'
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
      progressList.forEach(progress => {
        progressMap.value[progress.video_id] = progress
      })
      return progressList
    } catch (err) {
      error.value = err.response?.data?.detail || 'コース進捗の取得に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateVideoCompletion(videoId, isCompleted) {
    try {
      const updatedProgress = await apiUpdateVideoProgress(videoId, isCompleted)
      progressMap.value[videoId] = updatedProgress
      return updatedProgress
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗の更新に失敗しました'
      throw err
    }
  }

  async function toggleVideoCompletion(videoId) {
    const currentProgress = progressMap.value[videoId]
    const newStatus = !currentProgress?.is_completed
    return await updateVideoCompletion(videoId, newStatus)
  }

  async function markVideoAsCompleted(videoId) {
    return await updateVideoCompletion(videoId, true)
  }

  async function markVideoAsIncomplete(videoId) {
    return await updateVideoCompletion(videoId, false)
  }

  async function deleteProgress(videoId) {
    try {
      await apiDeleteVideoProgress(videoId)
      delete progressMap.value[videoId]
    } catch (err) {
      error.value = err.response?.data?.detail || '進捗の削除に失敗しました'
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
    getCourseCompletedCount,

    // Actions
    fetchUserProgress,
    fetchCourseProgress,
    updateVideoCompletion,
    toggleVideoCompletion,
    markVideoAsCompleted,
    markVideoAsIncomplete,
    deleteProgress,
    clearProgress
  }
})
