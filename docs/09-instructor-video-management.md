# 09. 講師：動画管理機能

## 概要
講師がコースに動画を追加・編集・削除・順序変更する機能の実装

## 実装内容

### 動画管理UI
- [x] コース編集ページに動画管理セクション追加
- [x] 動画リスト表示（ドラッグ&ドロップは未実装、上下移動ボタンで対応）
- [x] 動画追加ボタン
- [x] 動画編集フォーム（インライン）
- [x] 動画削除ボタン（確認ダイアログ付き）

### 動画追加機能
- [x] 動画追加フォーム作成
- [x] YouTube URL入力
- [x] 動画ID自動抽出
- [x] タイトル・説明入力（日英）
- [x] 順序番号の自動設定

### 動画編集機能
- [x] 動画編集フォーム作成
- [x] 既存データの読み込み
- [x] 動画情報更新

### 動画削除機能
- [x] 削除確認ダイアログ
- [x] 削除後の順序番号調整

### 順序変更機能
- [x] 上下移動ボタン
- [ ] ドラッグ&ドロップ（任意）
- [x] 順序番号の自動再計算

### Server Actions
- [x] `app/_lib/actions/videos.ts` 作成
- [x] `addVideo` アクション実装
- [x] `updateVideo` アクション実装
- [x] `deleteVideo` アクション実装
- [x] `reorderVideos` アクション実装

### YouTube URL処理
- [x] URL検証
- [x] 動画ID抽出関数
- [x] 埋め込み可否チェック（任意）

## ファイル構成

```
app/
├── (dashboard)/
│   └── instructor/
│       └── courses/
│           └── [id]/
│               └── edit/
│                   ├── page.tsx          # 動画管理含む
│                   └── _components/
│                       ├── video-list.tsx
│                       ├── video-form.tsx
│                       └── video-item.tsx
├── _components/
│   └── confirm-dialog.tsx
└── _lib/
    ├── actions/
    │   └── videos.ts
    └── utils/
        └── youtube.ts
```

## データ制約

- 1コースあたり最大10動画
- `order_number` はコース内でユニーク
- `(course_id, order_number)` でユニーク制約

## Server Actions実装

```typescript
// app/_lib/actions/videos.ts
'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { extractYouTubeVideoId } from '@/app/_lib/utils/youtube';

export async function addVideo(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // コースの所有者チェック
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single();

  if (course?.instructor_id !== user.id) {
    // 管理者チェック
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Forbidden');
    }
  }

  // 既存動画数チェック（最大10本）
  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (count && count >= 10) {
    throw new Error('コースあたりの動画は最大10本までです');
  }

  const youtubeUrl = formData.get('youtube_url') as string;
  const videoId = extractYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    throw new Error('有効なYouTube URLを入力してください');
  }

  // 次の順序番号を取得
  const { data: lastVideo } = await supabase
    .from('videos')
    .select('order_number')
    .eq('course_id', courseId)
    .order('order_number', { ascending: false })
    .limit(1)
    .single();

  const orderNumber = (lastVideo?.order_number || 0) + 1;

  const videoData = {
    course_id: courseId,
    title_ja: formData.get('title_ja') as string,
    title_en: formData.get('title_en') as string,
    description_ja: formData.get('description_ja') as string,
    description_en: formData.get('description_en') as string,
    youtube_url: youtubeUrl,
    youtube_video_id: videoId,
    order_number: orderNumber,
  };

  const { error } = await supabase.from('videos').insert(videoData);

  if (error) throw error;

  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}`);
}

