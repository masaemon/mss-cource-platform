'use client';

import { useState, useTransition } from 'react';
import { addInstructorReply } from '@/app/_lib/actions/comments';

interface InstructorReplyFormProps {
  courseId: string;
  onCancel: () => void;
}

export function InstructorReplyForm({
  courseId,
  onCancel,
}: InstructorReplyFormProps) {
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await addInstructorReply(courseId, content);
        setContent('');
        onCancel();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 ml-12 space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="講師として回答..."
          rows={3}
          maxLength={1000}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
          autoFocus
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {content.length} / 1000
          </span>
        </div>
      </div>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? '投稿中...' : '回答を投稿'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
