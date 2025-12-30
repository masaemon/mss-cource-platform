# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

YouTube埋め込み動画を使用したオンライン講座プラットフォームのMVP開発。Udemyのようなインターフェースで、ユーザーが動画講座を視聴し、進捗を管理できるシステム。

### 技術スタック

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **UI Components**: shadcn/ui（導入予定）
- **Icons**: Lucide React（導入予定）
- **多言語対応**: next-intl または i18next（導入予定）
- **ダークモード**: next-themes（導入予定）
- **Deploy**: Vercel

### 想定規模
- 初期ユーザー数: 10人程度
- 一般公開
- 1コースあたり最大10動画

## 開発コマンド

```bash
# 開発サーバー起動 (localhost:3000)
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# リンター実行
npm run lint
```

## データベース設計

### 主要なテーブル構成

#### 1. profiles
Supabase `auth.users` を拡張するプロファイルテーブル。ユーザーの役割（user/instructor/admin）を管理。

**スキーマ**:
- `id` (UUID, PRIMARY KEY): auth.users.id への参照
- `email` (TEXT, NOT NULL): ユーザーのメールアドレス
- `avatar_url` (TEXT): プロフィール画像URL
- `role` (user_role ENUM, NOT NULL, DEFAULT 'user'): ユーザーの役割
- `bio` (TEXT): 自己紹介（主に講師が使用）
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**セキュリティ上の設計判断**:
- `full_name` フィールドは**含めない**（個人情報保護のため）
- 表示名が必要な場合は、emailの@より前の部分を使用するか、匿名表示を実装
- RLSポリシーにより全員が閲覧可能なため、個人情報の露出を最小限に抑える

#### 2. categories
コースのカテゴリー（日本語・英語の名前とスラッグ）

#### 3. courses
- 講座の基本情報（タイトル、説明は日英両対応）
- `instructor_id`: 作成した講師への参照
- `category_id`: カテゴリーへの参照
- `is_published`: 公開フラグ

#### 4. videos
- コースに紐づく動画（1コース最大10本）
- `youtube_url`: YouTube動画URL
- `youtube_video_id`: 埋め込み用のID
- `order_number`: コース内の表示順序
- タイトル・説明は日英両対応

#### 5. video_progress
- ユーザーと動画の視聴進捗を管理
- `is_completed`: 視聴完了フラグ
- ユーザーIDと動画IDの組み合わせでユニーク

#### 6. course_comments
- コースへのコメント
- `is_instructor_reply`: 講師の回答フラグ

### テーブル間のリレーション
```
profiles (1) ─→ (N) courses [instructor_id]
profiles (1) ─→ (N) video_progress [user_id]
profiles (1) ─→ (N) course_comments [user_id]
categories (1) ─→ (N) courses [category_id]
courses (1) ─→ (N) videos [course_id]
courses (1) ─→ (N) course_comments [course_id]
videos (1) ─→ (N) video_progress [video_id]
```

### Row Level Security (RLS) の重要ポリシー

**必須**: 全てのテーブルでRLSを有効化する必要があります。

- **profiles**: 全員が閲覧可能、ユーザーは自分のプロファイルのみ更新可能
- **courses**: 公開済み（`is_published=true`）は全員が閲覧可能、講師・管理者のみ作成・編集可能
- **videos**: コースの閲覧権限に従う
- **video_progress**: ユーザーは自分の進捗のみ閲覧・管理可能
- **course_comments**: 全員が閲覧可能、ログインユーザーが投稿可能、講師は回答可能

## ユーザー役割と権限

### user（一般ユーザー）
- コース閲覧
- 動画視聴
- 視聴進捗管理
- コメント投稿

### instructor（講師）
- 一般ユーザーの全権限
- 全コースの作成・編集・削除
- 動画の追加・編集・削除・順序変更
- コメントへの回答

### admin（管理者）
- 講師の全権限
- ユーザーを講師に昇格
- カテゴリー管理

## ページ構成

### 公開ページ
- `/`: ホーム（コース一覧、カテゴリーフィルター、検索）
- `/courses/[id]`: コース詳細（動画リスト、YouTube埋め込みプレーヤー、視聴進捗、コメント）
- `/search`: 検索結果

### 認証ページ
- `/auth/login`: ログイン
- `/auth/signup`: サインアップ
- `/auth/reset-password`: パスワードリセット

### ユーザーページ
- `/profile`: プロファイル編集、視聴進捗一覧

### 講師ページ
- `/instructor/dashboard`: 講師ダッシュボード（作成したコース一覧）
- `/instructor/courses/new`: コース作成
- `/instructor/courses/[id]/edit`: コース編集（基本情報、動画管理）

### 管理者ページ
- `/admin/dashboard`: 管理ダッシュボード
- `/admin/users`: ユーザー一覧・役割変更
- `/admin/categories`: カテゴリー管理

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# アプリケーション
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 実装の優先順位

