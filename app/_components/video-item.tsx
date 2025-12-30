'use client';

import { useState, useTransition } from 'react';
import { deleteVideo, reorderVideo } from '@/app/_lib/actions/videos';
import { getYouTubeThumbnailUrl } from '@/app/_lib/utils/youtube';
import type { Video } from '@/app/_lib/types/database';

interface VideoItemProps {
  video: Video;
  courseId: string;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (video: Video) => void;
}

export function VideoItem({
  video,
  courseId,
  isFirst,
  isLast,
  onEdit,
}: VideoItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteVideo(video.id);
        setShowDeleteConfirm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    });
  };

  const handleReorder = (direction: 'up' | 'down') => {
    startTransition(async () => {
      try {
        await reorderVideo(courseId, video.id, direction);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={getYouTubeThumbnailUrl(video.youtube_video_id)}
            alt={video.title_ja}
            className="w-40 h-24 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/160x90?text=Video';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                  {video.order_number}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {video.title_ja}
                </h3>
              </div>
              {video.description_ja && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {video.description_ja}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Reorder buttons */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleReorder('up')}
                  disabled={isFirst || isPending}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="上に移動"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleReorder('down')}
                  disabled={isLast || isPending}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="下に移動"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Edit button */}
              <button
                onClick={() => onEdit(video)}
                disabled={isPending}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded transition-colors disabled:opacity-50"
              >
                編集
              </button>

              {/* Delete button */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isPending}
                  className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded transition-colors disabled:opacity-50"
                >
                  削除
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors disabled:opacity-50"
                  >
                    {isPending ? '削除中...' : '確認'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isPending}
                    className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded transition-colors"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
