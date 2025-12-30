import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCourse } from '@/app/_lib/queries/courses';
import { createClient } from '@/app/_lib/supabase/server';
import { getUserProgress, calculateProgress } from '@/app/_lib/queries/progress';
import { getCourseComments } from '@/app/_lib/queries/comments';
import { CommentsSection } from './_components/comments-section';
import { VideoListItem } from './_components/video-list-item';
import type { Video } from '@/app/_lib/types/database';

type Props = {
  params: Promise<{ id: string }>;
};

// Disable caching for user-specific progress data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return {
      title: 'コースが見つかりません',
    };
  }

  return {
    title: course.title_ja,
    description: course.description_ja,
    openGraph: {
      title: course.title_ja,
      description: course.description_ja,
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  // Get authenticated user and their progress
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const progress = user ? await getUserProgress(user.id, id) : [];

  // Create a map of video completion status
  const progressMap = new Map(
    progress.map((p) => [p.video_id, p.is_completed])
  );

  // Calculate overall completion percentage
  const completedCount = progress.filter((p) => p.is_completed).length;
  const totalVideos = course.videos?.length || 0;
  const completionPercentage = calculateProgress(totalVideos, completedCount);

  const displayName = course.profiles?.display_name || course.profiles?.email?.split('@')[0] || '不明';

  // Get user role for comment permissions
  let userRole: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role;
  }

  // Fetch comments
  const comments = await getCourseComments(id);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {course.categories && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-bold text-purple-600 bg-purple-100">
                {course.categories.name_ja}
              </span>
            </div>
          )}

          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {course.title_ja}
          </h1>

          <p className="text-lg mb-6 opacity-90">
            {course.description_ja}
          </p>

          <div className="flex items-center text-sm">
            <div className="flex items-center">
              <span className="font-medium">講師: {displayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Content Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            コース内容
          </h2>

          {course.videos && course.videos.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                全{course.videos.length}レッスン
              </p>
              {user && totalVideos > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      進捗状況
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {course.videos && course.videos.length > 0 ? (
            <div className="border border-gray-300 dark:border-gray-700">
              {course.videos.map((video: Video, index: number) => (
                <VideoListItem
                  key={video.id}
                  video={video}
                  courseId={course.id}
                  index={index}
                  isCompleted={progressMap.get(video.id) || false}
                  showProgress={!!user}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <svg className="mx-auto w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                このコースにはまだ動画が追加されていません
              </p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CommentsSection
          courseId={id}
          comments={comments}
          currentUserId={user?.id}
          currentUserRole={userRole}
          courseInstructorId={course.instructor_id}
        />
      </div>
    </div>
  );
}
