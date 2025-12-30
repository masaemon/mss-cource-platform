import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { getCategories } from '@/app/_lib/queries/courses';
import { CourseForm } from '@/app/_components/course-form';
import { PublishToggleButton } from '@/app/_components/publish-toggle-button';
import { DeleteCourseButton } from '@/app/_components/delete-course-button';
import { VideoList } from '@/app/_components/video-list';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch course
  const { data: course } = await supabase
    .from('courses')
    .select('*, categories(*), videos(*)')
    .eq('id', id)
    .eq('instructor_id', user.id)
    .single();

  if (!course) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/instructor/dashboard"
          className="text-purple-600 hover:text-purple-700 font-medium mb-4 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          ダッシュボードに戻る
        </Link>

        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              コースを編集
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {course.title_ja}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PublishToggleButton
              courseId={course.id}
              isPublished={course.is_published}
            />
            <DeleteCourseButton courseId={course.id} />
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {course.is_published ? (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-bold text-green-800 dark:text-green-300">
                このコースは公開中です
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                すべてのユーザーがこのコースを閲覧できます
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-300">
                このコースは下書きです
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                公開するには「公開する」ボタンをクリックしてください
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Course Info */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          基本情報
        </h2>
        <CourseForm course={course} categories={categories} />
      </div>

      {/* Videos Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
        <VideoList courseId={course.id} videos={course.videos || []} />
      </div>
    </div>
  );
}
