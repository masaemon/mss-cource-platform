# 05. 動画視聴機能（YouTube埋め込み）

## 概要
YouTube IFrame Player APIを使用した動画視聴機能の実装

## 実装内容

### YouTube埋め込みプレーヤー
- [x] `app/_components/video-player.tsx` 作成（Client Component）
- [x] YouTube IFrame Player APIの読み込み
- [x] プレーヤーの初期化処理
- [ ] YouTube動画IDの抽出処理実装（`youtube_video_id`を直接使用中）

### 動画表示UI
- [x] 動画視聴ページ作成（`app/courses/[id]/watch/[videoId]/page.tsx`）
- [x] 動画選択機能実装（サイドバーの動画リスト）
- [x] 現在再生中の動画ハイライト
- [x] レスポンシブ対応（16:9アスペクト比維持）

### 動画情報表示
- [x] 動画タイトル表示
- [x] 動画説明表示
- [x] 動画の順序番号表示
- [ ] 動画の長さ表示（durationフィールドは任意のため未実装）

### プレーヤーコントロール
- [ ] 次の動画へ自動遷移（任意）
- [ ] 前/次の動画ボタン
- [ ] プレイリスト機能（任意）

## ファイル構成

```
app/
├── courses/
│   └── [id]/
│       └── _components/
│           ├── youtube-player.tsx
│           ├── video-selector.tsx
│           └── video-info.tsx
└── _lib/
    └── utils/
        └── youtube.ts          # YouTube URL/ID処理
```

## YouTube Player実装

### Client Component
```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onEnd?: () => void;
}

export function YouTubePlayer({ videoId, onReady, onEnd }: YouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // YouTube IFrame Player APIの読み込み
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // プレーヤー初期化
    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          // プライバシーモード推奨
          origin: window.location.origin,
        },
        events: {
          onReady,
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onEnd?.();
            }
          },
        },
      });
    };
  }, [videoId, onReady, onEnd]);

  return (
    <div className="aspect-video w-full">
      <div ref={playerRef} className="h-full w-full" />
    </div>
  );
}
```

### YouTube URL処理
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
```

## iframe埋め込み（シンプル版）

YouTube IFrame APIを使わない場合の実装：

```typescript
<iframe
  width="100%"
  height="100%"
  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

## レスポンシブ対応

16:9アスペクト比を維持：

```tsx
<div className="aspect-video w-full">
  {/* Player or iframe */}
</div>
```

## プライバシー考慮

- `youtube-nocookie.com` ドメインの使用を推奨
- ユーザーのプライバシーを保護

## データベース設計

### videos テーブル
- `youtube_url`: 元のYouTube URL
- `youtube_video_id`: 埋め込み用の動画ID（自動抽出または手動入力）
- `duration`: 動画の長さ（秒数、任意）

## 注意事項

- YouTube APIの利用規約を遵守
- 埋め込み可能な動画のみ使用可能
- 動画が削除された場合のエラーハンドリング
- YouTubeのサーバーに依存するため、ダウンタイムに注意

## セキュリティ

- XSS対策: URL入力のバリデーション
- CSP（Content Security Policy）設定
- iframe sandbox属性の検討

## パフォーマンス

- [x] 遅延読み込み（Lazy Loading）
- [x] プレーヤーAPIの非同期読み込み
- [x] 必要最小限のプレーヤーオプション

## テスト項目

- [x] YouTube動画が正しく埋め込まれる
- [ ] 動画IDの抽出が正しく動作する（直接使用中）
- [x] プレーヤーが16:9で表示される
- [x] モバイルで正しく再生できる
- [ ] 無効な動画URLでエラーが表示される
- [x] 複数の動画を切り替えられる
- [x] レスポンシブデザインが機能する

## 参考

- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- CLAUDE.md - YouTube埋め込み
