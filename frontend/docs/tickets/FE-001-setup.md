# FE-001: Vite + Vue 3 プロジェクトセットアップ

## 概要

Vite と Vue 3 を使用したフロントエンドプロジェクトの初期セットアップを行います。

## 優先度

**High**

## 推定時間

2時間

## 依存関係

なし（最初のチケット）

## 実装内容

### 1. Vite + Vue 3 プロジェクト作成

```bash
cd frontend
npm create vite@latest . -- --template vue

# または既存ディレクトリに作成
npm create vite@latest
# Project name: mss-course-frontend
# Select a framework: Vue
# Select a variant: JavaScript
```

### 2. 必要な依存関係インストール

```bash
# Vue Router, Pinia, Axios
npm install vue-router@4 pinia axios

# 開発依存関係
npm install -D @vitejs/plugin-vue
```

### 3. vite.config.js 設定

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
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

### 4. package.json 確認

必要なスクリプトが含まれていることを確認:

```json
{
  "name": "mss-course-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### 5. ディレクトリ構造作成

```bash
mkdir -p src/{components/{layout,course,common},views/{auth,instructor,admin},router,stores,api,composables,assets}
mkdir -p public/images
```

最終的な構造:

```
frontend/
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   ├── course/
│   │   └── common/
│   ├── views/
│   │   ├── auth/
│   │   ├── instructor/
│   │   └── admin/
│   ├── router/
│   ├── stores/
│   ├── api/
│   └── composables/
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### 6. index.html 更新

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MSS Course Platform</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### 7. 基本的な main.js 作成

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.mount('#app')
```

### 8. 基本的な App.vue 作成

```vue
<script setup>
</script>

<template>
  <div id="app">
    <h1>MSS Course Platform</h1>
    <p>Vue 3 + Vite セットアップ完了</p>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
```

### 9. .gitignore 確認

```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## 実装ファイル

- `frontend/index.html`
- `frontend/vite.config.js`
- `frontend/package.json`
- `frontend/src/main.js`
- `frontend/src/App.vue`
- `frontend/.gitignore`

## 検証方法

```bash
# 依存関係インストール
cd frontend
npm install

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
# "MSS Course Platform" と表示されることを確認
```

## 完了条件

- [x] Vite + Vue 3 プロジェクトが作成されている
- [x] 必要な依存関係がインストールされている
- [x] vite.config.js が設定されている
- [x] ディレクトリ構造が作成されている
- [x] 開発サーバーが起動できる
- [x] ブラウザで初期画面が表示される

## 備考

- Vite は高速な開発サーバーとビルドツール
- Vue 3 の Composition API を使用
- パスエイリアス `@` を設定（`@/components/...` で src/ にアクセス）
- API プロキシ設定で CORS 問題を回避
