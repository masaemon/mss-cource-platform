<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { validateEmail, validatePassword } from '@/utils/auth'

const router = useRouter()
const { signup, loading, error } = useAuth()
const { success } = useToast()

// フォームデータ
const email = ref('')
const displayName = ref('')
const password = ref('')
const passwordConfirm = ref('')
const agreeToTerms = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

// バリデーションエラー
const emailError = ref('')
const displayNameError = ref('')
const passwordError = ref('')
const passwordConfirmError = ref('')

// フォームバリデーション
const isFormValid = computed(() => {
  return (
    email.value &&
    displayName.value &&
    password.value &&
    passwordConfirm.value &&
    agreeToTerms.value &&
    !emailError.value &&
    !displayNameError.value &&
    !passwordError.value &&
    !passwordConfirmError.value
  )
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

// 表示名バリデーション
function validateDisplayNameField() {
  if (!displayName.value) {
    displayNameError.value = '表示名を入力してください'
  } else if (displayName.value.length < 2) {
    displayNameError.value = '表示名は2文字以上である必要があります'
  } else if (displayName.value.length > 50) {
    displayNameError.value = '表示名は50文字以内である必要があります'
  } else {
    displayNameError.value = ''
  }
}

// パスワードバリデーション
function validatePasswordField() {
  if (!password.value) {
    passwordError.value = 'パスワードを入力してください'
  } else {
    const validation = validatePassword(password.value)
    if (!validation.isValid) {
      passwordError.value = validation.message
    } else {
      passwordError.value = ''
      // パスワード確認も再検証
      if (passwordConfirm.value) {
        validatePasswordConfirmField()
      }
    }
  }
}

// パスワード確認バリデーション
function validatePasswordConfirmField() {
  if (!passwordConfirm.value) {
    passwordConfirmError.value = 'パスワード（確認）を入力してください'
  } else if (password.value !== passwordConfirm.value) {
    passwordConfirmError.value = 'パスワードが一致しません'
  } else {
    passwordConfirmError.value = ''
  }
}

// パスワード強度インジケーター
const passwordStrength = computed(() => {
  const pwd = password.value
  if (!pwd) return { level: 0, text: '', color: '' }

  let strength = 0
  if (pwd.length >= 8) strength++
  if (pwd.length >= 12) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  if (strength <= 2) {
    return { level: 1, text: '弱い', color: 'text-error' }
  } else if (strength === 3) {
    return { level: 2, text: '普通', color: 'text-warning' }
  } else if (strength === 4) {
    return { level: 3, text: '強い', color: 'text-success' }
  } else {
    return { level: 4, text: '非常に強い', color: 'text-success font-bold' }
  }
})

// サインアップ処理
async function handleSignup() {
  // バリデーション
  validateEmailField()
  validateDisplayNameField()
  validatePasswordField()
  validatePasswordConfirmField()

  if (!isFormValid.value) return

  try {
    await signup(email.value, displayName.value, password.value)
    success('アカウントを作成しました')
    router.push('/')
  } catch (err) {
    console.error('Signup failed:', err)
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
    <div class="w-full max-w-md">
      <!-- ヘッダー -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">サインアップ</h1>
        <p class="text-base-content/60">新しいアカウントを作成</p>
      </div>

      <!-- サインアップフォーム -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <form @submit.prevent="handleSignup">
            <!-- メールアドレス -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">メールアドレス</span>
                <span class="label-text-alt text-error">*</span>
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

            <!-- 表示名 -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">表示名</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                v-model="displayName"
                type="text"
                placeholder="山田 太郎"
                class="input input-bordered"
                :class="{ 'input-error': displayNameError }"
                @blur="validateDisplayNameField"
                autocomplete="name"
                required
              />
              <label v-if="displayNameError" class="label">
                <span class="label-text-alt text-error">{{ displayNameError }}</span>
              </label>
              <label v-else class="label">
                <span class="label-text-alt">コース内で表示される名前です</span>
              </label>
            </div>

            <!-- パスワード -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">パスワード</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="input input-bordered w-full pr-12"
                  :class="{ 'input-error': passwordError }"
                  @blur="validatePasswordField"
                  @input="validatePasswordField"
                  autocomplete="new-password"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
              <label v-if="passwordError" class="label">
                <span class="label-text-alt text-error">{{ passwordError }}</span>
              </label>
              <label v-else-if="password && passwordStrength.level > 0" class="label">
                <span class="label-text-alt" :class="passwordStrength.color">
                  強度: {{ passwordStrength.text }}
                </span>
              </label>
              <label v-else class="label">
                <span class="label-text-alt">
                  8文字以上、大文字・小文字・数字を含む
                </span>
              </label>
            </div>

            <!-- パスワード（確認） -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text">パスワード（確認）</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="passwordConfirm"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="input input-bordered w-full pr-12"
                  :class="{ 'input-error': passwordConfirmError }"
                  @blur="validatePasswordConfirmField"
                  autocomplete="new-password"
                  required
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  @click="showPasswordConfirm = !showPasswordConfirm"
                >
                  <svg v-if="!showPasswordConfirm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
              <label v-if="passwordConfirmError" class="label">
                <span class="label-text-alt text-error">{{ passwordConfirmError }}</span>
              </label>
            </div>

            <!-- 利用規約同意 -->
            <div class="form-control mt-6">
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  v-model="agreeToTerms"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  required
                />
                <span class="label-text">
                  <router-link to="/terms" class="link link-hover" target="_blank">
                    利用規約
                  </router-link>
                  と
                  <router-link to="/privacy" class="link link-hover" target="_blank">
                    プライバシーポリシー
                  </router-link>
                  に同意します
                </span>
              </label>
            </div>

            <!-- エラーメッセージ -->
            <div v-if="error" class="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ error }}</span>
            </div>

            <!-- サインアップボタン -->
            <div class="form-control mt-6">
              <button
                type="submit"
                class="btn btn-primary"
                :class="{ 'loading': loading }"
                :disabled="loading || !isFormValid"
              >
                <span v-if="!loading">アカウント作成</span>
                <span v-else>作成中...</span>
              </button>
            </div>
          </form>

          <!-- 区切り線 -->
          <div class="divider">または</div>

          <!-- ログインリンク -->
          <div class="text-center">
            <p class="text-sm text-base-content/60">
              すでにアカウントをお持ちの方
            </p>
            <router-link to="/auth/login" class="btn btn-ghost btn-sm mt-2">
              ログイン
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
