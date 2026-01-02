import client from './client'

/**
 * ユーザーの全進捗を取得
 * @returns {Promise<array>} 視聴進捗リスト
 */
export async function getUserProgress() {
  const response = await client.get('/progress')
  return response.data
}

/**
 * 特定コースの視聴進捗を取得
 * @param {string} courseId - コースID
 * @returns {Promise<object>} コース進捗詳細
 */
export async function getCourseProgress(courseId) {
  const response = await client.get(`/progress/courses/${courseId}`)
  return response.data
}

/**
 * 動画の視聴進捗を更新
 * @param {string} videoId - 動画ID
 * @param {boolean} isCompleted - 完了フラグ
 * @returns {Promise<object>} 更新された進捗
 */
export async function updateVideoProgress(videoId, isCompleted) {
  const response = await client.post(`/progress/videos/${videoId}`, {
    is_completed: isCompleted
  })
  return response.data
}

/**
 * 動画の視聴進捗を削除
 * @param {string} videoId - 動画ID
 * @returns {Promise<void>}
 */
export async function deleteVideoProgress(videoId) {
  await client.delete(`/progress/videos/${videoId}`)
}
