# 01. Supabase プロジェクト作成とDB設計実装

## 概要
Supabaseプロジェクトの初期セットアップとデータベーススキーマの実装

## 実装内容

### Supabaseプロジェクト作成
- [x] Supabaseプロジェクトを作成（https://database.new）
  - プロジェクトURL: `https://umebhomnalljmzwvrvts.supabase.co`
- [x] プロジェクトURLとANON KEYを取得（MCP経由で接続済み）
- [x] `.env.local` ファイルを作成し、環境変数を設定
- [x] Supabaseパッケージをインストール（`@supabase/supabase-js`, `@supabase/ssr`）

### データベーステーブル作成
- [x] `profiles` テーブル作成（auth.usersの拡張）
  - Migration: `create_profiles_table` 適用済み
  - `full_name` フィールドは除外（セキュリティ対策）
- [x] `categories` テーブル作成
  - Migration: `create_categories_table` 適用済み
- [x] `courses` テーブル作成
  - Migration: `create_courses_table` 適用済み
- [x] `videos` テーブル作成
  - Migration: `create_videos_table` 適用済み
- [x] `video_progress` テーブル作成
  - Migration: `create_video_progress_table` 適用済み
- [x] `course_comments` テーブル作成
  - Migration: `create_course_comments_table` 適用済み

### インデックス作成
- [x] パフォーマンス最適化用のインデックスを作成
  - [x] `idx_courses_category`
  - [x] `idx_courses_instructor`
  - [x] `idx_courses_is_published`
  - [x] `idx_videos_course`
  - [x] `idx_videos_course_order`
  - [x] `idx_video_progress_user`
  - [x] `idx_video_progress_video`
  - [x] `idx_video_progress_user_video`
  - [x] `idx_comments_course`
  - [x] `idx_comments_user`
  - [x] `idx_comments_parent`
  - [x] `idx_categories_slug`

### Row Level Security (RLS) ポリシー設定
- [x] `profiles` テーブルのRLS有効化とポリシー作成
  - ✅ "Profiles are viewable by everyone" - 全員が閲覧可能
  - ✅ "Users can update own profile" - 自分のプロフィールのみ更新可能
  - ✅ Trigger: `set_profiles_updated_at` - updated_at自動更新
  - ✅ Trigger: `on_auth_user_created` - 新規ユーザー時に自動作成
- [x] `courses` テーブルのRLS有効化とポリシー作成
  - ✅ 公開コースは全員が閲覧可能
  - ✅ 講師・管理者のみコース作成・編集可能
- [x] `videos` テーブルのRLS有効化とポリシー作成
  - ✅ コースの閲覧権限に従う
- [x] `video_progress` テーブルのRLS有効化とポリシー作成
  - ✅ ユーザーは自分の進捗のみ管理可能
- [x] `course_comments` テーブルのRLS有効化とポリシー作成
  - ✅ 公開コースのコメントは全員が閲覧可能
  - ✅ 認証ユーザーがコメント投稿可能
- [x] `categories` テーブルのRLS有効化とポリシー作成
  - ✅ 全員が閲覧可能
  - ✅ 管理者のみ編集可能

### 初期データ投入
- [x] カテゴリーの初期データを投入
  - ✅ 9カテゴリー投入済み（プログラミング、ウェブ開発、モバイル開発、データサイエンス、機械学習、デザイン、ビジネス、マーケティング、その他）

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## SQL実行順序

1. テーブル作成（profiles → categories → courses → videos → video_progress → course_comments）
2. インデックス作成
3. RLSポリシー設定
4. 初期データ投入

## 注意事項

- **必須**: 全てのテーブルでRLSを有効化すること
- `profiles` テーブルは `auth.users` テーブルと `id` で紐づける
- `on delete cascade` を適切に設定してデータの整合性を保つ
- テーブル作成時に外部キー制約を正しく設定する

## 参考

- [Supabase Documentation](https://supabase.com/docs)
- CLAUDE.md - データベース設計セクション
