# FE-002: Tailwind CSS + DaisyUI セットアップ

## 概要

Tailwind CSS v4 と DaisyUI を Vue 3 プロジェクトに統合します。

## 優先度

**High**

## 推定時間

1.5時間

## 依存関係

- FE-001: Vite + Vue 3 プロジェクトセットアップ

## 実装内容

### 1. Tailwind CSS インストール

```bash
npm install -D tailwindcss@next @tailwindcss/vite@next
npm install daisyui
```

### 2. tailwind.config.js 作成

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"], // または ["cupcake", "dark", "cmyk"]
  },
}
```

### 3. postcss.config.js 作成

```javascript
export default {
  plugins: {
    tailwindcss: {},
  },
}
```

### 4. Tailwind CSS 読み込み

`src/assets/main.css` を作成:

```css
@import "tailwindcss";

/* カスタムスタイル */
@theme {
  --color-primary: oklch(0.65 0.25 265);
  --color-secondary: oklch(0.72 0.2 180);
}

/* グローバルスタイル */
body {
  @apply bg-base-200;
}

#app {
  @apply min-h-screen;
}
```

### 5. main.js で CSS を読み込み

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'  // 追加

const app = createApp(App)

app.mount('#app')
```

### 6. vite.config.js 更新

Tailwind プラグイン追加:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()  // 追加
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

### 7. App.vue でテスト

```vue
<script setup>
</script>

<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold text-primary mb-6">
      MSS Course Platform
    </h1>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Tailwind CSS + DaisyUI</h2>
        <p>セットアップ完了！</p>

        <div class="flex gap-2 mt-4">
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
          <button class="btn btn-accent">Accent</button>
        </div>

        <div class="alert alert-info mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>DaisyUI コンポーネントが使用可能です！</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 実装ファイル

- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/src/assets/main.css`
- `frontend/src/main.js` (更新)
- `frontend/vite.config.js` (更新)
- `frontend/src/App.vue` (テスト用更新)

## 検証方法

```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
# 以下を確認:
# 1. Tailwind のユーティリティクラスが適用されている
# 2. DaisyUI のボタンスタイルが表示されている
# 3. カードコンポーネントが正しくレンダリングされている
# 4. アラートコンポーネントが表示されている
```

### テーマ切り替えテスト

`index.html` の `<html>` タグに `data-theme` 属性を追加してテーマを切り替え:

```html
<html lang="ja" data-theme="dark">
```

または

```html
<html lang="ja" data-theme="cupcake">
```

## 完了条件

- [x] Tailwind CSS がインストールされている (v3.4.17)
- [x] DaisyUI がインストールされている (v5.5.14)
- [x] tailwind.config.js が設定されている
- [x] main.css でTailwindがインポートされている
- [x] PostCSS設定が追加されている (v3はViteプラグイン不要)
- [x] ブラウザでTailwindスタイルが適用されている
- [x] DaisyUIコンポーネントが動作している

## 備考

### 利用可能な DaisyUI テーマ

- light (デフォルト)
- dark
- cupcake
- bumblebee
- emerald
- corporate
- synthwave
- retro
- cyberpunk
- valentine
- halloween
- garden
- forest
- aqua
- lofi
- pastel
- fantasy
- wireframe
- black
- luxury
- dracula

### カスタマイズ

`tailwind.config.js` でカラーやフォントをカスタマイズ可能:

```javascript
theme: {
  extend: {
    colors: {
      'brand': '#3b82f6',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  }
}
```

### Tailwind CSS v4 の特徴

- `@import "tailwindcss"` で簡単に読み込み
- `@theme` ディレクティブでカスタムトークン定義
- Vite プラグインで高速ビルド
