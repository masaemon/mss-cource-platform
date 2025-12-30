import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          コースが見つかりません
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          お探しのコースは存在しないか、削除された可能性があります。
        </p>

        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 text-base font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          コース一覧に戻る
        </Link>
      </div>
    </div>
  );
}
