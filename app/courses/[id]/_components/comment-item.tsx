'use client';

import { useState, useTransition } from 'react';
import { deleteComment } from '@/app/_lib/actions/comments';
import { InstructorReplyForm } from './instructor-reply-form';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_instructor_reply: boolean;
  profiles: {
    id: string;
    email: string;
    display_name?: string | null;
    avatar_url: string | null;
    role: string;
  };
}

interface CommentItemProps {
  comment: Comment;
  courseId: string;
  currentUserId?: string;
  currentUserRole?: string;
  courseInstructorId?: string;
}

export function CommentItem({
  comment,
  courseId,
  currentUserId,
  currentUserRole,
  courseInstructorId,
}: CommentItemProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleted, setIsDeleted] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isInstructor =
    comment.is_instructor_reply ||
    ['instructor', 'admin'].includes(comment.profiles.role);

  const canDelete =
    currentUserId === comment.profiles.id || currentUserRole === 'admin';

  // 講師・管理者のみ返信可能、かつ講師回答には返信不可
  const canReply =
    currentUserRole &&
    ['instructor', 'admin'].includes(currentUserRole) &&
    !comment.is_instructor_reply &&
    (currentUserRole === 'admin' || currentUserId === courseInstructorId);

  const handleDelete = async () => {
    if (!confirm('このコメントを削除してもよろしいですか？')) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteComment(comment.id);
        setIsDeleted(true);
      } catch (error) {
        alert(
          error instanceof Error ? error.message : 'コメントの削除に失敗しました'
        );
      }
    });
  };

  if (isDeleted) {
    return null;
  }

  // 相対時間の計算
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return 'たった今';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}分前`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}時間前`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}日前`;

    return commentDate.toLocaleDateString('ja-JP');
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        isInstructor
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400'
          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* アバター */}
        <div className="flex-shrink-0">
          {comment.profiles.avatar_url ? (
            <img
              src={comment.profiles.avatar_url}
              alt={comment.profiles.email}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                {comment.profiles.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* コメント本文 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white">
              {comment.profiles.display_name || comment.profiles.email.split('@')[0]}
            </span>
            {isInstructor && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-600 text-white">
                講師
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getRelativeTime(comment.created_at)}
            </span>
          </div>
          <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* アクションボタン */}
          <div className="mt-2 flex gap-3">
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
              >
                {isPending ? '削除中...' : '削除'}
              </button>
            )}
            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {showReplyForm ? 'キャンセル' : '返信'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 講師回答フォーム */}
      {showReplyForm && (
        <InstructorReplyForm
          courseId={courseId}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
    </div>
  );
}
