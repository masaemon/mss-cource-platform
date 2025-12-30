'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addVideo, updateVideo } from '@/app/_lib/actions/videos';
import type { Video } from '@/app/_lib/types/database';

interface VideoFormProps {
  courseId: string;
  video?: Video;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
    >
      {pending ? '保存中...' : isEdit ? '動画を更新' : '動画を追加'}
    </button>
  );
}

export function VideoForm({
  courseId,
  video,
  onSuccess,
  onCancel,
}: VideoFormProps) {
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!video;

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    try {
      if (isEdit) {
        await updateVideo(video.id, formData);
      } else {
        await addVideo(courseId, formData);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* YouTube URL */}
      <div>
        <label
          htmlFor="youtube_url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          YouTube URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="youtube_url"
          name="youtube_url"
          defaultValue={video?.youtube_url}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          YouTubeの動画URLを入力してください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title Japanese */}
        <div>
          <label
            htmlFor="title_ja"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            タイトル（日本語） <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title_ja"
            name="title_ja"
            defaultValue={video?.title_ja}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
            placeholder="例: Reactの基礎"
          />
        </div>

        {/* Title English */}
        <div>
          <label
            htmlFor="title_en"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            タイトル（英語）
          </label>
          <input
            type="text"
            id="title_en"
            name="title_en"
            defaultValue={video?.title_en || ''}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
            placeholder="e.g., React Basics"
          />
        </div>
      </div>

      {/* Description Japanese */}
      <div>
        <label
          htmlFor="description_ja"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          説明（日本語）
        </label>
        <textarea
          id="description_ja"
          name="description_ja"
          defaultValue={video?.description_ja || ''}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
          placeholder="この動画について説明してください"
        />
      </div>

      {/* Description English */}
      <div>
        <label
          htmlFor="description_en"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          説明（英語）
        </label>
        <textarea
          id="description_en"
          name="description_en"
          defaultValue={video?.description_en || ''}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
          placeholder="Describe this video"
        />
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg transition-colors"
          >
            キャンセル
          </button>
        )}
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
