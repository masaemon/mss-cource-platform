/**
 * 相対時間を日本語で表示
 * @param {string|Date} date - 日付
 * @returns {string} 相対時間（例: 2時間前、3日前）
 */
export function timeAgo(date) {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return 'たった今'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`
  } else if (diffHours < 24) {
    return `${diffHours}時間前`
  } else if (diffDays < 30) {
    return `${diffDays}日前`
  } else if (diffMonths < 12) {
    return `${diffMonths}ヶ月前`
  } else {
    return `${diffYears}年前`
  }
}

/**
 * 日付をフォーマット
 * @param {string|Date} date - 日付
 * @returns {string} フォーマットされた日付（例: 2024/01/01 12:00）
 */
export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${year}/${month}/${day} ${hours}:${minutes}`
}