### Phase 1: 基礎構築
1. Supabase プロジェクト作成とDB設計実装
2. 認証機能実装
3. 基本的なレイアウト・ナビゲーション

### Phase 2: コアフィーチャー
4. コース一覧・詳細表示
5. 動画視聴機能（YouTube埋め込み）
6. 視聴進捗機能
7. 検索・フィルター機能

### Phase 3: 管理機能
8. 講師：コース作成・編集機能
9. 講師：動画管理機能
10. Admin：ユーザー管理機能

### Phase 4: コミュニケーション機能
11. コメント投稿機能
12. 講師の回答機能

### Phase 5: 仕上げ
13. ダークモード実装
14. 多言語対応
15. UI/UX改善・レスポンシブ最適化

## Next.js App Router ベストプラクティス

### Server Components と Client Components の使い分け

**デフォルトは Server Components を使用**し、以下の場合のみ Client Components (`"use client"`) を使用：

- **Client Components が必要なケース**:
  - YouTube埋め込みプレーヤー（IFrame API、再生状態管理）
  - 視聴進捗チェックボックス（インタラクティブなUI）
  - フォーム入力フィールド（onChange、onSubmitイベント）
  - ダークモード切り替え（useState、useTheme）
  - モーダル、ドロップダウン、トースト通知
  - useRouter, usePathname, useSearchParams などのhooks使用時

- **Server Components を使用すべきケース**:
  - コース一覧表示
  - 動画リスト表示
  - コメント表示
  - ユーザープロファイル表示
  - 静的なレイアウトコンポーネント

### ファイル構成とコロケーション

```
app/
├── (auth)/                    # Route Group: 認証ページ用レイアウト
│   ├── layout.tsx            # 認証ページ共通レイアウト
│   ├── login/
│   └── signup/
├── (dashboard)/              # Route Group: ダッシュボード用レイアウト
│   ├── layout.tsx           # ダッシュボード共通レイアウト（サイドバー等）
│   ├── instructor/
│   └── admin/
├── courses/
│   └── [id]/
│       ├── page.tsx         # コース詳細ページ
│       ├── loading.tsx      # ローディングUI
│       ├── error.tsx        # エラーUI
│       └── _components/     # このルート専用のコンポーネント（アンダースコアでルーティング除外）
├── _components/             # 共有コンポーネント
├── _lib/                    # ユーティリティ、ヘルパー関数
│   ├── supabase/           # Supabase クライアント
│   ├── actions/            # Server Actions
│   └── utils/              # 汎用ユーティリティ
└── api/                     # API Routes（必要に応じて）
```

### データフェッチング戦略

#### 1. コース一覧（`/` ホームページ）
```typescript
// Server Component でデータフェッチ
export const revalidate = 3600; // ISR: 1時間ごとに再生成

async function getPublishedCourses() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('courses')
    .select('*, categories(*), profiles(*)')
    .eq('is_published', true);
  return data;
}
```

#### 2. コース詳細（`/courses/[id]`）
```typescript
// Dynamic Metadata生成
export async function generateMetadata({ params }): Promise<Metadata> {
  const course = await getCourse(params.id);
  return {
    title: course.title_ja,
    description: course.description_ja,
  };
}

// SSR: 常に最新のデータを取得
async function getCourse(id: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('courses')
    .select('*, videos(*), profiles(*)')
    .eq('id', id)
    .single();
  return data;
}
```

#### 3. ユーザー固有データ（視聴進捗）
```typescript
// 認証ユーザーの進捗データはキャッシュしない
export const dynamic = 'force-dynamic';

async function getUserProgress(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId);
  return data;
}
```

### Server Actions

フォーム送信、データ変更には Server Actions を使用：

```typescript
// app/_lib/actions/video-progress.ts
'use server'

import { revalidatePath } from 'next/cache';

export async function toggleVideoProgress(videoId: string, isCompleted: boolean) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  await supabase
    .from('video_progress')
    .upsert({
      user_id: user.id,
      video_id: videoId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    });

  revalidatePath('/courses/[id]');
}
```

### Loading UI と Error UI

各ルートに `loading.tsx` と `error.tsx` を配置：

```typescript
// app/courses/[id]/loading.tsx
export default function Loading() {
  return <CourseDetailSkeleton />;
}

// app/courses/[id]/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

### Middleware による認証保護

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();

  // 講師・管理者専用ページの保護
  if (request.nextUrl.pathname.startsWith('/instructor')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url));
    // 役割チェック...
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/instructor/:path*', '/admin/:path*', '/profile/:path*'],
};
```

### Metadata API の使用

SEO最適化のため、各ページで適切なメタデータを設定：

```typescript
// app/courses/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const course = await getCourse(params.id);

  return {
    title: `${course.title_ja} | MSS Course Platform`,
    description: course.description_ja,
    openGraph: {
      title: course.title_ja,
      description: course.description_ja,
      images: [course.thumbnail_url],
    },
  };
}
```

