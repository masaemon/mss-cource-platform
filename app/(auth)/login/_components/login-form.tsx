'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signIn } from '@/app/_lib/actions/auth';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 text-base font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'ログイン中...' : 'ログイン'}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, null);

  return (
    <div className="border border-gray-300 dark:border-gray-700 p-8 bg-white dark:bg-gray-800 shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        ログイン
      </h2>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {state.error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-bold text-gray-900 dark:text-white mb-2"
          >
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-3 border border-gray-900 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-gray-900 dark:text-white mb-2"
          >
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-3 border border-gray-900 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-800 dark:text-white"
            placeholder="••••••••"
          />
        </div>

        <div>
          <SubmitButton />
        </div>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          アカウントをお持ちでない方は{' '}
          <Link
            href="/signup"
            className="font-bold text-purple-600 hover:text-purple-700"
          >
            新規登録
          </Link>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/reset-password"
            className="font-bold text-purple-600 hover:text-purple-700"
          >
            パスワードを忘れた方
          </Link>
        </p>
      </div>
    </div>
  );
}
