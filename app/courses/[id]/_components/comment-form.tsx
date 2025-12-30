'use client';

import { useState, useTransition } from 'react';
import { addComment } from '@/app/_lib/actions/comments';

interface CommentFormProps {
  courseId: string;
}

export function CommentForm({ courseId }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await addComment(courseId, content);
        setContent('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          コメントを投稿
        </label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力..."
          rows={4}
          maxLength={1000}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isPending}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {content.length} / 1000
          </span>
        </div>
      </div>
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? '投稿中...' : 'コメントを投稿'}
      </button>
    </form>
  );
}
