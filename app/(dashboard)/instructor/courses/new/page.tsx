import { getCategories } from '@/app/_lib/queries/courses';
import { CourseForm } from '@/app/_components/course-form';
import Link from 'next/link';

export default async function NewCoursePage() {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
          新規コース作成
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          新しいコースを作成して、生徒に知識を共有しましょう
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
        <CourseForm categories={categories} />
      </div>
    </div>
  );
}
