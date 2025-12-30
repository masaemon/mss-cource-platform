'use client';

import { useFormStatus } from 'react-dom';
import { createCourse, updateCourse } from '@/app/_lib/actions/courses';
import { useState } from 'react';
import type { Course, Category } from '@/app/_lib/types/database';

interface CourseFormProps {
  course?: Course;
  categories: Category[];
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
    >
      {pending ? '保存中...' : isEdit ? 'コースを更新' : 'コースを作成'}
    </button>
  );
}

export function CourseForm({ course, categories }: CourseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!course;

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    try {
      if (isEdit) {
        await updateCourse(course.id, formData);
      } else {
        await createCourse(formData);
      }
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
            defaultValue={course?.title_ja || ''}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
            placeholder="例: React完全マスターコース"
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
            defaultValue={course?.title_en || ''}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
            placeholder="e.g., Complete React Course"
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
          defaultValue={course?.description_ja || ''}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
          placeholder="このコースについて詳しく説明してください"
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
          defaultValue={course?.description_en || ''}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
          placeholder="Describe this course in detail"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <label
            htmlFor="category_id"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            カテゴリー <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={course?.category_id || ''}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">カテゴリーを選択</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_ja}
              </option>
            ))}
          </select>
        </div>

        {/* Thumbnail URL */}
        <div>
          <label
            htmlFor="thumbnail_url"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            サムネイルURL（任意）
          </label>
          <input
            type="url"
            id="thumbnail_url"
            name="thumbnail_url"
            defaultValue={course?.thumbnail_url || ''}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
