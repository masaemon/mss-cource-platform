'use client';

import { updateProfile } from '@/app/_lib/actions/users';
import { useState } from 'react';

interface Profile {
  id: string;
  email: string;
  display_name?: string | null;
  bio?: string | null;
  role: string;
  created_at: string;
}

interface ProfileEditFormProps {
  profile: Profile | null;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 読み取り専用フィールド */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          メールアドレス
        </label>
        <p className="text-gray-900 dark:text-white">{profile?.email}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          役割
        </label>
        <p className="text-gray-900 dark:text-white">
          {profile?.role === 'admin'
            ? '管理者'
            : profile?.role === 'instructor'
              ? '講師'
              : '一般ユーザー'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          登録日
        </label>
        <p className="text-gray-900 dark:text-white">
          {new Date(profile?.created_at || '').toLocaleDateString('ja-JP')}
        </p>
      </div>

      {/* 編集可能フィールド */}
      <form action={handleSubmit} className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            ユーザー名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            defaultValue={profile?.display_name || ''}
            required
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="例: 太郎"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            コース一覧やコメントに表示される名前です（50文字以内）
          </p>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            自己紹介
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={profile?.bio || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="自己紹介を入力してください"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              プロフィールを更新しました
            </p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '更新中...' : 'プロフィールを更新'}
          </button>
        </div>
      </form>
    </div>
  );
}
