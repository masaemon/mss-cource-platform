# 15. UI/UX改善・レスポンシブ最適化

## 概要
全体的なUI/UXの改善とレスポンシブデザインの最適化

## 実装内容

### レスポンシブデザイン最適化
- [x] モバイル表示の改善（320px〜）
- [x] タブレット表示の改善（768px〜）
- [x] デスクトップ表示の改善（1024px〜）
- [x] グリッドレイアウトのブレークポイント調整

### UI コンポーネントの洗練
- [x] ボタンスタイルの統一
- [x] フォームスタイルの統一
- [x] カードデザインの統一
- [x] タイポグラフィの調整

### アニメーション・トランジション
- [ ] ページ遷移のアニメーション（将来対応）
- [x] ホバーエフェクト
- [x] ローディングアニメーション
- [x] モーダルのフェードイン/アウト

### UX改善
- [x] ローディング状態の明示
- [x] エラーメッセージの改善
- [ ] 成功メッセージ（トースト通知）（将来対応）
- [x] フォームバリデーションのフィードバック
- [ ] スケルトンローダーの追加（将来対応）

### パフォーマンス最適化
- [x] 画像の遅延読み込み（Next.js Image使用）
- [x] コンポーネントの Code Splitting（Next.js自動対応）
- [x] フォントの最適化（Geistフォント使用）
- [x] CSSの最小化（Tailwind CSS使用）

### アクセシビリティ改善
- [x] キーボードナビゲーション
- [x] スクリーンリーダー対応（sr-onlyクラス）
- [x] フォーカス表示の改善
- [x] カラーコントラスト確認

### shadcn/ui 導入
- [ ] shadcn/ui をセットアップ
- [ ] Button コンポーネント
- [ ] Input コンポーネント
- [ ] Card コンポーネント
- [ ] Dialog コンポーネント
- [ ] DropdownMenu コンポーネント
- [ ] Toast コンポーネント

## shadcn/ui セットアップ

```bash
npx shadcn@latest init
```

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add skeleton
```

## レスポンシブブレークポイント

### Tailwind CSS デフォルト
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### コース一覧グリッド
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {courses.map((course) => (
    <CourseCard key={course.id} course={course} />
  ))}
</div>
```

### コース詳細レイアウト
```tsx
<div className="flex flex-col lg:flex-row gap-8">
  <div className="lg:w-2/3">
    {/* 動画プレーヤー */}
  </div>
  <div className="lg:w-1/3">
    {/* 動画リスト */}
  </div>
</div>
```

## トースト通知

```typescript
// app/_components/toast-provider.tsx
'use client';

import { Toaster } from '@/components/ui/toaster';

export function ToastProvider() {
  return <Toaster />;
}
```

```typescript
// app/layout.tsx に追加
import { ToastProvider } from './_components/toast-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
```

```typescript
// 使用例
import { useToast } from '@/hooks/use-toast';

export function SomeComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: '成功',
      description: 'コースを作成しました',
    });
  };

  return <button onClick={handleSuccess}>作成</button>;
}
```

## スケルトンローダー

```tsx
// app/_components/course-card-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function CourseCardSkeleton() {
  return (
    <div className="border rounded-lg p-4">
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
```

```tsx
// app/loading.tsx
import { CourseCardSkeleton } from './_components/course-card-skeleton';

export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

## アニメーション

### ホバーエフェクト
```tsx
<button className="transition-all hover:scale-105 hover:shadow-lg">
  Click me
</button>
```

### フェードイン
```tsx
<div className="animate-in fade-in duration-300">
  {/* Content */}
</div>
```

## モバイルメニュー

```tsx
// app/_components/mobile-menu.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-black border-b">
          <nav className="flex flex-col p-4">
            <a href="/" className="py-2">
              ホーム
            </a>
            <a href="/courses" className="py-2">
              コース
            </a>
            {/* ... */}
          </nav>
        </div>
      )}
    </div>
  );
}
```

## フォームバリデーション

```tsx
// react-hook-form + zod を使用（任意）
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください'),
});

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      {/* ... */}
    </form>
  );
}
```

## パフォーマンス最適化

### 画像の最適化
```tsx
import Image from 'next/image';

<Image
  src={course.thumbnail_url}
  alt={course.title_ja}
  width={400}
  height={300}
  className="rounded-lg"
  loading="lazy"
/>;
```

### 動的インポート
```tsx
import dynamic from 'next/dynamic';

const YouTubePlayer = dynamic(
  () => import('./_components/youtube-player'),
  {
    loading: () => <p>Loading player...</p>,
    ssr: false, // クライアントサイドのみ
  }
);
```

## アクセシビリティ

### フォーカス表示
```css
/* globals.css に追加 */
*:focus-visible {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 2px;
}
```

### ARIA属性
```tsx
<button aria-label="メニューを開く" aria-expanded={isOpen}>
  <Menu />
</button>
```

### セマンティックHTML
```tsx
<main>
  <article>
    <header>
      <h1>コースタイトル</h1>
    </header>
    <section>
      <h2>説明</h2>
      <p>...</p>
    </section>
  </article>
</main>
```

## カラーパレット統一

```css
/* globals.css */
@theme inline {
  /* Primary */
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;

  /* Secondary */
  --color-secondary: #64748b;
  --color-secondary-foreground: #ffffff;

  /* Success */
  --color-success: #22c55e;
  --color-success-foreground: #ffffff;

  /* Danger */
  --color-danger: #ef4444;
  --color-danger-foreground: #ffffff;

  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-foreground: #000000;
}
```

## タイポグラフィ

```tsx
// 見出し
<h1 className="text-4xl font-bold tracking-tight">Title</h1>
<h2 className="text-3xl font-semibold">Subtitle</h2>
<h3 className="text-2xl font-semibold">Section</h3>

// 本文
<p className="text-base leading-7">Body text</p>

// 小さいテキスト
<span className="text-sm text-gray-600 dark:text-gray-400">Small text</span>
```

## テスト項目

- [ ] 全ページがモバイルで正しく表示される
- [ ] タブレットで正しく表示される
- [ ] デスクトップで正しく表示される
- [ ] タッチ操作が機能する
- [ ] キーボードナビゲーションが機能する
- [ ] スクリーンリーダーで読み上げられる
- [ ] カラーコントラストが十分
- [ ] ローディング状態が明示される
- [ ] エラーメッセージが分かりやすい
- [ ] アニメーションがスムーズ

## 参考

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS - Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- CLAUDE.md - スタイリングアーキテクチャ
