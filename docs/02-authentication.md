# 02. 認証機能実装

## 概要
Supabase Authを使用したCookie-based認証システムの実装

## 実装内容

### Supabase クライアント作成
- [x] `app/_lib/supabase/client.ts` 作成（Client Components用）
- [x] `app/_lib/supabase/server.ts` 作成（Server Components/Server Actions用）

### Middleware実装
- [x] `middleware.ts` 作成
- [x] セッショントークンのリフレッシュ処理実装
- [x] Cookie処理の実装

### 認証ページ作成
- [x] `app/(auth)/layout.tsx` 作成（認証ページ用レイアウト）
- [x] `app/(auth)/login/page.tsx` 作成（ログインページ）
- [x] `app/(auth)/signup/page.tsx` 作成（サインアップページ）
- [x] `app/(auth)/reset-password/page.tsx` 作成（パスワードリセットページ）
- [x] `app/(auth)/verify-email/page.tsx` 作成（メール確認ページ）

### 認証コールバック
- [x] `app/auth/callback/route.ts` 作成（OAuth/マジックリンク用コールバック）

### Server Actions実装
- [x] `app/_lib/actions/auth.ts` 作成
- [x] `signIn` アクション実装
- [x] `signUp` アクション実装
- [x] `signOut` アクション実装
- [x] `resetPassword` アクション実装

### プロファイル管理
- [x] ユーザー登録時に `profiles` テーブルにレコード自動作成（Database Trigger）
  - ✅ `on_auth_user_created` トリガー（Phase 1で実装済み）
- [x] プロファイル表示ページ作成（`app/profile/page.tsx`）
- [ ] プロファイル更新アクション実装（編集機能は後のフェーズで実装）

### 認証状態管理
- [x] 保護されたページでのユーザー確認処理実装
  - ✅ Middlewareで `/profile`, `/instructor/*`, `/admin/*` を保護
- [x] 未認証ユーザーのリダイレクト処理実装
  - ✅ 未認証時は `/login` にリダイレクト
- [x] ユーザー役割（user/instructor/admin）の確認処理実装
  - ✅ Middlewareで役割に基づくアクセス制御を実装

## ファイル構成

```
app/
├── (auth)/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   └── verify-email/
│       └── page.tsx
├── auth/
│   └── callback/
│       └── route.ts
├── profile/
│   └── page.tsx
├── _lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── actions/
│       └── auth.ts
└── middleware.ts
```

## 重要な実装ポイント

### getUser() vs getSession()
- ✅ サーバーサイドでは必ず `getUser()` を使用
- ❌ サーバーサイドで `getSession()` を使用しない（セキュリティリスク）

### Middleware
- 全てのリクエストでセッショントークンをリフレッシュ
- 静的ファイル（画像、CSS、JSなど）はマッチャーから除外

### Cookie処理
- Server Components では cookie を書き込めないため、try-catch でエラーを無視
- Middleware で適切に cookie を設定

## セキュリティ

- ANON KEYのみクライアントに公開
- SERVICE_ROLE KEYは絶対に公開しない
- RLSポリシーでデータアクセスを制御
- パスワードは平文で保存しない（Supabase Authが自動処理）

## テスト項目

- [x] メール/パスワードでサインアップできる
- [x] メール確認後にログインできる
- [x] ログアウトできる
- [x] パスワードリセットができる
- [x] 未認証ユーザーは保護されたページにアクセスできない
- [x] セッションが自動更新される

## 参考

- [Supabase Auth - Next.js Quickstart](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase Auth - Server-Side](https://supabase.com/docs/guides/auth/server-side/nextjs)
- CLAUDE.md - Supabase Auth 実装パターン
