# FE-034~037: 最終仕上げとポリッシュ

## FE-034: エラーハンドリング改善

### 概要
グローバルエラーハンドリングとユーザーフレンドリーなエラー表示を実装します。

### 優先度: High
### 推定時間: 2時間

### 実装内容

#### エラーバウンダリーコンポーネント

`src/components/common/ErrorBoundary.vue`:

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)
const errorInfo = ref(null)

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
</script>

<template>
  <div v-if="error" class="min-h-screen flex items-center justify-center p-4">
    <div class="card bg-base-100 shadow-xl max-w-2xl">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h2 class="card-title">エラーが発生しました</h2>
            <p class="text-base-content/60">申し訳ございません。予期しないエラーが発生しました。</p>
          </div>
        </div>

        <div v-if="import.meta.env.DEV" class="bg-base-200 rounded-lg p-4 mt-4">
          <p class="font-mono text-sm text-error">{{ error.message }}</p>
          <details class="mt-2">
            <summary class="cursor-pointer text-sm">詳細を表示</summary>
            <pre class="text-xs mt-2 overflow-auto">{{ error.stack }}</pre>
          </details>
        </div>

        <div class="card-actions justify-end mt-6">
          <button @click="reset" class="btn btn-ghost">
            再試行
          </button>
          <button @click="$router.push('/')" class="btn btn-primary">
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  </div>

  <slot v-else></slot>
</template>
```

#### グローバルエラーハンドラー

`src/main.js` 更新:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

const app = createApp(App)

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
})

app.use(router)
app.use(pinia)
app.mount('#app')
```

#### 404 Not Found ページ

`src/views/NotFoundView.vue`:

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary">404</h1>
      <p class="text-2xl font-semibold mt-4">ページが見つかりません</p>
      <p class="text-base-content/60 mt-2">
        お探しのページは存在しないか、移動した可能性があります。
      </p>

      <div class="mt-8 flex gap-4 justify-center">
        <button @click="router.back()" class="btn btn-ghost">
          戻る
        </button>
        <button @click="router.push('/')" class="btn btn-primary">
          ホームに戻る
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## FE-035: パフォーマンス最適化

### 概要
アプリケーションのパフォーマンスを最適化します。

### 優先度: Medium
### 推定時間: 2時間

### 実装内容

#### ルートの遅延ロード

`src/router/index.js`:

```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/courses/:id',
    name: 'CourseDetail',
    component: () => import('@/views/CourseDetailView.vue')
  },
  // ... 全てのルートを遅延ロードに
]
```

#### 画像の遅延読み込み

`src/components/course/CourseCard.vue`:

```vue
<template>
  <img
    :src="thumbnailUrl"
    :alt="course.title_ja"
    loading="lazy"
    class="w-full h-full object-cover"
  />
</template>
```

#### Piniaストアの永続化（オプション）

```bash
npm install pinia-plugin-persistedstate
```

```javascript
// src/stores/index.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia

// stores/auth.js
export const useAuthStore = defineStore('auth', () => {
  // ... ストアの定義
}, {
  persist: {
    paths: ['token', 'user']
  }
})
```

#### Vite設定の最適化

`vite.config.js`:

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['@headlessui/vue']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  }
})
```

---

## FE-036: レスポンシブデザイン改善

### 概要
モバイル・タブレット対応を強化し、レスポンシブデザインを改善します。

### 優先度: High
### 推定時間: 2.5時間

### 実装内容

#### モバイルナビゲーション

`src/components/layout/AppHeader.vue`:

```vue
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="navbar bg-base-100 shadow-lg">
    <div class="container mx-auto">
      <!-- モバイルメニューボタン -->
      <div class="navbar-start">
        <div class="dropdown lg:hidden">
          <label
            tabindex="0"
            class="btn btn-ghost"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>

          <ul
            v-show="mobileMenuOpen"
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><router-link to="/" @click="closeMobileMenu">ホーム</router-link></li>
            <li v-if="authStore.isInstructor">
              <router-link to="/instructor/dashboard" @click="closeMobileMenu">
                講師ダッシュボード
              </router-link>
            </li>
            <li v-if="authStore.isAdmin">
              <router-link to="/admin/dashboard" @click="closeMobileMenu">
                管理者ダッシュボード
              </router-link>
            </li>
          </ul>
        </div>

        <!-- ロゴ -->
        <router-link to="/" class="btn btn-ghost normal-case text-xl">
          MSS Course
        </router-link>
      </div>

      <!-- デスクトップメニュー -->
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><router-link to="/">ホーム</router-link></li>
          <!-- ... -->
        </ul>
      </div>

      <!-- ユーザーメニュー -->
      <div class="navbar-end">
        <!-- ... -->
      </div>
    </div>
  </header>
</template>
```

#### レスポンシブグリッド調整

全てのグリッドレイアウトを見直し:

```vue
<!-- Before -->
<div class="grid grid-cols-3 gap-6">

<!-- After -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

#### タッチデバイス対応

```css
/* src/assets/main.css */
@media (hover: none) and (pointer: coarse) {
  /* タッチデバイス用のスタイル */
  .btn {
    min-height: 48px; /* タップしやすいサイズ */
  }

  .card {
    @apply active:scale-95 transition-transform;
  }
}
```

