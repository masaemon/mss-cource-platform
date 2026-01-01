<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const error = ref(null)
const errorInfo = ref(null)

// 開発環境かどうか
const isDev = import.meta.env.DEV

onErrorCaptured((err, instance, info) => {
  error.value = err
  errorInfo.value = info

  console.error('Error captured:', err)
  console.error('Component:', instance)
  console.error('Info:', info)

  // エラーを親に伝播させない
  return false
})

function reset() {
  error.value = null
  errorInfo.value = null
}

function goHome() {
  error.value = null
  errorInfo.value = null
  router.push('/')
}
</script>

<template>
  <div v-if="error" class="min-h-screen flex items-center justify-center p-4">
    <div class="card bg-base-100 shadow-xl max-w-2xl w-full">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h2 class="card-title">エラーが発生しました</h2>
            <p class="text-base-content/60">申し訳ございません。予期しないエラーが発生しました。</p>
          </div>
        </div>

        <div v-if="isDev" class="bg-base-200 rounded-lg p-4 mt-4">
          <p class="font-mono text-sm text-error break-all">{{ error.message }}</p>
          <details class="mt-2">
            <summary class="cursor-pointer text-sm hover:text-primary">詳細を表示</summary>
            <pre class="text-xs mt-2 overflow-auto max-h-60 whitespace-pre-wrap break-all">{{ error.stack }}</pre>
          </details>
        </div>

        <div class="card-actions justify-end mt-6">
          <button @click="reset" class="btn btn-ghost">
            再試行
          </button>
          <button @click="goHome" class="btn btn-primary">
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  </div>

  <slot v-else></slot>
</template>
