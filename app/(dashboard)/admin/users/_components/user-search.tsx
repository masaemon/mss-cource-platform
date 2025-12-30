'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export function UserSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch('');
    setRole('');
    startTransition(() => {
      router.push('/admin/users');
    });
  };

  return (
    <form onSubmit={handleSearch} className="bg-white border rounded-lg p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレスで検索
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="user@example.com"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="w-full md:w-48">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            役割でフィルター
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">すべて</option>
            <option value="user">一般ユーザー</option>
            <option value="instructor">講師</option>
            <option value="admin">管理者</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            検索
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            クリア
          </button>
        </div>
      </div>
    </form>
  );
}
