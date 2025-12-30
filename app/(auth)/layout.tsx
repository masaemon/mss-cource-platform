export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            MSS Course
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            スキルアップのための学習プラットフォーム
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
