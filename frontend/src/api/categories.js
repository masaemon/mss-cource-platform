import client from './client'

/**
 * カテゴリー一覧取得
 * @returns {Promise<array>} カテゴリー一覧
 */
export async function getCategories() {
  const response = await client.get('/categories')
  return response.data
}

/**
 * カテゴリー詳細取得
 * @param {string} id - カテゴリーID
 * @returns {Promise<object>} カテゴリー詳細
 */
export async function getCategory(id) {
  const response = await client.get(`/categories/${id}`)
  return response.data
}

/**
 * カテゴリー作成（管理者のみ）
 * @param {object} data - カテゴリーデータ
 * @returns {Promise<object>} 作成されたカテゴリー
 */
export async function createCategory(data) {
  const response = await client.post('/categories', data)
  return response.data
}

/**
 * カテゴリー更新（管理者のみ）
 * @param {string} id - カテゴリーID
 * @param {object} data - 更新データ
 * @returns {Promise<object>} 更新されたカテゴリー
 */
export async function updateCategory(id, data) {
  const response = await client.put(`/categories/${id}`, data)
  return response.data
}

/**
 * カテゴリー削除（管理者のみ）
 * @param {string} id - カテゴリーID
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  await client.delete(`/categories/${id}`)
}
