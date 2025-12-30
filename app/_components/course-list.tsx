import Link from 'next/link';
import { getPublishedCourses } from '@/app/_lib/queries/courses';
import { CourseCard } from './course-card';

interface CourseListProps {
  category?: string;
}

export async function CourseList({ category }: CourseListProps) {
  const courses = await getPublishedCourses(category);

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <svg
          className="mx-auto w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
          {category
            ? 'このカテゴリーにはコースがありません'
            : '公開されているコースはまだありません'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {category
            ? '別のカテゴリーを選択してください'
            : '新しいコースが追加されるまでお待ちください'}
        </p>
        {category && (
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
          >
            すべてのコースを見る
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {category ? 'フィルター結果' : '人気のコース'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{courses.length} コース</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={{
              ...course,
              categories: Array.isArray(course.categories) ? course.categories[0] : course.categories,
              profiles: Array.isArray(course.profiles) ? course.profiles[0] : course.profiles,
            }}
          />
        ))}
      </div>
    </>
  );
}
