# 13. ダークモード実装

## 概要
next-themesを使用したダークモード切り替え機能の実装

## 実装内容

### パッケージインストール
- [x] `next-themes` をインストール

### ThemeProvider設定
- [x] `app/_components/theme-provider.tsx` 作成
- [x] ルートレイアウトでThemeProvider追加

### ダークモード切り替えUI
- [x] テーマ切り替えボタンコンポーネント作成
- [x] ヘッダーに切り替えボタン追加
- [x] アイコン表示（太陽/月）

### Tailwind CSS設定
- [x] `dark:` プレフィックスでダークモードスタイル追加
- [x] CSS変数をダークモードに対応

### コンポーネント更新
- [x] 主要コンポーネントのダークモード対応
- [x] テキスト色、背景色の調整
- [x] ボーダー、シャドウの調整

## パッケージインストール

```bash
npm install next-themes
```

## ThemeProvider設定

```typescript
// app/_components/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

## ルートレイアウト更新

```typescript
// app/layout.tsx
import { ThemeProvider } from './_components/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## テーマ切り替えボタン

```typescript
// app/_components/theme-toggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // ハイドレーションエラー防止
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
      aria-label="テーマ切り替え"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
```

## Tailwind CSS設定確認

```javascript
// tailwind.config.js (Next.js 16では不要、globals.cssで設定済み)
module.exports = {
  darkMode: 'class', // または 'media'
  // ...
};
```

## CSS変数更新

```css
/* app/globals.css 更新 */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
  --card: #ffffff;
  --card-foreground: #171717;
  --border: #e5e5e5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --card: #171717;
    --card-foreground: #ededed;
    --border: #262626;
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-border: var(--border);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

## コンポーネントのダークモード対応

### ヘッダー
```tsx
<header className="border-b border-border bg-card">
  <nav className="container mx-auto px-4 py-4">
    {/* ... */}
  </nav>
</header>
```

### カード
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  {/* ... */}
</div>
```

### ボタン
```tsx
<button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
  Click me
</button>
```

### 入力フィールド
```tsx
<input className="border border-border bg-background text-foreground rounded px-3 py-2 focus:ring-2 focus:ring-blue-500" />
```

## 主要コンポーネント更新リスト

- [x] Header
- [x] Footer
- [x] Navigation
- [x] CourseCard
- [x] CommentItem
- [x] Forms（ログイン、サインアップ、コース作成など）
- [x] Sidebar
- [x] Modal/Dialog

## アイコンパッケージ

```bash
npm install lucide-react  # ✅ インストール済み
```

## テーマの選択肢

1. **Light**: ライトモード
2. **Dark**: ダークモード
3. **System**: システム設定に従う

## アクセシビリティ

- [x] ボタンに `aria-label` 設定
- [x] キーボードナビゲーション対応
- [x] フォーカス表示の確認
- [x] コントラスト比の確認

## パフォーマンス

- [x] `disableTransitionOnChange` で初期レンダリング時のちらつき防止
- [x] `suppressHydrationWarning` でハイドレーション警告抑制
- [x] マウント後にボタンを表示（ハイドレーションエラー防止）

## テスト項目

- [ ] ライトモードとダークモードを切り替えられる
- [ ] システム設定に従うモードが機能する
- [ ] ページリロード後もテーマが保持される
- [ ] 全ページでダークモードが正しく表示される
- [ ] ハイドレーションエラーが発生しない
- [ ] テキストの可読性が保たれる
- [ ] ボーダーやシャドウが適切に表示される

## 注意事項

- `useTheme` は Client Component でのみ使用可能
- ハイドレーションエラーを防ぐため、マウント後に表示
- `suppressHydrationWarning` を `<html>` タグに追加
- 画像の背景色にも注意（透過PNGなど）

## 拡張機能（任意）

- [ ] テーマ選択ドロップダウン（Light/Dark/System）
- [ ] カスタムカラースキーム
- [ ] テーマプリセット（複数のカラーバリエーション）

## 参考

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS - Dark Mode](https://tailwindcss.com/docs/dark-mode)
- CLAUDE.md - スタイリングアーキテクチャ