export async function updateVideo(videoId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const youtubeUrl = formData.get('youtube_url') as string;
  const extractedVideoId = extractYouTubeVideoId(youtubeUrl);

  if (!extractedVideoId) {
    throw new Error('有効なYouTube URLを入力してください');
  }

  const videoData = {
    title_ja: formData.get('title_ja') as string,
    title_en: formData.get('title_en') as string,
    description_ja: formData.get('description_ja') as string,
    description_en: formData.get('description_en') as string,
    youtube_url: youtubeUrl,
    youtube_video_id: extractedVideoId,
  };

  const { data: video, error } = await supabase
    .from('videos')
    .update(videoData)
    .eq('id', videoId)
    .select('course_id')
    .single();

  if (error) throw error;

  revalidatePath(`/instructor/courses/${video.course_id}/edit`);
  revalidatePath(`/courses/${video.course_id}`);
}

export async function deleteVideo(videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 動画情報取得（コースIDと順序番号）
  const { data: video } = await supabase
    .from('videos')
    .select('course_id, order_number')
    .eq('id', videoId)
    .single();

  if (!video) throw new Error('Video not found');

  // 削除
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId);

  if (deleteError) throw deleteError;

  // 後続の動画の順序番号を調整
  const { error: updateError } = await supabase.rpc('decrement_video_order', {
    p_course_id: video.course_id,
    p_deleted_order: video.order_number,
  });

  if (updateError) {
    // RPCがない場合は手動で更新
    const { data: laterVideos } = await supabase
      .from('videos')
      .select('id, order_number')
      .eq('course_id', video.course_id)
      .gt('order_number', video.order_number);

    if (laterVideos) {
      for (const v of laterVideos) {
        await supabase
          .from('videos')
          .update({ order_number: v.order_number - 1 })
          .eq('id', v.id);
      }
    }
  }

  revalidatePath(`/instructor/courses/${video.course_id}/edit`);
  revalidatePath(`/courses/${video.course_id}`);
}

export async function reorderVideos(
  courseId: string,
  videoId: string,
  direction: 'up' | 'down'
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: currentVideo } = await supabase
    .from('videos')
    .select('order_number')
    .eq('id', videoId)
    .single();

  if (!currentVideo) throw new Error('Video not found');

  const newOrder =
    direction === 'up'
      ? currentVideo.order_number - 1
      : currentVideo.order_number + 1;

  // 入れ替え先の動画
  const { data: swapVideo } = await supabase
    .from('videos')
    .select('id')
    .eq('course_id', courseId)
    .eq('order_number', newOrder)
    .single();

  if (!swapVideo) return; // 端に到達

  // 順序を入れ替え
  await supabase
    .from('videos')
    .update({ order_number: newOrder })
    .eq('id', videoId);

  await supabase
    .from('videos')
    .update({ order_number: currentVideo.order_number })
    .eq('id', swapVideo.id);

  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}`);
}
```

## YouTube URL処理

```typescript
// app/_lib/utils/youtube.ts
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}
```

## UI実装（ドラッグ&ドロップ、任意）

`@dnd-kit/core` などのライブラリを使用：

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

## バリデーション

- [x] YouTube URL形式チェック
- [x] 動画ID抽出成功確認
- [x] 最大動画数チェック（10本）
- [x] 必須フィールドチェック

## 注意事項

- 順序番号の整合性を保つ
- 削除時は関連する `video_progress` も削除（`ON DELETE CASCADE`）
- YouTubeの埋め込み可能な動画のみ使用
- 動画が削除された場合のエラーハンドリング

## UX向上

- [x] 動画追加時のプレビュー表示
- [ ] ドラッグ&ドロップでの順序変更
- [x] 削除の確認ダイアログ
- [ ] 保存成功メッセージ

## テスト項目

- [x] 動画を追加できる
- [x] 動画を編集できる
- [x] 動画を削除できる
- [x] 順序を変更できる
- [x] 最大10本の制限が機能する
- [x] YouTube URLから動画IDが抽出される
- [x] 無効なURLでエラーが表示される
- [x] 削除後に順序番号が調整される

## 参考

- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [@dnd-kit/core Documentation](https://docs.dndkit.com/)
- CLAUDE.md - YouTube埋め込み
