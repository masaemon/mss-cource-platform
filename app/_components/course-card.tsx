import Link from 'next/link';
import Image from 'next/image';
import type { Video } from '@/app/_lib/types/database';

interface CourseCardProps {
  course: {
    id: string;
    title_ja: string;
    description_ja?: string | null;
    thumbnail_url?: string | null;
    created_at: string;
    categories: {
      name_ja: string;
    } | null;
    profiles: {
      email: string;
      display_name?: string | null;
    } | null;
    videos?: Array<{ count: number }> | Video[] | { count: number };
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const displayName = course.profiles?.display_name || course.profiles?.email?.split('@')[0] || '不明';
  const truncatedDescription =
    course.description_ja?.slice(0, 100) + '...' || '';
  const videoCount =
    Array.isArray(course.videos) && 'count' in course.videos[0]
      ? course.videos[0].count
      : 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block border border-gray-300 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title_ja}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <svg
              className="w-16 h-16 text-gray-400"
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
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.title_ja}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {truncatedDescription}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
          <span>{displayName}</span>
          {videoCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {videoCount}
            </span>
          )}
        </div>

        {course.categories && (
          <div className="inline-block px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30">
            {course.categories.name_ja}
          </div>
        )}
      </div>
    </Link>
  );
}
