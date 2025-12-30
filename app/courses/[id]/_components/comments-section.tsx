import { CommentForm } from './comment-form';
import { CommentList } from './comment-list';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_instructor_reply: boolean;
  profiles: {
    id: string;
    email: string;
    avatar_url: string | null;
    role: string;
  };
}

interface CommentsSectionProps {
  courseId: string;
  comments: Comment[];
  currentUserId?: string;
  currentUserRole?: string;
  courseInstructorId?: string;
}

export function CommentsSection({
  courseId,
  comments,
  currentUserId,
  currentUserRole,
  courseInstructorId,
}: CommentsSectionProps) {
  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">
        コメント ({comments.length})
      </h2>

      {/* コメント投稿フォーム */}
      <div className="mb-8">
        {currentUserId ? (
          <CommentForm courseId={courseId} />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-4">
              コメントを投稿するにはログインが必要です
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン
            </Link>
          </div>
        )}
      </div>

      {/* コメント一覧 */}
      <CommentList
        comments={comments}
        courseId={courseId}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        courseInstructorId={courseInstructorId}
      />
    </div>
  );
}
