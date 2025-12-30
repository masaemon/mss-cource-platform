'use client';

import { useState, useTransition } from 'react';
import { togglePublish } from '@/app/_lib/actions/courses';

interface PublishToggleButtonProps {
  courseId: string;
  isPublished: boolean;
}

export function PublishToggleButton({
  courseId,
  isPublished: initialIsPublished,
}: PublishToggleButtonProps) {
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    const newValue = !isPublished;

    startTransition(async () => {
      try {
        await togglePublish(courseId, newValue);
        setIsPublished(newValue);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
        console.error('Error toggling publish:', err);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`px-4 py-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ` + (
          isPublished
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            : 'bg-green-600 hover:bg-green-700 text-white'
        )}
      >
        {isPending
          ? '処理中...'
          : isPublished
            ? '非公開にする'
            : '公開する'}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
