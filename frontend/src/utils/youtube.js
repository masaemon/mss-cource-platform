/**
 * YouTube IFrame API をロードする
 * @returns {Promise<void>}
 */
export function loadYouTubeAPI() {
  return new Promise((resolve) => {
    // すでにロード済みの場合
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    // ロード中の場合
    if (window.YT) {
      const checkInterval = setInterval(() => {
        if (window.YT.Player) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      return
    }

    // 初回ロード
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })
}

/**
 * YouTube URL から動画IDを抽出する
 * @param {string} url - YouTube URL
 * @returns {string|null} 動画ID
 */
export function extractYouTubeVideoId(url) {
  if (!url) return null

  // すでにIDのみの場合
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  // 標準URL: https://www.youtube.com/watch?v=VIDEO_ID
  const standardMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (standardMatch) {
    return standardMatch[1]
  }

  // 短縮URL: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) {
    return shortMatch[1]
  }

  // 埋め込みURL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (embedMatch) {
    return embedMatch[1]
  }

  return null
}
