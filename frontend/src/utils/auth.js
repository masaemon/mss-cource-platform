/**
 * パスワードの強度をチェック
 * @param {string} password
 * @returns {{isValid: boolean, message: string}}
 */
export function validatePassword(password) {
  if (password.length < 8) {
    return { isValid: false, message: 'パスワードは8文字以上である必要があります' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'パスワードには大文字を含める必要があります' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'パスワードには小文字を含める必要があります' }
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'パスワードには数字を含める必要があります' }
  }

  return { isValid: true, message: '' }
}

/**
 * メールアドレスの形式をチェック
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * トークンの有効期限をチェック
 * @param {string} token - JWT トークン
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // ミリ秒に変換
    return Date.now() >= exp
  } catch (e) {
    return true
  }
}

/**
 * トークンからユーザーIDを取得
 * @param {string} token - JWT トークン
 * @returns {string|null}
 */
export function getUserIdFromToken(token) {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub
  } catch (e) {
    return null
  }
}
