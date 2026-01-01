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
