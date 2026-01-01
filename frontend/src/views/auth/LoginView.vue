<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { validateEmail } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const { login, loading, error } = useAuth()
const { success, error: showError } = useToast()

// 開発環境かどうか
const isDev = import.meta.env.DEV

// フォームデータ
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// バリデーションエラー
const emailError = ref('')
const passwordError = ref('')

// フォームバリデーション
const isFormValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

// メールアドレスバリデーション
function validateEmailField() {
  if (!email.value) {
    emailError.value = 'メールアドレスを入力してください'
  } else if (!validateEmail(email.value)) {
    emailError.value = '有効なメールアドレスを入力してください'
  } else {
    emailError.value = ''
  }
}

// パスワードバリデーション
function validatePasswordField() {
  if (!password.value) {
    passwordError.value = 'パスワードを入力してください'
  } else {
    passwordError.value = ''
  }
}

// ログイン処理
async function handleLogin() {
  // バリデーション
  validateEmailField()
  validatePasswordField()

  if (!isFormValid.value) return

  try {
    await login(email.value, password.value)

    // Remember me 処理
    if (rememberMe.value) {
      localStorage.setItem('remember_email', email.value)
    } else {
      localStorage.removeItem('remember_email')
    }

    success('ログインしました')

    // リダイレクト先を取得
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    // エラーは useAuth と API client で処理済み
    console.error('Login failed:', err)
  }
}

// Remember me の復元
const rememberedEmail = localStorage.getItem('remember_email')
if (rememberedEmail) {
  email.value = rememberedEmail
  rememberMe.value = true
}
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- ヘッダー -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">ログイン</h1>
        <p class="text-base-content/60">MSS Course Platform へようこそ</p>
      </div>

      <!-- ログインフォーム -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <form @submit.prevent="handleLogin">
            <!-- メールアドレス -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">メールアドレス</span>
              </label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="input input-bordered"
                :class="{ 'input-error': emailError }"
                @blur="validateEmailField"
                autocomplete="email"
                required
              />
              <label v-if="emailError" class="label">
                <span class="label-text-alt text-error">{{ emailError }}</span>
              </label>
            </div>

            <!-- パスワード -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">パスワード</span>
              </label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="input input-bordered w-full pr-12"
                  :class="{ 'input-error': passwordError }"
                  @blur="validatePasswordField"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
              <label v-if="passwordError" class="label">
                <span class="label-text-alt text-error">{{ passwordError }}</span>
              </label>
            </div>

            <!-- Remember me & パスワード忘れ -->
            <div class="flex justify-between items-center mt-4">
              <label class="label cursor-pointer">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="label-text ml-2">ログイン状態を保持</span>
              </label>

              <router-link
                to="/auth/forgot-password"
                class="label-text-alt link link-hover"
              >
                パスワードを忘れた方
              </router-link>
            </div>

            <!-- エラーメッセージ -->
            <div v-if="error" class="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>

            <!-- ログインボタン -->
            <div class="form-control mt-6">
              <button
                type="submit"
                class="btn btn-primary"
                :class="{ 'loading': loading }"
                :disabled="loading || !isFormValid"
              >
                <span v-if="!loading">ログイン</span>
                <span v-else>ログイン中...</span>
              </button>
            </div>
          </form>

          <!-- 区切り線 -->
          <div class="divider">または</div>

          <!-- サインアップリンク -->
          <div class="text-center">
            <p class="text-sm text-base-content/60">
              アカウントをお持ちでない方
            </p>
            <router-link to="/auth/signup" class="btn btn-ghost btn-sm mt-2">
              サインアップ
            </router-link>
          </div>
        </div>
      </div>

      <!-- テスト用情報（開発環境のみ） -->
      <div v-if="isDev" class="card bg-base-200 shadow-sm mt-4">
        <div class="card-body py-4">
          <p class="text-xs text-base-content/60">
            開発用テストアカウント:<br>
            Email: test@example.com<br>
            Password: password123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
