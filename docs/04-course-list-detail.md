# 04. コース一覧・詳細表示

## 概要
公開コースの一覧表示と詳細ページの実装

## 実装内容

### コース一覧ページ
- [x] `app/page.tsx` 更新（ホームページ = コース一覧）
- [x] コース一覧取得関数実装（`app/_lib/queries/courses.ts`）
- [x] コースカードコンポーネント作成（`app/_components/course-card.tsx`）
- [x] グリッドレイアウト実装
- [x] ISR設定（`revalidate: 3600`）

### コース詳細ページ
- [x] `app/courses/[id]/page.tsx` 作成
- [x] コース詳細取得関数実装
- [x] 動的メタデータ生成（`generateMetadata`）
- [x] コース情報表示（タイトル、説明、カテゴリー）
- [x] 動画リスト表示（order_number順）
- [x] 講師情報表示（名前、アバター）

### カテゴリーフィルター
- [x] カテゴリー一覧取得関数実装（`getCategories`）
- [x] カテゴリーフィルターUI作成（Phase 2の検索・フィルター機能で実装済み）
- [x] カテゴリー別コース表示実装（Phase 2の検索・フィルター機能で実装済み）

### ローディング・エラーUI
- [x] `app/loading.tsx` 作成（スケルトンローダー）
- [x] `app/courses/[id]/loading.tsx` 作成
- [x] `app/error.tsx` 作成
- [x] `app/courses/[id]/not-found.tsx` 作成（404ページ）

### レスポンシブデザイン
- [x] モバイル表示最適化（1カラム）
- [x] タブレット表示最適化（2カラム）
- [x] デスクトップ表示最適化（3カラム）

## データフェッチング

### コース一覧（ISR）
```typescript
// app/page.tsx
export const revalidate = 3600; // 1時間ごとに再生成

async function getPublishedCourses() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('courses')
    .select('*, categories(*), profiles(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return data;
}
```

### コース詳細（SSR）
```typescript
// app/courses/[id]/page.tsx
async function getCourse(id: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('courses')
    .select('*, videos(*), profiles(*), categories(*)')
    .eq('id', id)
    .single();
  return data;
}
```

## ファイル構成

```
app/
├── page.tsx                     # コース一覧
├── loading.tsx
├── error.tsx
├── courses/
│   └── [id]/
│       ├── page.tsx            # コース詳細
│       ├── loading.tsx
│       └── error.tsx
├── _components/
│   ├── course-card.tsx
│   ├── category-filter.tsx
│   └── course-detail/
│       ├── course-info.tsx
│       ├── video-list.tsx
│       └── instructor-info.tsx
└── _lib/
    └── queries/
        └── courses.ts
```

## 表示内容

### コースカード
- サムネイル画像
- コースタイトル（現在のロケールに応じて `title_ja` or `title_en`）
- コース説明（短縮版）
- カテゴリー名
- 講師名
- 作成日

### コース詳細ページ
- コースタイトル
- コース説明（全文）
- サムネイル画像
- カテゴリー
- 講師情報（名前、アバター）
- 動画リスト（`order_number` 順）
- 公開状態（講師・管理者のみ表示）

## SEO対策

### メタデータ
- [x] 動的タイトル生成
- [x] 動的説明文生成
- [x] Open Graph設定
- [ ] Twitter Card設定

```typescript
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

## パフォーマンス最適化

- [x] Next.js Image コンポーネント使用
- [x] 画像の最適化（サムネイル）
- [x] ISRによるキャッシング
- [x] 適切なfetchオプション設定

## 注意事項

- 多言語対応: 現在のロケールに応じて `_ja` または `_en` フィールドを表示
- 公開フラグ: `is_published = true` のコースのみ表示
- RLS: 未公開コースは講師・管理者のみ閲覧可能
- 画像がない場合のフォールバック表示

## テスト項目

- [x] 公開コースのみ一覧に表示される
- [x] カテゴリーフィルターが機能する
- [x] コース詳細ページが正しく表示される
- [x] 存在しないコースIDでエラーページが表示される
- [x] ローディング中にスケルトンが表示される
- [x] レスポンシブデザインが正しく動作する
- [x] 画像が最適化されて表示される
- [x] メタデータが正しく生成される

## 参考

- [Next.js - Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js - Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- CLAUDE.md - データフェッチング戦略
