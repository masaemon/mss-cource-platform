<script setup>
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { requestPasswordReset } from '@/api/auth'

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const { success, error } = useToast()

async function handleSubmit() {
  loading.value = true

  try {
    await requestPasswordReset(email.value)
    submitted.value = true
    success('パスワードリセットのメールを送信しました')
  } catch (err) {
    error('エラーが発生しました')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-2">パスワードリセット</h1>
        <p class="text-base-content/60">
          登録されたメールアドレスにリセット用のリンクを送信します
        </p>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <form v-if="!submitted" @submit.prevent="handleSubmit">
            <div class="form-control">
              <label class="label">
                <span class="label-text">メールアドレス</span>
              </label>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="input input-bordered"
                required
              />
            </div>

            <div class="form-control mt-6">
              <button
                type="submit"
                class="btn btn-primary"
                :class="{ 'loading': loading }"
                :disabled="loading"
              >
                送信
              </button>
            </div>
          </form>

          <div v-else class="text-center">
            <div class="alert alert-success">
              <span>メールを送信しました。メールボックスをご確認ください。</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="text-center">
            <router-link to="/auth/login" class="btn btn-ghost btn-sm">
              ログインに戻る
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
