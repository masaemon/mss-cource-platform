export function CourseCardSkeleton() {
  return (
    <div className="block border border-gray-300 dark:border-gray-700 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />

      <div className="p-4 bg-white dark:bg-gray-800">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />

        {/* Description skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3" />

        {/* Metadata skeleton */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
        </div>

        {/* Category badge skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    </div>
  );
}

export function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
