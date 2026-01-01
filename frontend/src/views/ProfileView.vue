<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { updateProfile, changePassword } from '@/api/auth'
import { validatePassword } from '@/utils/auth'

const { user, fetchUser } = useAuth()
const { success, error: showError } = useToast()

// プロフィール編集
const isEditingProfile = ref(false)
const displayName = ref('')
const bio = ref('')
const avatarUrl = ref('')
const loadingProfile = ref(false)

// パスワード変更
const isChangingPassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const loadingPassword = ref(false)

// エラー
const newPasswordError = ref('')
const newPasswordConfirmError = ref('')

// プロフィール編集モード切り替え
function startEditProfile() {
  displayName.value = user.value?.display_name || ''
  bio.value = user.value?.bio || ''
  avatarUrl.value = user.value?.avatar_url || ''
  isEditingProfile.value = true
}

function cancelEditProfile() {
  isEditingProfile.value = false
  displayName.value = ''
  bio.value = ''
  avatarUrl.value = ''
}

// プロフィール更新
async function handleUpdateProfile() {
  loadingProfile.value = true

  try {
    await updateProfile({
      display_name: displayName.value,
      bio: bio.value,
      avatar_url: avatarUrl.value || null
    })

    await fetchUser()
    success('プロフィールを更新しました')
    isEditingProfile.value = false
  } catch (err) {
    showError('プロフィールの更新に失敗しました')
  } finally {
    loadingProfile.value = false
  }
}

// パスワードバリデーション
function validateNewPassword() {
  if (!newPassword.value) {
    newPasswordError.value = '新しいパスワードを入力してください'
  } else {
    const validation = validatePassword(newPassword.value)
    if (!validation.isValid) {
      newPasswordError.value = validation.message
    } else {
      newPasswordError.value = ''
      if (newPasswordConfirm.value) {
        validateNewPasswordConfirm()
      }
    }
  }
}

function validateNewPasswordConfirm() {
  if (!newPasswordConfirm.value) {
    newPasswordConfirmError.value = 'パスワード（確認）を入力してください'
  } else if (newPassword.value !== newPasswordConfirm.value) {
    newPasswordConfirmError.value = 'パスワードが一致しません'
  } else {
    newPasswordConfirmError.value = ''
  }
}

// パスワード変更
async function handleChangePassword() {
  validateNewPassword()
  validateNewPasswordConfirm()

  if (newPasswordError.value || newPasswordConfirmError.value) return

  loadingPassword.value = true

  try {
    await changePassword(currentPassword.value, newPassword.value)
    success('パスワードを変更しました')

    // フォームをリセット
    isChangingPassword.value = false
    currentPassword.value = ''
    newPassword.value = ''
    newPasswordConfirm.value = ''
  } catch (err) {
    showError(err.response?.data?.detail || 'パスワードの変更に失敗しました')
  } finally {
    loadingPassword.value = false
  }
}

// ユーザー情報を最新化
onMounted(() => {
  if (user.value) {
    fetchUser()
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold mb-8">プロフィール</h1>

    <!-- プロフィール表示/編集 -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">基本情報</h2>
          <button
            v-if="!isEditingProfile"
            @click="startEditProfile"
            class="btn btn-sm btn-ghost"
          >
            編集
          </button>
        </div>

        <!-- 表示モード -->
        <div v-if="!isEditingProfile" class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="avatar">
              <div class="w-24 rounded-full">
                <img
                  :src="user?.avatar_url || '/images/default-avatar.png'"
                  alt="avatar"
                />
              </div>
            </div>
            <div>
              <p class="text-lg font-semibold">{{ user?.display_name }}</p>
              <p class="text-sm text-base-content/60">{{ user?.email }}</p>
              <div class="badge badge-primary mt-2">
                {{ user?.role === 'admin' ? '管理者' : user?.role === 'instructor' ? '講師' : '一般ユーザー' }}
              </div>
            </div>
          </div>

          <div v-if="user?.bio">
            <p class="text-sm font-semibold text-base-content/80">自己紹介</p>
            <p class="text-base-content/60 mt-1">{{ user.bio }}</p>
          </div>

          <div class="text-sm text-base-content/60">
            <p>登録日: {{ new Date(user?.created_at).toLocaleDateString('ja-JP') }}</p>
          </div>
        </div>

        <!-- 編集モード -->
        <form v-else @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">表示名</span>
            </label>
            <input
              v-model="displayName"
              type="text"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">自己紹介</span>
            </label>
            <textarea
              v-model="bio"
              class="textarea textarea-bordered h-24"
              placeholder="自己紹介を入力..."
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">プロフィール画像URL</span>
            </label>
            <input
              v-model="avatarUrl"
              type="url"
              class="input input-bordered"
              placeholder="https://example.com/avatar.jpg"
            />
            <label class="label">
              <span class="label-text-alt">URLを入力するとプロフィール画像が変更されます</span>
            </label>
          </div>

          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click="cancelEditProfile"
              class="btn btn-ghost"
              :disabled="loadingProfile"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :class="{ 'loading': loadingProfile }"
              :disabled="loadingProfile"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- パスワード変更 -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h2 class="card-title">パスワード変更</h2>
        </div>

        <div v-if="!isChangingPassword">
          <button
            @click="isChangingPassword = true"
            class="btn btn-outline"
          >
            パスワードを変更する
          </button>
        </div>

        <form v-else @submit.prevent="handleChangePassword" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">現在のパスワード</span>
            </label>
            <input
              v-model="currentPassword"
              type="password"
              class="input input-bordered"
              autocomplete="current-password"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">新しいパスワード</span>
            </label>
            <input
              v-model="newPassword"
              type="password"
              class="input input-bordered"
              :class="{ 'input-error': newPasswordError }"
              @blur="validateNewPassword"
              autocomplete="new-password"
              required
            />
            <label v-if="newPasswordError" class="label">
              <span class="label-text-alt text-error">{{ newPasswordError }}</span>
            </label>
            <label v-else class="label">
              <span class="label-text-alt">
                8文字以上、大文字・小文字・数字を含む
              </span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">新しいパスワード（確認）</span>
            </label>
            <input
              v-model="newPasswordConfirm"
              type="password"
              class="input input-bordered"
              :class="{ 'input-error': newPasswordConfirmError }"
              @blur="validateNewPasswordConfirm"
              autocomplete="new-password"
              required
            />
            <label v-if="newPasswordConfirmError" class="label">
              <span class="label-text-alt text-error">{{ newPasswordConfirmError }}</span>
            </label>
          </div>

          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click="isChangingPassword = false; currentPassword = ''; newPassword = ''; newPasswordConfirm = ''"
              class="btn btn-ghost"
              :disabled="loadingPassword"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :class="{ 'loading': loadingPassword }"
              :disabled="loadingPassword"
            >
              変更
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
