import axios from 'axios'
import router from '@/router'
import { useToast } from '@/composables/useToast'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  },
  timeout: 10000, // 10秒
  responseType: 'json',
  responseEncoding: 'utf8'
})

// リクエストインターセプター（JWT自動付与）
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター（エラーハンドリング）
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const { showToast } = useToast()

    if (error.response) {
      const status = error.response.status
      const detail = error.response.data?.detail

      switch (status) {
        case 401:
          // 認証エラー
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          if (router.currentRoute.value.path !== '/auth/login') {
            showToast('ログインが必要です', 'error')
            router.push('/auth/login')
          }
          break

        case 403:
          // 権限エラー
          showToast('権限がありません', 'error')
          break

        case 404:
          // Not Found
          showToast('リソースが見つかりません', 'error')
          break

        case 422:
          // バリデーションエラー
          if (Array.isArray(detail)) {
            // FastAPIのバリデーションエラー形式
            const errors = detail.map(err => err.msg).join(', ')
            showToast(errors, 'error')
          } else {
            showToast(detail || 'バリデーションエラー', 'error')
          }
          break

        case 429:
          // レート制限
          showToast('リクエストが多すぎます。しばらくお待ちください', 'warning')
          break

        case 500:
        case 502:
        case 503:
          // サーバーエラー
          showToast('サーバーエラーが発生しました', 'error')
          break

        default:
          showToast(detail || 'エラーが発生しました', 'error')
      }
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      showToast('サーバーに接続できません', 'error')
    } else {
      // その他のエラー
      showToast('エラーが発生しました', 'error')
    }

    return Promise.reject(error)
  }
)

export default client
