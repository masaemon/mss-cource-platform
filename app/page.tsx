import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/app/_lib/supabase/server';
import { getCategories } from '@/app/_lib/queries/courses';
import { CourseList } from '@/app/_components/course-list';
import { CourseGridSkeleton } from '@/app/_components/course-card-skeleton';
import { SearchBar } from '@/app/_components/search-bar';
import { CategoryFilter } from '@/app/_components/category-filter';

export const revalidate = 3600; // ISR: 1時間ごとに再生成

interface HomeProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { category } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              新しいスキルを学び、キャリアを前進させましょう
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              YouTube動画で学ぶオンライン講座プラットフォーム
            </p>

            {!user && (
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 text-base font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  無料で始める
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 text-base font-bold text-gray-900 dark:text-white border border-gray-900 dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ログイン
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            カテゴリー
          </h2>
          <Suspense fallback={<div>読み込み中...</div>}>
            <CategoryFilter categories={categories} />
          </Suspense>
        </div>

        <Suspense fallback={<CourseGridSkeleton />}>
          <CourseList category={category} />
        </Suspense>
      </div>
    </div>
  );
}
