import client from './client'

/**
 * コースのコメント一覧取得
 * @param {string} courseId - コースID
 * @returns {Promise<array>} コメント一覧
 */
export async function getCourseComments(courseId) {
  const response = await client.get(`/comments/courses/${courseId}/comments`)
  return response.data
}

/**
 * コメント投稿
 * @param {string} courseId - コースID
 * @param {string} content - コメント内容
 * @returns {Promise<object>} 作成されたコメント
 */
export async function createComment(courseId, content) {
  const response = await client.post(`/comments/courses/${courseId}/comments`, {
    content
  })
  return response.data
}

/**
 * コメント更新
 * @param {string} commentId - コメントID
 * @param {string} content - 更新内容
 * @returns {Promise<object>} 更新されたコメント
 */
export async function updateComment(commentId, content) {
  const response = await client.put(`/comments/${commentId}`, {
    content
  })
  return response.data
}

/**
 * コメント削除
 * @param {string} commentId - コメントID
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
  await client.delete(`/comments/${commentId}`)
}

/**
 * 講師の返信投稿
 * @param {string} courseId - コースID
 * @param {string} parentId - 親コメントID
 * @param {string} content - 返信内容
 * @returns {Promise<object>} 作成された返信
 */
export async function replyToComment(courseId, parentId, content) {
  const response = await client.post(`/comments/courses/${courseId}/comments/reply`, {
    content,
    parent_id: parentId
  })
  return response.data
}
