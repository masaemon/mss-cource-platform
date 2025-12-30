import { CommentItem } from './comment-item';

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

interface CommentListProps {
  comments: Comment[];
  courseId: string;
  currentUserId?: string;
  currentUserRole?: string;
  courseInstructorId?: string;
}

export function CommentList({
  comments,
  courseId,
  currentUserId,
  currentUserRole,
  courseInstructorId,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>まだコメントがありません</p>
        <p className="text-sm mt-1">最初のコメントを投稿してみましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          courseId={courseId}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          courseInstructorId={courseInstructorId}
        />
      ))}
    </div>
  );
}
