# 12. 講師の回答機能

## 概要
講師がコメントに回答する機能の実装

## 実装内容

### 講師回答UI
- [x] コメントに「返信」ボタン追加（講師・管理者のみ表示）
- [x] 回答フォーム表示/非表示切り替え
- [x] 講師回答の視覚的な区別（背景色、バッジなど）
- [x] 回答先のコメントを明示

### 回答投稿機能
- [x] 講師回答 Server Action 実装
- [x] `is_instructor_reply` フラグを `true` に設定
- [x] 権限チェック（講師・管理者のみ）

### 回答表示
- [x] 講師回答を通常コメントと区別
- [x] "講師" または "管理者" バッジ表示
- [x] ハイライト表示（背景色変更など）

## ファイル構成

```
app/
├── courses/
│   └── [id]/
│       └── _components/
│           ├── comment-item.tsx      # 更新
│           ├── instructor-reply-form.tsx
│           └── reply-button.tsx
└── _lib/
    └── actions/
        └── comments.ts               # 更新
```

## Server Actions実装

```typescript
// app/_lib/actions/comments.ts に追加
'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addInstructorReply(courseId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // ユーザーの役割チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['instructor', 'admin'].includes(profile.role)) {
    throw new Error('Forbidden: Only instructors and admins can reply');
  }

  // コースの講師チェック（任意：自分のコースのみ回答可能にする場合）
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single();

  if (
    profile.role !== 'admin' &&
    course?.instructor_id !== user.id
  ) {
    throw new Error('You can only reply to comments on your own courses');
  }

  if (!content.trim()) {
    throw new Error('回答を入力してください');
  }

  if (content.length > 1000) {
    throw new Error('回答は1000文字以内で入力してください');
  }

  const commentData = {
    course_id: courseId,
    user_id: user.id,
    content: content.trim(),
    is_instructor_reply: true, // 講師回答フラグ
  };

  const { error } = await supabase.from('course_comments').insert(commentData);

  if (error) throw error;

  revalidatePath(`/courses/${courseId}`);
}
```

## RLSポリシー更新

```sql
-- 講師・管理者がコメント投稿可能（is_instructor_reply = true）
CREATE POLICY "Instructors and admins can reply to comments"
ON course_comments FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (
    is_instructor_reply = false OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('instructor', 'admin')
    )
  )
);
```

## 講師回答フォーム

```typescript
// app/courses/[id]/_components/instructor-reply-form.tsx
'use client';

import { useState, useTransition } from 'react';
import { addInstructorReply } from '@/app/_lib/actions/comments';

interface InstructorReplyFormProps {
  courseId: string;
  onCancel: () => void;
}

export function InstructorReplyForm({
  courseId,
  onCancel,
}: InstructorReplyFormProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await addInstructorReply(courseId, content);
        setContent('');
        onCancel(); // フォームを閉じる
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 ml-12 space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="講師として回答..."
          rows={3}
          maxLength={1000}
          className="w-full border rounded px-3 py-2 text-sm"
          disabled={isPending}
          autoFocus
        />
        <div className="text-xs text-gray-500 mt-1">
          {content.length} / 1000
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
        >
          {isPending ? '投稿中...' : '回答を投稿'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
```

## コメントアイテム更新

```typescript
// app/courses/[id]/_components/comment-item.tsx 更新
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { InstructorReplyForm } from './instructor-reply-form';

interface CommentItemProps {
  comment: Comment;
  courseId: string;
  currentUserRole?: string;
  courseInstructorId?: string;
}

export function CommentItem({
  comment,
  courseId,
  currentUserRole,
  courseInstructorId,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isInstructor =
    comment.is_instructor_reply ||
    ['instructor', 'admin'].includes(comment.profiles.role);

  const canReply =
    currentUserRole &&
    ['instructor', 'admin'].includes(currentUserRole) &&
    !comment.is_instructor_reply; // 講師回答には返信不可

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

          {canReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              {showReplyForm ? 'キャンセル' : '返信'}
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <InstructorReplyForm
          courseId={courseId}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
    </div>
  );
}
```

## コース詳細ページ更新

```typescript
// app/courses/[id]/page.tsx 更新
export default async function CoursePage({ params }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const course = await getCourse(params.id);
  const comments = await getCourseComments(params.id);

  let userRole = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role;
  }

  return (
    <div>
      {/* ... */}
      <CommentList
        comments={comments}
        courseId={params.id}
        currentUserRole={userRole}
        courseInstructorId={course.instructor_id}
      />
    </div>
  );
}
```

## 権限チェック

### Server Side
- 講師・管理者のみ `is_instructor_reply = true` でコメント投稿可能
- 自分のコースのみ回答可能（任意：管理者は全コース回答可能）

### Client Side
- 講師・管理者のみ「返信」ボタンを表示
- 一般ユーザーには回答フォームを表示しない

## 表示の違い

### 通常のコメント
- 背景: グレー
- バッジ: なし

### 講師の回答
- 背景: ライトブルー
- 左ボーダー: ブルー
- バッジ: "講師" または "管理者"

## 通知機能（任意）

- [ ] コメント投稿時に講師にメール通知
- [ ] 講師回答時にコメント投稿者にメール通知
- [ ] Supabase Edge Functions でメール送信

## テスト項目

- [ ] 講師・管理者のみ「返信」ボタンが表示される
- [ ] 講師が回答を投稿できる
- [ ] 講師回答が視覚的に区別される
- [ ] 一般ユーザーは回答を投稿できない
- [ ] 講師回答にはバッジが表示される
- [ ] 回答後にフォームが閉じる
- [ ] 自分のコースのみ回答可能（任意）
- [ ] 管理者は全コースに回答可能

## 参考

- CLAUDE.md - ユーザー役割と権限
- CLAUDE.md - Server Actions
