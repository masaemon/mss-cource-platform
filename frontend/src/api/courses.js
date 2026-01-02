import client from './client'

/**
 * コース一覧取得
 * @param {object} params - クエリパラメータ
 * @param {string} params.category_id - カテゴリーID
 * @param {string} params.search - 検索キーワード
 * @param {number} params.page - ページ番号
 * @param {number} params.limit - 1ページあたりの件数
 * @param {string} params.sort - ソート順序（例: created_at_desc, title_asc）
 * @returns {Promise<{courses: array, total: number, page: number, limit: number}>}
 */
export async function getCourses(params = {}) {
  // sort パラメータを処理
  const { sort, ...otherParams } = params

  if (sort) {
    const parts = sort.split('_')
    // 最後の要素がasc/desc、それ以前がフィールド名
    const order = parts[parts.length - 1]
    const field = parts.slice(0, -1).join('_')
    otherParams.sort_by = field
    otherParams.sort_order = order
  }

  const response = await client.get('/courses', { params: otherParams })
  return response.data
}

/**
 * コース詳細取得
 * @param {string} id - コースID
 * @returns {Promise<object>} コース詳細
 */
export async function getCourse(id) {
  const response = await client.get(`/courses/${id}`)
  return response.data
}

/**
 * コース作成（講師のみ）
 * @param {object} data - コースデータ
 * @returns {Promise<object>} 作成されたコース
 */
export async function createCourse(data) {
  const response = await client.post('/courses', data)
  return response.data
}

/**
 * コース更新（講師のみ）
 * @param {string} id - コースID
 * @param {object} data - 更新データ
 * @returns {Promise<object>} 更新されたコース
 */
export async function updateCourse(id, data) {
  const response = await client.put(`/courses/${id}`, data)
  return response.data
}

/**
 * コース削除（講師のみ）
 * @param {string} id - コースID
 * @returns {Promise<void>}
 */
export async function deleteCourse(id) {
  await client.delete(`/courses/${id}`)
}

/**
 * コース公開/非公開切り替え（講師のみ）
 * @param {string} id - コースID
 * @param {boolean} isPublished - 公開状態
 * @returns {Promise<object>} 更新されたコース
 */
export async function toggleCoursePublish(id, isPublished) {
  const response = await client.patch(`/courses/${id}/publish`, {
    is_published: isPublished
  })
  return response.data
}

/**
 * 講師の全コース取得（公開・非公開問わず）
 * @returns {Promise<array>} 講師のコース一覧
 */
export async function getInstructorCourses() {
  const response = await client.get('/courses/instructor/courses')
  return response.data
}
