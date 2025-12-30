'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface NavigationProps {
  user: User | null;
  profile: { role: string; email: string } | null;
}

export function Navigation({ user, profile }: NavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const linkClass = (path: string) => {
    const base =
      'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    const active =
      'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white';
    const inactive =
      'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';

    return `${base} ${isActive(path) ? active : inactive}`;
  };

  return (
    <nav className="hidden md:flex space-x-4">
      <Link href="/" className={linkClass('/')}>
        ホーム
      </Link>

      {user && (
        <>
          <Link href="/profile" className={linkClass('/profile')}>
            マイページ
          </Link>

          {(profile?.role === 'instructor' || profile?.role === 'admin') && (
            <Link
              href="/instructor/dashboard"
              className={linkClass('/instructor/dashboard')}
            >
              講師ダッシュボード
            </Link>
          )}

          {profile?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              className={linkClass('/admin/dashboard')}
            >
              管理ダッシュボード
            </Link>
          )}
        </>
      )}

      {!user && (
        <>
          <Link href="/login" className={linkClass('/login')}>
            ログイン
          </Link>
          <Link href="/signup" className={linkClass('/signup')}>
            新規登録
          </Link>
        </>
      )}
    </nav>
  );
}
