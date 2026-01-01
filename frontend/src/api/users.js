import client from './client'

/**
 * ユーザー一覧取得（管理者のみ）
 * @returns {Promise<array>} ユーザー一覧
 */
export async function getUsers() {
  const response = await client.get('/users')
  return response.data
}

/**
 * ユーザーの役割を更新（管理者のみ）
 * @param {string} userId - ユーザーID
 * @param {string} role - 新しい役割（user/instructor/admin）
 * @returns {Promise<object>} 更新されたユーザー
 */
export async function updateUserRole(userId, role) {
  const response = await client.patch(`/users/${userId}/role`, { role })
  return response.data
}
