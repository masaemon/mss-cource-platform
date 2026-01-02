import client from './client'

/**
 * コースの動画一覧取得
 * @param {string} courseId - コースID
 * @returns {Promise<array>} 動画一覧
 */
export async function getCourseVideos(courseId) {
  const response = await client.get(`/videos/courses/${courseId}/videos`)
  return response.data
}

/**
 * 動画詳細取得
 * @param {string} videoId - 動画ID
 * @returns {Promise<object>} 動画詳細
 */
export async function getVideo(videoId) {
  const response = await client.get(`/videos/${videoId}`)
  return response.data
}

/**
 * 動画作成（講師のみ）
 * @param {string} courseId - コースID
 * @param {object} data - 動画データ
 * @returns {Promise<object>} 作成された動画
 */
export async function createVideo(courseId, data) {
  const response = await client.post(`/videos/courses/${courseId}/videos`, data)
  return response.data
}

/**
 * 動画更新（講師のみ）
 * @param {string} videoId - 動画ID
 * @param {object} data - 更新データ
 * @returns {Promise<object>} 更新された動画
 */
export async function updateVideo(videoId, data) {
  const response = await client.put(`/videos/${videoId}`, data)
  return response.data
}

/**
 * 動画削除（講師のみ）
 * @param {string} videoId - 動画ID
 * @returns {Promise<void>}
 */
export async function deleteVideo(videoId) {
  await client.delete(`/videos/${videoId}`)
}

/**
 * 動画順序更新（講師のみ）
 * @param {string} courseId - コースID
 * @param {array} videoIds - 動画IDの配列（順序通り）
 * @returns {Promise<void>}
 */
export async function updateVideoOrder(courseId, videoIds) {
  const response = await client.patch(`/videos/courses/${courseId}/videos/order`, {
    video_ids: videoIds
  })
  return response.data
}
