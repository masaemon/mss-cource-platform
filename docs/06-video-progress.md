# 06. 視聴進捗機能

## 概要
ユーザーの動画視聴進捗を管理する機能の実装

## 実装内容

### 進捗表示UI
- [x] 動画リストに視聴完了チェックボックス表示
- [x] チェックボックスコンポーネント作成（`app/_components/progress-checkbox.tsx`）
- [x] 視聴完了済み動画の視覚的表示
- [x] コース全体の進捗率表示（任意）

### 進捗データ取得
- [x] ユーザー進捗取得関数実装（`app/_lib/queries/progress.ts`）
- [x] 動画視聴ページで進捗データ取得
- [x] `force-dynamic` 設定（キャッシュ無効化）

### 進捗更新機能
- [x] 進捗更新API実装（`app/api/video-progress/route.ts`）
- [x] 動画終了時の自動完了マーク（VideoPlayerコンポーネント内）
- [x] チェックボックスのクリックイベント処理
- [x] 楽観的UI更新（Optimistic Updates）
- [x] `revalidatePath` でキャッシュ再検証

### プロファイルページ
- [ ] `app/profile/progress/page.tsx` 作成（別途実装予定）
- [ ] 視聴済みコース一覧表示（別途実装予定）
- [ ] 視聴中コース一覧表示（別途実装予定）
- [ ] 進捗統計表示（任意、別途実装予定）

## ファイル構成

```
app/
├── courses/
│   └── [id]/
│       └── _components/
│           └── progress-checkbox.tsx
├── profile/
│   └── progress/
│       └── page.tsx
├── _components/
│   └── progress-bar.tsx         # 進捗バー（任意）
└── _lib/
    ├── queries/
    │   └── progress.ts
    └── actions/
        └── progress.ts
```

## データベース設計

### video_progress テーブル
- `user_id`: ユーザーID
- `video_id`: 動画ID
- `is_completed`: 視聴完了フラグ
- `completed_at`: 完了日時
- UNIQUE制約: `(user_id, video_id)`

## Server Action実装

```typescript
// app/_lib/actions/progress.ts
'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleVideoProgress(
  videoId: string,
  isCompleted: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('video_progress').upsert(
    {
      user_id: user.id,
      video_id: videoId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    },
    {
      onConflict: 'user_id,video_id',
    }
  );

  if (error) throw error;

  revalidatePath('/courses/[id]');
  revalidatePath('/profile/progress');
}
```

## Client Component実装

```typescript
// app/_components/progress-checkbox.tsx
'use client';

import { useState, useTransition } from 'react';
import { toggleVideoProgress } from '@/app/_lib/actions/progress';

interface ProgressCheckboxProps {
  videoId: string;
  initialCompleted: boolean;
}

export function ProgressCheckbox({
  videoId,
  initialCompleted,
}: ProgressCheckboxProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  const handleChange = async () => {
    const newValue = !isCompleted;

    // 楽観的UI更新
    setIsCompleted(newValue);

    startTransition(async () => {
      try {
        await toggleVideoProgress(videoId, newValue);
      } catch (error) {
        // エラー時は元に戻す
        setIsCompleted(!newValue);
        console.error(error);
      }
    });
  };

  return (
    <input
      type="checkbox"
      checked={isCompleted}
      onChange={handleChange}
      disabled={isPending}
      className="h-5 w-5"
    />
  );
}
```

## 進捗データ取得

```typescript
// app/_lib/queries/progress.ts
import { createClient } from '@/app/_lib/supabase/server';

export async function getUserProgress(userId: string, courseId: string) {
  const supabase = await createClient();

  const { data: videos } = await supabase
    .from('videos')
    .select('id')
    .eq('course_id', courseId);

  const videoIds = videos?.map((v) => v.id) || [];

  const { data: progress } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .in('video_id', videoIds);

  return progress || [];
}
```

## コース詳細ページでの統合

```typescript
// app/courses/[id]/page.tsx
export const dynamic = 'force-dynamic'; // 進捗データはキャッシュしない

export default async function CoursePage({ params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const course = await getCourse(params.id);
  const progress = user ? await getUserProgress(user.id, params.id) : [];

  return (
    <div>
      {/* コース情報 */}
      <VideoList videos={course.videos} progress={progress} />
    </div>
  );
}
```

## 進捗率の計算（任意）

```typescript
function calculateProgress(totalVideos: number, completedVideos: number) {
  if (totalVideos === 0) return 0;
  return Math.round((completedVideos / totalVideos) * 100);
}
```

## RLSポリシー

```sql
-- ユーザーは自分の進捗のみ閲覧・管理可能
CREATE POLICY "Users can view own progress"
ON video_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
ON video_progress FOR ALL
USING (auth.uid() = user_id);
```

## 注意事項

- 未認証ユーザーには進捗機能を表示しない
- `force-dynamic` で進捗データを常に最新化
- 楽観的UI更新でUX向上
- エラー時のロールバック処理

## 拡張機能（任意）

- [ ] 動画の視聴時間記録
- [ ] 最後に視聴した位置の保存
- [ ] 自動的に次の動画へ遷移
- [ ] 視聴履歴の表示
- [ ] コース完了証明書の発行

## テスト項目

- [x] チェックボックスで進捗を更新できる
- [x] 視聴完了済み動画が視覚的に区別される
- [x] 進捗率が正しく計算される
- [x] 未認証ユーザーはログインページにリダイレクトされる
- [x] 楽観的UI更新が機能する
- [x] エラー時に状態がロールバックされる
- [ ] プロファイルページで進捗一覧が表示される
- [x] 動画終了時に自動的に完了マークされる

## 参考

- [Next.js - Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React - useTransition](https://react.dev/reference/react/useTransition)
- CLAUDE.md - Server Actions
