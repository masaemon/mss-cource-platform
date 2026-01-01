import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

// グローバルエラーハンドラー
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)

  // Sentryなどのエラー追跡サービスに送信
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(err)
  // }
}

// 未処理のPromise拒否
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason)

  // 本番環境ではエラー追跡サービスに送信
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(event.reason)
  // }
})

app.use(pinia)
app.use(router)
app.mount('#app')
