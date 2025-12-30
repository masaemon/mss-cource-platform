'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string; // YouTube video ID
  title: string;
  currentVideoId: string; // Database video ID
  userId: string;
}

// YouTube IFrame Player API型定義
interface YTPlayer {
  destroy: () => void;
}

interface YTPlayerEvent {
  data: number;
}

interface YTNamespace {
  Player: new (
    elementId: string,
    config: {
      videoId: string;
      playerVars?: Record<string, unknown>;
      events?: {
        onStateChange?: (event: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: YTNamespace;
  }
}

export function VideoPlayer({
  videoId,
  currentVideoId,
}: VideoPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const markAsCompleted = useCallback(async () => {
    try {
      const response = await fetch('/api/video-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: currentVideoId,
          isCompleted: true,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [currentVideoId]);

  useEffect(() => {
    // YouTube IFrame APIスクリプトを読み込む
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setIsReady(true);
      };
    } else {
      setIsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current || !window.YT) return;

    // プレーヤーを初期化
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: YTPlayerEvent) => {
          // 動画の状態が変わったときの処理
          if (event.data === window.YT?.PlayerState.ENDED) {
            // 動画が終了したら進捗を完了に更新
            markAsCompleted();
          }
        },
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [isReady, videoId, markAsCompleted]);

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div
        ref={containerRef}
        id="youtube-player"
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}
