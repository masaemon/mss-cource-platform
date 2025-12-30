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
        console.error('Failed to update progress:', error);
      }
    });
  };

  return (
    <label className="flex items-center cursor-pointer group">
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleChange}
        disabled={isPending}
        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer disabled:opacity-50"
      />
      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {isCompleted ? '完了' : '未完了'}
      </span>
    </label>
  );
}
