# FE-006: 認証APIクライアント実装

## 概要

FastAPI バックエンドと連携する認証 API クライアントを完全実装します。

## 優先度

**High**

## 推定時間

2時間

## 依存関係

- FE-005: Pinia ストア設定

## 実装内容

### 1. api/auth.js 完全実装

`src/api/auth.js`:

```javascript
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
```

### 2. エラーハンドリング強化

`src/api/client.js` 更新:

```javascript
import axios from 'axios'
import router from '@/router'
import { useToast } from '@/composables/useToast'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10秒
})

// リクエストインターセプター
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

// レスポンスインターセプター
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
```

### 3. 認証ユーティリティ作成

`src/utils/auth.js`:

```javascript
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
```

### 4. 環境変数設定

`.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

`.env.production`:

```env
VITE_API_BASE_URL=https://api.example.com/api/v1
```

### 5. テスト用ユーティリティ

`src/utils/test-auth.js` (開発用):

```javascript
import { login } from '@/api/auth'

/**
 * テスト用ログイン
 */
export async function testLogin() {
  try {
    const result = await login('test@example.com', 'password123')
    console.log('Test login successful:', result)
    return result
  } catch (error) {
    console.error('Test login failed:', error)
    throw error
  }
}

/**
 * テスト用ユーザー情報
 */
export const TEST_USERS = {
  student: {
    email: 'student@example.com',
    password: 'password123'
  },
  instructor: {
    email: 'instructor@example.com',
    password: 'password123'
  },
  admin: {
    email: 'admin@example.com',
    password: 'password123'
  }
}
```

## 実装ファイル

- `frontend/src/api/auth.js` (完全実装)
- `frontend/src/api/client.js` (エラーハンドリング強化)
- `frontend/src/utils/auth.js` (新規作成)
- `frontend/src/utils/test-auth.js` (新規作成)
- `frontend/.env` (新規作成)
- `frontend/.env.production` (新規作成)

## 検証方法

### 1. API 接続テスト

ブラウザのコンソールで:

```javascript
import { login } from '@/api/auth'

// テストログイン
login('test@example.com', 'password123')
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err))
```

### 2. エラーハンドリングテスト

```javascript
// 存在しないエンドポイント
client.get('/invalid-endpoint')

// 認証エラー
client.get('/auth/me') // トークンなし

// バリデーションエラー
login('', '') // 空の入力
```

### 3. バックエンド起動確認

```bash
# バックエンド起動
cd backend/fastapi
docker-compose up -d

# ヘルスチェック
curl http://localhost:8000/health
```

## 完了条件

- [ ] 認証 API クライアントが完全実装されている
- [ ] エラーハンドリングが実装されている
- [ ] バリデーション関数が実装されている
- [ ] 環境変数が設定されている
- [ ] トークン管理ユーティリティが実装されている
- [ ] API 接続テストが成功する
- [ ] エラー時に適切なトースト通知が表示される

## 備考

### FastAPI レスポンス形式

**成功時:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "User Name",
    "role": "user",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**エラー時:**
```json
{
  "detail": "Invalid credentials"
}
```

**バリデーションエラー時:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### JWT トークン構造

```
Header.Payload.Signature

Payload:
{
  "sub": "user-id",
  "exp": 1234567890,
  "iat": 1234567890
}
```
