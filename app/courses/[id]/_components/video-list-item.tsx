'use client';

import Link from 'next/link';
import { ProgressCheckbox } from '@/app/_components/progress-checkbox';
import type { Video } from '@/app/_lib/types/database';

interface VideoListItemProps {
  video: Video;
  courseId: string;
  index: number;
  isCompleted: boolean;
  showProgress: boolean;
}

export function VideoListItem({
  video,
  courseId,
  index,
  isCompleted,
  showProgress,
}: VideoListItemProps) {
  return (
    <div className="flex items-start p-4 border-b border-gray-300 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
      <Link
        href={`/courses/${courseId}/watch/${video.id}`}
        className="flex items-start flex-1"
      >
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold rounded group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {index + 1}
        </div>

        <div className="ml-4 flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {video.title_ja}
          </h3>
          {video.description_ja && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {video.description_ja}
            </p>
          )}
        </div>

        {video.duration_seconds && (
          <div className="flex-shrink-0 ml-4 text-sm text-gray-600 dark:text-gray-400">
            {Math.floor(video.duration_seconds / 60)}分
          </div>
        )}
      </Link>

      {showProgress && (
        <div
          className="flex-shrink-0 ml-4"
          onClick={(e) => e.stopPropagation()}
        >
          <ProgressCheckbox
            videoId={video.id}
            initialCompleted={isCompleted}
          />
        </div>
      )}
    </div>
  );
}
