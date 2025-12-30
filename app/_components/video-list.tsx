'use client';

import { useState } from 'react';
import { VideoItem } from './video-item';
import { VideoForm } from './video-form';
import type { Video } from '@/app/_lib/types/database';

interface VideoListProps {
  courseId: string;
  videos: Video[];
}

export function VideoList({ courseId, videos }: VideoListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const sortedVideos = [...videos].sort(
    (a, b) => a.order_number - b.order_number
  );

  const handleAddSuccess = () => {
    setShowAddForm(false);
  };

  const handleEditSuccess = () => {
    setEditingVideo(null);
  };

  const canAddMore = videos.length < 10;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            動画コンテンツ
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {videos.length}本の動画 {!canAddMore && '（最大数に達しました）'}
          </p>
        </div>
        {!showAddForm && !editingVideo && (
          <button
            onClick={() => setShowAddForm(true)}
            disabled={!canAddMore}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            動画を追加
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-6 bg-purple-50 dark:bg-purple-900/10">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            新しい動画を追加
          </h4>
          <VideoForm
            courseId={courseId}
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Edit Form */}
      {editingVideo && (
        <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-6 bg-purple-50 dark:bg-purple-900/10">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            動画を編集
          </h4>
          <VideoForm
            courseId={courseId}
            video={editingVideo}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingVideo(null)}
          />
        </div>
      )}

      {/* Video List */}
      {sortedVideos.length > 0 ? (
        <div className="space-y-3">
          {sortedVideos.map((video, index) => (
            <VideoItem
              key={video.id}
              video={video}
              courseId={courseId}
              isFirst={index === 0}
              isLast={index === sortedVideos.length - 1}
              onEdit={setEditingVideo}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <svg
            className="mx-auto w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            動画がまだありません
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            最初の動画を追加してコースを充実させましょう
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
            >
              動画を追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}