### Route Groups の活用

認証ページとダッシュボードで異なるレイアウトを使用：

- `(auth)`: ヘッダー/フッターなしのシンプルなレイアウト
- `(dashboard)`: サイドバー付きのダッシュボードレイアウト
- それ以外: 通常のヘッダー/フッター付きレイアウト

### キャッシングとRevalidation

- **静的コンテンツ（公開コース一覧）**: ISR (`revalidate: 3600`)
- **動的コンテンツ（ユーザー進捗）**: `dynamic = 'force-dynamic'`
- **データ変更後**: `revalidatePath()` または `revalidateTag()` で再検証

## Supabase Auth 実装パターン

このプロジェクトでは **Cookie-based authentication** を使用します。

### 必要なパッケージ

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# または
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

### コンテキスト別のクライアント作成

#### 1. Client Components 用

```typescript
// app/_lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### 2. Server Components / Server Actions 用

```typescript
// app/_lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components から cookie を書き込めないため、エラーを無視
          }
        },
      },
    }
  );
}
```

### Middleware によるセッション更新（必須）

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // セッショントークンをリフレッシュ（重要）
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 認証コールバック Route Handler

OAuth、マジックリンク認証用のコールバック：

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
```

### 認証 Server Actions

```typescript
// app/_lib/actions/auth.ts
'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/auth/verify-email');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
```

### ユーザー取得の重要な違い

#### ✅ 推奨: `getUser()` を使用（サーバーサイド）

```typescript
const supabase = await createClient();
const {
  data: { user },
  error,
} = await supabase.auth.getUser();

if (error || !user) {
  redirect('/auth/login');
}
```

**理由**: JWT署名を公開鍵で検証するため、セキュリティが高い。

#### ❌ 非推奨: `getSession()` をサーバーサイドで使用しない

```typescript
// サーバーサイドでは使用しないこと
const { data: { session } } = await supabase.auth.getSession();
```

**理由**: トークンの再検証が保証されないため、セキュリティリスクがある。

### 保護されたページの実装

#### Server Component での保護

```typescript
// app/profile/page.tsx
import { createClient } from '@/app/_lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // ユーザーの役割を確認
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return <div>Welcome, {user.email}</div>;
}
```

#### Client Component での認証状態監視

```typescript
'use client';

import { createClient } from '@/app/_lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!user) return <div>Not authenticated</div>;

  return <div>Logged in as {user.email}</div>;
}
```

### セキュリティのベストプラクティス

1. **必ず `getUser()` を使用**: サーバーサイドでの認証確認は `getUser()` を使用
2. **Middleware でセッション更新**: 全てのリクエストでトークンをリフレッシュ
3. **RLS を有効化**: データベースレベルでアクセス制御を実装
4. **環境変数の管理**: ANON キーのみクライアントに公開、SERVICE_ROLE キーは絶対に公開しない
5. **認証コールバックの実装**: OAuth、マジックリンク用の `/auth/callback` を実装
6. **エラーハンドリング**: 認証エラーを適切に処理し、ユーザーにフィードバック

## TypeScript設定

- **Path Mapping**: `@/*` はプロジェクトルートを指す
- **Module Resolution**: `bundler` モード
- **JSX**: 新しい `react-jsx` トランスフォーム使用（React のインポート不要）
- **Strict Mode**: 有効

## スタイリングアーキテクチャ

Tailwind CSS v4を使用：
- `globals.css` でCSS変数を定義（`--background`, `--foreground`）
- `@theme inline` ディレクティブでCSS変数をTailwindトークンにマッピング
- `prefers-color-scheme` メディアクエリでダークモード対応
- フォント変数（`--font-geist-sans`, `--font-geist-mono`）はlayoutから注入

## 重要な実装上の注意事項

### YouTube埋め込み
- YouTube IFrame Player APIを使用
- `youtube_video_id` を抽出してiframeで埋め込む
- プライバシーモード（`youtube-nocookie.com`）の使用を検討
- 埋め込み可能な動画のみ使用可能

### セキュリティ
- **必須**: Supabase RLSを全テーブルで有効化
- ユーザー入力のサニタイズ（XSS対策）
- 環境変数の適切な管理
- **個人情報保護**: RLSで公開されるテーブルには最小限の個人情報のみ保存
  - `profiles` テーブルには `full_name` や電話番号などの詳細な個人情報を含めない
  - 必要に応じて `auth.users.raw_user_meta_data` から情報を取得（サーバーサイドのみ）

### 多言語対応
- データベースのテキストフィールドは `_ja` と `_en` サフィックスで日英両対応
- 現在のロケールに応じて適切なフィールドを表示

### パフォーマンス
- Next.js Imageコンポーネントで画像最適化
- コース数が増えた場合のページネーション実装
- 適切なキャッシング戦略
