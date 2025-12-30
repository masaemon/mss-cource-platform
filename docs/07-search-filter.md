# 07. 検索・フィルター機能

## 概要
コースの検索とカテゴリー別フィルタリング機能の実装

## 実装内容

### 検索機能
- [x] 検索バーコンポーネント作成（`app/_components/search-bar.tsx`）
- [x] 検索結果ページ作成（`app/search/page.tsx`）
- [x] 全文検索実装（タイトル、説明）
- [x] 検索クエリのURL同期（`useSearchParams`）

### カテゴリーフィルター
- [x] カテゴリーフィルターコンポーネント作成（`app/_components/category-filter.tsx`）
- [x] カテゴリー選択時のフィルタリング
- [ ] 複数カテゴリー選択（任意）
- [x] "すべて"オプション

### 検索・フィルター統合
- [x] ホームページに検索バー統合
- [x] ホームページにカテゴリーフィルター統合
- [x] 検索とカテゴリーの組み合わせフィルタリング

### ソート機能（任意）
- [ ] 新着順（別途実装可能）
- [ ] 人気順（視聴数が多い順、別途実装可能）
- [ ] タイトル順（あいうえお順、別途実装可能）

### 検索結果表示
- [x] 検索結果件数表示
- [ ] 検索キーワードハイライト（任意）
- [x] "結果が見つかりません"メッセージ
- [x] ローディング状態表示

## ファイル構成

```
app/
├── page.tsx                     # 検索・フィルター統合
├── search/
│   ├── page.tsx                # 検索結果ページ
│   └── loading.tsx
├── _components/
│   ├── search-bar.tsx
│   ├── category-filter.tsx
│   └── search-results.tsx
└── _lib/
    └── queries/
        └── search.ts
```

## 検索実装

### Server Component（検索結果ページ）
```typescript
// app/search/page.tsx
import { createClient } from '@/app/_lib/supabase/server';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category } = searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('courses')
    .select('*, categories(*), profiles(*)')
    .eq('is_published', true);

  // テキスト検索
  if (q) {
    query = query.or(`title_ja.ilike.%${q}%,title_en.ilike.%${q}%,description_ja.ilike.%${q}%,description_en.ilike.%${q}%`);
  }

  // カテゴリーフィルター
  if (category) {
    query = query.eq('category_id', category);
  }

  const { data: courses } = await query;

  return (
    <div>
      <h1>検索結果: {courses?.length || 0}件</h1>
      {/* 検索結果表示 */}
    </div>
  );
}
```

### Client Component（検索バー）
```typescript
// app/_components/search-bar.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      router.push(`/search?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="コースを検索..."
        className="border rounded px-4 py-2"
      />
      <button type="submit" disabled={isPending}>
        検索
      </button>
    </form>
  );
}
```

### カテゴリーフィルター
```typescript
// app/_components/category-filter.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface Category {
  id: string;
  name_ja: string;
  name_en: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const selectedCategory = searchParams.get('category');

  const handleCategoryChange = (categoryId: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (categoryId) {
        params.set('category', categoryId);
      } else {
        params.delete('category');
      }
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <div>
      <button
        onClick={() => handleCategoryChange(null)}
        disabled={isPending}
      >
        すべて
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.id)}
          disabled={isPending}
        >
          {category.name_ja}
        </button>
      ))}
    </div>
  );
}
```

## 全文検索（Supabase）

### PostgreSQL ILIKE 検索
- 部分一致検索
- 大文字小文字を区別しない
- 日本語・英語両対応

### パフォーマンス最適化（任意）
- PostgreSQL Full Text Search (FTS) の使用
- GINインデックスの追加

```sql
-- Full Text Search用のカラム追加
ALTER TABLE courses ADD COLUMN search_vector tsvector;

-- インデックス作成
CREATE INDEX courses_search_idx ON courses USING gin(search_vector);

-- 自動更新トリガー
CREATE FUNCTION courses_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.title_ja, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.title_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description_ja, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.description_en, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_search_update
BEFORE INSERT OR UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION courses_search_trigger();
```

## URL構造

- ホーム（フィルター付き）: `/?category=xxx`
- 検索: `/search?q=xxx`
- 検索+カテゴリー: `/search?q=xxx&category=yyy`
- ソート: `/search?q=xxx&sort=latest`

## UX向上

- [x] 検索中のローディング表示
- [ ] オートコンプリート（任意）
- [ ] 検索履歴（任意）
- [ ] 人気の検索キーワード表示（任意）
- [x] フィルターのクリアボタン

## アクセシビリティ

- [x] 検索フォームのlabel設定
- [x] キーボードナビゲーション対応
- [x] スクリーンリーダー対応
- [x] フォーカス管理

## パフォーマンス

- [x] デバウンス処理（入力中の過剰な検索防止）
- [ ] 検索結果のページネーション（件数が多い場合）
- [x] キャッシング戦略

## 注意事項

- 検索クエリのサニタイズ
- SQLインジェクション対策（Supabaseが自動処理）
- 空の検索クエリの処理
- 特殊文字のエスケープ

## 拡張機能（任意）

- [ ] ファセット検索（複数条件の組み合わせ）
- [ ] 検索結果のハイライト
- [ ] 関連コースの提案
- [ ] タグ検索
- [ ] 講師名での検索

## テスト項目

- [x] キーワード検索が機能する
- [x] カテゴリーフィルターが機能する
- [x] 検索とカテゴリーの組み合わせが機能する
- [x] 検索結果件数が正しく表示される
- [x] 結果がない場合に適切なメッセージが表示される
- [x] URLパラメータが正しく同期される
- [x] 日本語・英語の両方で検索できる
- [x] フィルターのクリアが機能する

## 参考

- [Next.js - useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [Supabase - Full Text Search](https://supabase.com/docs/guides/database/full-text-search)
- CLAUDE.md - データフェッチング戦略
