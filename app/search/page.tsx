import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { searchCourses, getCategories } from '@/app/_lib/queries/courses';
import { SearchBar } from '@/app/_components/search-bar';
import { CategoryFilter } from '@/app/_components/category-filter';
import { CourseCard } from '@/app/_components/course-card';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: q ? `"${q}"の検索結果` : 'コースを検索',
    description: 'オンライン講座プラットフォームでコースを検索',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category } = await searchParams;
  const courses = await searchCourses(q, category);
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            コースを検索
          </h1>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar />
          </div>

          {/* Category Filter */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              カテゴリーで絞り込む
            </h2>
            <Suspense fallback={<div>読み込み中...</div>}>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              {q && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  検索キーワード:{' '}
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {q}
                  </span>
                </p>
              )}
              <p
                className="text-lg font-bold text-gray-900 dark:text-white"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {courses.length}件のコースが見つかりました
              </p>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.id,
                  title_ja: course.title_ja,
                  description_ja: course.description_ja,
                  thumbnail_url: course.thumbnail_url,
                  created_at: course.created_at,
                  categories: Array.isArray(course.categories) ? course.categories[0] : course.categories,
                  profiles: Array.isArray(course.profiles) ? course.profiles[0] : course.profiles,
                  videos: course.videos,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              className="mx-auto w-24 h-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              コースが見つかりませんでした
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {q
                ? '別のキーワードで検索してみてください'
                : 'カテゴリーを選択するか、キーワードを入力してください'}
            </p>
            {(q || category) && (
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                すべてのコースを見る
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
