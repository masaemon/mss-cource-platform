import client from './client'

/**
 * ログイン
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @returns {Promise<{access_token: string, user: object}>}
 */
export async function login(email, password) {
  const response = await client.post('/auth/login', {
    email,
    password
  })
  return response.data
}

/**
 * サインアップ
 * @param {string} email - メールアドレス
 * @param {string} display_name - 表示名
 * @param {string} password - パスワード
 * @returns {Promise<{access_token: string, user: object}>}
 */
export async function signup(email, display_name, password) {
  const response = await client.post('/auth/signup', {
    email,
    display_name,
    password
  })
  return response.data
}

/**
 * 現在のユーザー情報取得
 * @returns {Promise<object>} ユーザー情報
 */
export async function getMe() {
  const response = await client.get('/auth/me')
  return response.data
}

/**
 * パスワードリセットリクエスト
 * @param {string} email - メールアドレス
 * @returns {Promise<{message: string}>}
 */
export async function requestPasswordReset(email) {
  const response = await client.post('/auth/password-reset-request', {
    email
  })
  return response.data
}

/**
 * パスワードリセット実行
 * @param {string} token - リセットトークン
 * @param {string} newPassword - 新しいパスワード
 * @returns {Promise<{message: string}>}
 */
export async function resetPassword(token, newPassword) {
  const response = await client.post('/auth/password-reset', {
    token,
    new_password: newPassword
  })
  return response.data
}

/**
 * プロフィール更新
 * @param {object} data - 更新データ
 * @returns {Promise<object>} 更新されたユーザー情報
 */
export async function updateProfile(data) {
  const response = await client.put('/auth/profile', data)
  return response.data
}

/**
 * パスワード変更
 * @param {string} currentPassword - 現在のパスワード
 * @param {string} newPassword - 新しいパスワード
 * @returns {Promise<{message: string}>}
 */
export async function changePassword(currentPassword, newPassword) {
  const response = await client.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword
  })
  return response.data
}
