import { storeToRefs } from 'pinia'
import { useProgressStore } from '@/stores/progress'

/**
 * 視聴進捗管理コンポーザブル
 */
export function useProgress() {
  const progressStore = useProgressStore()

  const {
    progressMap,
    loading,
    error,
    isVideoCompleted,
    getVideoProgress,
    getCourseCompletionRate,
    getCourseCompletedCount
  } = storeToRefs(progressStore)

  const {
    fetchUserProgress,
    fetchCourseProgress,
    updateVideoCompletion,
    toggleVideoCompletion,
    markVideoAsCompleted,
    markVideoAsIncomplete,
    deleteProgress,
    clearProgress
  } = progressStore

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
}
