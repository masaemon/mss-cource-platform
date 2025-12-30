# 11. コメント投稿機能

## 概要
コース詳細ページでのコメント投稿・表示機能の実装

## 実装内容

### コメント表示UI
- [x] コース詳細ページにコメントセクション追加
- [x] コメントリストコンポーネント作成
- [x] コメント表示（ユーザー名、アバター、投稿日時、内容）
- [x] 講師の回答を視覚的に区別

### コメント投稿フォーム
- [x] コメント投稿フォーム作成
- [ ] テキストエリア（マークダウン対応、任意）
- [x] 文字数カウンター（任意）
- [x] 投稿ボタン

### コメント機能
- [x] コメント取得関数実装
- [x] コメント投稿 Server Action 実装
- [ ] リアルタイム更新（任意）
- [ ] ページネーション/無限スクロール（任意）

### 認証確認
- [x] 未認証ユーザーにはログインを促すメッセージ表示
- [x] 認証済みユーザーのみコメント投稿可能

## ファイル構成

```
app/
├── courses/
│   └── [id]/
│       └── _components/
│           ├── comments-section.tsx
│           ├── comment-list.tsx
│           ├── comment-item.tsx
│           └── comment-form.tsx
└── _lib/
    ├── queries/
    │   └── comments.ts
    └── actions/
        └── comments.ts
```

## データベース設計

### course_comments テーブル
- `id`: UUID
- `course_id`: コースID
- `user_id`: ユーザーID
- `content`: コメント内容
- `is_instructor_reply`: 講師の回答フラグ
- `created_at`: 作成日時
- `updated_at`: 更新日時

## Server Actions実装

```typescript
// app/_lib/actions/comments.ts
'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addComment(courseId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  if (!content.trim()) {
    throw new Error('コメントを入力してください');
  }

  if (content.length > 1000) {
    throw new Error('コメントは1000文字以内で入力してください');
  }

  const commentData = {
    course_id: courseId,
    user_id: user.id,
    content: content.trim(),
    is_instructor_reply: false,
  };

  const { error } = await supabase.from('course_comments').insert(commentData);

  if (error) throw error;

  revalidatePath(`/courses/${courseId}`);
}
```

## コメント取得

```typescript
// app/_lib/queries/comments.ts
import { createClient } from '@/app/_lib/supabase/server';

export async function getCourseComments(courseId: string) {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from('course_comments')
    .select(
      `
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        role
      )
    `
    )
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return comments;
}
```

## コメントフォーム

```typescript
// app/courses/[id]/_components/comment-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { addComment } from '@/app/_lib/actions/comments';

interface CommentFormProps {
  courseId: string;
}

export function CommentForm({ courseId }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await addComment(courseId, content);
        setContent(''); // 成功時はクリア
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力..."
          rows={4}
          maxLength={1000}
          className="w-full border rounded px-3 py-2"
          disabled={isPending}
        />
        <div className="text-sm text-gray-500 mt-1">
          {content.length} / 1000
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isPending ? '投稿中...' : 'コメントを投稿'}
      </button>
    </form>
  );
}
```

## コメント表示

```typescript
// app/courses/[id]/_components/comment-item.tsx
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_instructor_reply: boolean;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  };
}

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const isInstructor =
    comment.is_instructor_reply ||
    ['instructor', 'admin'].includes(comment.profiles.role);

  return (
    <div
      className={`p-4 rounded ${isInstructor ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-gray-50'}`}
    >
      <div className="flex items-start gap-3">
        {comment.profiles.avatar_url ? (
          <img
            src={comment.profiles.avatar_url}
            alt={comment.profiles.full_name || 'User'}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {comment.profiles.full_name || '匿名ユーザー'}
            </span>
            {isInstructor && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                講師
              </span>
            )}
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ja,
              })}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>
    </div>
  );
}
```

## コース詳細ページへの統合

```typescript
// app/courses/[id]/page.tsx
import { getCourseComments } from '@/app/_lib/queries/comments';
import { CommentList } from './_components/comment-list';
import { CommentForm } from './_components/comment-form';

export default async function CoursePage({ params }) {
  const course = await getCourse(params.id);
  const comments = await getCourseComments(params.id);
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      {/* コース情報、動画プレーヤーなど */}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">コメント</h2>
        {user ? (
          <CommentForm courseId={params.id} />
        ) : (
          <p className="text-gray-600">
            コメントを投稿するには
            <a href="/auth/login" className="text-blue-600 underline">
              ログイン
            </a>
            してください
          </p>
        )}
        <div className="mt-6">
          <CommentList comments={comments} />
        </div>
      </div>
    </div>
  );
}
```

## RLSポリシー

```sql
-- コメントは全員が閲覧可能
CREATE POLICY "Comments are viewable by everyone"
ON course_comments FOR SELECT
USING (true);

-- ログインユーザーがコメント投稿可能
CREATE POLICY "Authenticated users can create comments"
ON course_comments FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_instructor_reply = false);
```

## バリデーション

- [x] コメント内容が空でないことを確認
- [x] 文字数制限（1000文字）
- [x] XSS対策（ユーザー入力のサニタイズ）

## UX向上

- [x] 投稿後にフォームをクリア
- [ ] 楽観的UI更新（任意）
- [x] エラーメッセージ表示
- [x] 投稿中のローディング表示
- [x] コメント数の表示

## 拡張機能（任意）

- [ ] コメント編集
- [x] コメント削除（自分のコメント + 管理者権限）
- [ ] コメントへの返信（スレッド形式）
- [ ] いいね機能
- [ ] マークダウン対応
- [ ] リアルタイム更新（Supabase Realtime）
- [ ] コメント通知

## アクセシビリティ

- [x] フォームのlabel設定
- [ ] キーボードナビゲーション対応
- [ ] スクリーンリーダー対応

## 注意事項

- コメント内容のサニタイズ
- スパム対策（レート制限、任意）
- 不適切なコメントの報告機能（任意）
- コメント投稿時のリダイレクトではなく、その場で更新

## テスト項目

- [ ] コメントが表示される
- [ ] 認証済みユーザーがコメントを投稿できる
- [ ] 未認証ユーザーにはログインを促すメッセージが表示される
- [ ] 講師のコメントが視覚的に区別される
- [ ] 投稿後にフォームがクリアされる
- [ ] エラーメッセージが表示される
- [ ] 文字数制限が機能する
- [ ] 日時が正しく表示される

## 参考

- [date-fns Documentation](https://date-fns.org/)
- CLAUDE.md - Server Actions
