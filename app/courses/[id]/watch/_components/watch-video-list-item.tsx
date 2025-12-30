'use client';

import Link from 'next/link';
import { ProgressCheckbox } from '@/app/_components/progress-checkbox';
import type { Video } from '@/app/_lib/types/database';

interface WatchVideoListItemProps {
  video: Video;
  courseId: string;
  currentVideoId: string;
  index: number;
  isCompleted: boolean;
}

export function WatchVideoListItem({
  video,
  courseId,
  currentVideoId,
  index,
  isCompleted,
}: WatchVideoListItemProps) {
  const isCurrentVideo = video.id === currentVideoId;

  return (
    <div
      className={`flex items-start p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group ${
        isCurrentVideo ? 'bg-purple-50 dark:bg-purple-900/20' : ''
      }`}
    >
      <Link
        href={`/courses/${courseId}/watch/${video.id}`}
        className="flex items-start flex-1 min-w-0"
      >
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold rounded mr-3">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-sm mb-1 line-clamp-2 ${
              isCurrentVideo
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {video.title_ja}
          </h3>
          {video.duration_seconds && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {Math.floor(video.duration_seconds / 60)}分
            </p>
          )}
        </div>
      </Link>
      <div className="flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
        <ProgressCheckbox videoId={video.id} initialCompleted={isCompleted} />
      </div>
    </div>
  );
}
