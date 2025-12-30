export default function Loading() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse" />

          <div className="p-8 space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>

            <div className="flex items-center pt-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="ml-4 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
              </div>
            </div>

            <div className="pt-8">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse" />
                    <div className="ml-4 flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
