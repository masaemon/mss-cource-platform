# 03. 基本的なレイアウト・ナビゲーション

## 概要
アプリケーション全体のレイアウト構造とナビゲーションの実装

## 実装内容

### 共通レイアウトコンポーネント
- [x] `app/_components/header.tsx` 作成（ヘッダー）
- [x] `app/_components/footer.tsx` 作成（フッター）
- [x] `app/_components/navigation.tsx` 作成（ナビゲーションメニュー）
- [x] `app/_components/user-menu.tsx` 作成（ユーザーメニュー）

### ルートレイアウト更新
- [x] `app/layout.tsx` 更新（ヘッダー・フッター追加）
- [x] メタデータ設定（タイトル、説明）
- [x] フォント設定の確認

### Route Groups レイアウト
- [x] `app/(auth)/layout.tsx` 作成（認証ページ用：シンプルなレイアウト）
  - ✅ Phase 2で実装済み
- [x] `app/(dashboard)/layout.tsx` 作成（ダッシュボード用：サイドバー付き）
- [x] サイドバーコンポーネント作成（`app/_components/sidebar.tsx`）

### ナビゲーション機能
- [x] ログイン状態に応じたメニュー表示切り替え
  - ✅ Navigation/UserMenuコンポーネントで実装
- [x] ユーザー役割（user/instructor/admin）に応じたメニュー表示
  - ✅ Navigation/UserMenu/Sidebarで役割に応じた表示
- [x] アクティブリンクのハイライト
  - ✅ `usePathname`でアクティブリンクを判定
- [ ] モバイルメニュー（ハンバーガーメニュー）実装
  - Navigation は `hidden md:flex` でモバイル非表示
  - UserMenuは全画面で表示
  - ハンバーガーメニューは後のフェーズで実装可能

### レスポンシブ対応
- [x] モバイル表示の最適化（sm: 640px〜）
  - ✅ Tailwind responsive classesを使用
- [x] タブレット表示の最適化（md: 768px〜）
  - ✅ md:ブレークポイントでナビゲーション表示
- [x] デスクトップ表示の最適化（lg: 1024px〜）
  - ✅ max-w-7xl コンテナで制限

## ナビゲーション構成

### 公開ナビゲーション（未認証ユーザー）
- ホーム (`/`)
- コース一覧 (`/courses`)
- ログイン (`/auth/login`)
- サインアップ (`/auth/signup`)

### 認証済みユーザー
- ホーム (`/`)
- コース一覧 (`/courses`)
- マイページ (`/profile`)
- ログアウト

### 講師（instructor）
- 上記全て
- 講師ダッシュボード (`/instructor/dashboard`)
- コース作成 (`/instructor/courses/new`)

### 管理者（admin）
- 上記全て
- 管理ダッシュボード (`/admin/dashboard`)
- ユーザー管理 (`/admin/users`)
- カテゴリー管理 (`/admin/categories`)

## ファイル構成

```
app/
├── layout.tsx                    # ルートレイアウト
├── (auth)/
│   └── layout.tsx               # 認証ページ用レイアウト
├── (dashboard)/
│   └── layout.tsx               # ダッシュボード用レイアウト
└── _components/
    ├── header.tsx
    ├── footer.tsx
    ├── navigation.tsx
    ├── user-menu.tsx
    └── sidebar.tsx
```

## デザイン要件

### ヘッダー
- ロゴ/サイト名
- ナビゲーションメニュー
- ユーザーメニュー（ログイン状態に応じて）
- 検索バー（任意）

### フッター
- コピーライト
- リンク集（利用規約、プライバシーポリシーなど）
- ソーシャルメディアリンク（任意）

### サイドバー（ダッシュボード）
- ダッシュボードナビゲーション
- コンテンツ管理メニュー
- 設定メニュー

## Tailwind CSS設定

- レスポンシブブレークポイントの活用
- CSS変数（`--background`, `--foreground`）の使用
- ダークモード対応の準備（`dark:` プレフィックス）

## アクセシビリティ

- [x] セマンティックHTML使用（`<nav>`, `<header>`, `<footer>`）
- [x] キーボードナビゲーション対応
- [x] ARIA属性の適切な設定
- [x] フォーカス表示の実装

## 注意事項

- Route Groups `(auth)`, `(dashboard)` はURL構造に影響しない
- 認証状態の確認は Server Component で行う（`getUser()`）
- ナビゲーションリンクは `next/link` を使用
- アクティブリンクの判定には `usePathname` (Client Component) を使用

## テスト項目

- [x] 全てのページでヘッダー・フッターが表示される
- [x] 認証ページではシンプルなレイアウトが表示される
- [x] ダッシュボードではサイドバーが表示される
- [ ] モバイルでハンバーガーメニューが機能する（未実装）
- [x] ユーザー役割に応じて適切なメニューが表示される
- [x] アクティブリンクがハイライトされる

## 参考

- [Next.js - Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Next.js - Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- CLAUDE.md - ファイル構成とコロケーション
