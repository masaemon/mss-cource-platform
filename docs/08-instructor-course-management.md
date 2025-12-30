# 08. 講師：コース作成・編集機能

## 概要
講師がコースを作成・編集する機能の実装

## 実装内容

### 講師ダッシュボード
- [x] `app/(dashboard)/instructor/dashboard/page.tsx` 作成
- [x] 作成したコース一覧表示
- [x] コース統計表示（任意）
- [x] 新規コース作成ボタン

### コース作成ページ
- [x] `app/(dashboard)/instructor/courses/new/page.tsx` 作成
- [x] コース作成フォームコンポーネント作成
- [x] カテゴリー選択ドロップダウン
- [x] サムネイル画像URL入力（アップロードは未実装、URLのみ）
- [x] フォームバリデーション

### コース編集ページ
- [x] `app/(dashboard)/instructor/courses/[id]/edit/page.tsx` 作成
- [x] コース情報編集フォーム
- [x] 公開/非公開切り替え
- [x] コース削除機能

### Server Actions
- [x] `app/_lib/actions/courses.ts` 作成
- [x] `createCourse` アクション実装
- [x] `updateCourse` アクション実装
- [x] `deleteCourse` アクション実装
- [x] `togglePublish` アクション実装

### 権限チェック
- [x] 講師・管理者のみアクセス可能
- [x] Middlewareでのルート保護
- [x] Server Componentでの役割確認

### サイドバーナビゲーション
- [x] `app/(dashboard)/layout.tsx` にサイドバー追加
- [x] ダッシュボードメニュー
- [x] コース管理メニュー

## ファイル構成

```
app/
├── (dashboard)/
│   ├── layout.tsx              # サイドバー付きレイアウト
│   └── instructor/
│       ├── dashboard/
│       │   └── page.tsx
│       └── courses/
│           ├── new/
│           │   └── page.tsx
│           └── [id]/
│               └── edit/
│                   └── page.tsx
├── _components/
│   ├── sidebar.tsx
│   └── course-form.tsx
└── _lib/
    └── actions/
        └── courses.ts
```

## フォームフィールド

### 基本情報
- タイトル（日本語）
- タイトル（英語）
- 説明（日本語）
- 説明（英語）
- カテゴリー
- サムネイル画像URL（任意）
- 公開フラグ

## Server Actions実装

```typescript
// app/_lib/actions/courses.ts
'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 役割チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['instructor', 'admin'].includes(profile.role)) {
    throw new Error('Forbidden');
  }

  const courseData = {
    title_ja: formData.get('title_ja') as string,
    title_en: formData.get('title_en') as string,
    description_ja: formData.get('description_ja') as string,
    description_en: formData.get('description_en') as string,
    category_id: formData.get('category_id') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
    instructor_id: user.id,
    is_published: false,
  };

  const { data: course, error } = await supabase
    .from('courses')
    .insert(courseData)
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/instructor/dashboard');
  redirect(`/instructor/courses/${course.id}/edit`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const courseData = {
    title_ja: formData.get('title_ja') as string,
    title_en: formData.get('title_en') as string,
    description_ja: formData.get('description_ja') as string,
    description_en: formData.get('description_en') as string,
    category_id: formData.get('category_id') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
  };

  const { error } = await supabase
    .from('courses')
    .update(courseData)
    .eq('id', courseId);

  if (error) throw error;

  revalidatePath('/instructor/dashboard');
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('courses').delete().eq('id', courseId);

  if (error) throw error;

  revalidatePath('/instructor/dashboard');
  redirect('/instructor/dashboard');
}

export async function togglePublish(courseId: string, isPublished: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .eq('id', courseId);

  if (error) throw error;

  revalidatePath('/instructor/dashboard');
  revalidatePath(`/courses/${courseId}`);
}
```

## フォームコンポーネント

```typescript
// app/_components/course-form.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createCourse, updateCourse } from '@/app/_lib/actions/courses';

interface CourseFormProps {
  course?: any; // 編集時は既存データを渡す
  categories: any[];
}

export function CourseForm({ course, categories }: CourseFormProps) {
  const action = course
    ? updateCourse.bind(null, course.id)
    : createCourse;

  return (
    <form action={action}>
      <input
        type="text"
        name="title_ja"
        defaultValue={course?.title_ja}
        placeholder="タイトル（日本語）"
        required
      />
      <input
        type="text"
        name="title_en"
        defaultValue={course?.title_en}
        placeholder="タイトル（英語）"
        required
      />
      <textarea
        name="description_ja"
        defaultValue={course?.description_ja}
        placeholder="説明（日本語）"
      />
      <textarea
        name="description_en"
        defaultValue={course?.description_en}
        placeholder="説明（英語）"
      />
      <select name="category_id" defaultValue={course?.category_id} required>
        <option value="">カテゴリーを選択</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name_ja}
          </option>
        ))}
      </select>
      <input
        type="url"
        name="thumbnail_url"
        defaultValue={course?.thumbnail_url}
        placeholder="サムネイルURL（任意）"
      />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? '保存中...' : '保存'}
    </button>
  );
}
```

## Middlewareでの保護

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // ... セッション更新処理

  // 講師・管理者専用ページの保護
  if (request.nextUrl.pathname.startsWith('/instructor')) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['instructor', 'admin'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}
```

## バリデーション

- [x] 必須フィールドのチェック
- [ ] タイトルの長さ制限
- [x] URL形式のチェック
- [x] カテゴリーの存在確認

## UX向上

- [x] フォーム送信中のローディング表示
- [ ] 保存成功メッセージ
- [x] エラーメッセージ表示
- [ ] 未保存の変更警告（任意）

## 注意事項

- RLSポリシーで講師・管理者のみがコースを作成・編集できるよう制御
- コース削除時は関連する動画も一緒に削除（`ON DELETE CASCADE`）
- 公開フラグの変更は慎重に（ユーザーに影響）

## テスト項目

- [x] 講師がコースを作成できる
- [x] 講師がコースを編集できる
- [x] 講師がコースを削除できる
- [x] 公開/非公開を切り替えられる
- [x] 一般ユーザーはアクセスできない
- [x] フォームバリデーションが機能する
- [x] 保存後にリダイレクトされる
- [x] キャッシュが適切に再検証される

## 参考

- [Next.js - Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React - useFormState](https://react.dev/reference/react-dom/hooks/useFormState)
- CLAUDE.md - Server Actions
