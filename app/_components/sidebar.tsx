'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role: 'instructor' | 'admin';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const linkClass = (path: string) => {
    const base =
      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors';
    const active =
      'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100';
    const inactive =
      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700';

    return `${base} ${isActive(path) ? active : inactive}`;
  };

  const instructorLinks = [
    { href: '/instructor/dashboard', label: 'ダッシュボード' },
    { href: '/instructor/courses', label: 'コース管理' },
    { href: '/instructor/courses/new', label: '新規コース作成' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'ダッシュボード' },
    { href: '/admin/users', label: 'ユーザー管理' },
    { href: '/admin/categories', label: 'カテゴリー管理' },
    { href: '/admin/courses', label: 'コース管理' },
  ];

  const links = role === 'admin' ? adminLinks : instructorLinks;
  const title = role === 'admin' ? '管理者' : '講師';

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}メニュー
        </h2>

        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </aside>
  );
}