---

## FE-037: アクセシビリティ改善

### 概要
WCAG 2.1 AA準拠を目指し、アクセシビリティを改善します。

### 優先度: Medium
### 推定時間: 2時間

### 実装内容

#### キーボードナビゲーション

全てのインタラクティブ要素に適切な `tabindex` と `aria-label` を追加:

```vue
<button
  @click="handleClick"
  aria-label="コースを編集"
  class="btn"
>
  <svg aria-hidden="true">...</svg>
  編集
</button>
```

#### フォーカス表示の改善

```css
/* src/assets/main.css */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary;
}

/* フォーカストラップ（モーダル内） */
.modal:focus-within {
  @apply outline-none;
}
```

#### スクリーンリーダー対応

```vue
<!-- ローディング状態 -->
<div v-if="loading" role="status" aria-live="polite">
  <span class="loading loading-spinner"></span>
  <span class="sr-only">読み込み中...</span>
</div>

<!-- エラーメッセージ -->
<div v-if="error" role="alert" aria-live="assertive">
  {{ error }}
</div>

<!-- スキップリンク -->
<a href="#main-content" class="sr-only focus:not-sr-only">
  メインコンテンツへスキップ
</a>

<main id="main-content">
  <!-- ... -->
</main>
```

#### カラーコントラスト確認

DaisyUI のテーマをカスタマイズして十分なコントラスト比を確保:

```javascript
// tailwind.config.js
module.exports = {
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#0066cc", // WCAG AA準拠の青
        },
      },
    ],
  },
}
```

#### セマンティックHTML

```vue
<!-- Before -->
<div class="header">...</div>

<!-- After -->
<header>...</header>
<nav aria-label="メインナビゲーション">...</nav>
<main>...</main>
<aside aria-label="サイドバー">...</aside>
<footer>...</footer>
```

#### ARIA属性の追加

```vue
<nav aria-label="パンくずリスト">
  <ol class="breadcrumbs">
    <li><a href="/">ホーム</a></li>
    <li aria-current="page">コース詳細</li>
  </ol>
</nav>

<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    概要
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    動画
  </button>
</div>

<div role="tabpanel" id="panel-1">
  <!-- ... -->
</div>
```

#### アクセシビリティテスト

開発時にaxe DevToolsを使用:

```bash
# axe-core のインストール（オプション）
npm install -D @axe-core/vue
```

```javascript
// main.js (開発環境のみ)
if (import.meta.env.DEV) {
  import('@axe-core/vue').then(axe => {
    axe.default(app, {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true }
        ]
      }
    })
  })
}
```

## 実装ファイル

### FE-034
- `frontend/src/components/common/ErrorBoundary.vue` (新規作成)
- `frontend/src/views/NotFoundView.vue` (新規作成)
- `frontend/src/main.js` (更新)
- `frontend/src/router/index.js` (404ルート追加)

### FE-035
- `frontend/vite.config.js` (更新)
- `frontend/src/router/index.js` (遅延ロード)
- 各コンポーネントに `loading="lazy"` 追加
- Pinia永続化プラグイン導入（オプション）

### FE-036
- `frontend/src/components/layout/AppHeader.vue` (更新)
- 全グリッドレイアウトのレスポンシブ対応
- `frontend/src/assets/main.css` (タッチデバイス対応)

### FE-037
- 全コンポーネントにARIA属性追加
- `frontend/src/assets/main.css` (フォーカススタイル)
- `frontend/tailwind.config.js` (カラーコントラスト調整)
- axe-core 導入（オプション）

## 検証方法

### FE-034
- [ ] エラーが適切にキャッチされる
- [ ] エラーバウンダリーが動作する
- [ ] 404ページが表示される
- [ ] グローバルエラーハンドラーが動作する

### FE-035
- [ ] 初期ロード時間が改善される
- [ ] コード分割が動作する
- [ ] 画像の遅延読み込みが動作する
- [ ] Lighthouse スコアが向上する

### FE-036
- [ ] モバイル（375px）で正しく表示される
- [ ] タブレット（768px）で正しく表示される
- [ ] デスクトップ（1920px）で正しく表示される
- [ ] タッチデバイスで操作しやすい

### FE-037
- [ ] キーボードのみで全ての操作ができる
- [ ] スクリーンリーダーで読み上げられる
- [ ] フォーカスが視認できる
- [ ] カラーコントラストが十分
- [ ] axe DevTools で警告がない

## 完了条件

- [ ] エラーハンドリングが実装されている
- [ ] パフォーマンスが最適化されている
- [ ] レスポンシブデザインが実装されている
- [ ] アクセシビリティが改善されている
- [ ] Lighthouse スコアが80以上
- [ ] WCAG 2.1 AA の主要な基準を満たしている

## 備考

### パフォーマンス目標

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Cumulative Layout Shift (CLS): < 0.1

### アクセシビリティ目標

- WCAG 2.1 AA 準拠
- キーボードナビゲーション完全対応
- スクリーンリーダー対応
- カラーコントラスト比 4.5:1 以上

### テストツール

- Lighthouse（Chrome DevTools）
- axe DevTools
- WAVE（ブラウザ拡張）
- スクリーンリーダー（NVDA, VoiceOver）
