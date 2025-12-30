'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition, FormEvent, useEffect } from 'react';
import { useDebounce } from '@/app/_lib/hooks/use-debounce';

interface SearchBarProps {
  className?: string;
  enableAutoSearch?: boolean; // 自動検索を有効にするか（デバウンス）
}

export function SearchBar({ className = '', enableAutoSearch = true }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 500);

  // デバウンスされたクエリが変更されたら自動検索
  useEffect(() => {
    if (!enableAutoSearch) return;

    // 初回マウント時は検索しない
    const currentQuery = searchParams.get('q') || '';
    if (debouncedQuery === currentQuery) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (debouncedQuery.trim()) {
        params.set('q', debouncedQuery.trim());
        router.push(`/search?${params.toString()}`);
      } else {
        params.delete('q');
        // If there are other params (like category), stay on search page
        if (params.toString()) {
          router.push(`/search?${params.toString()}`);
        } else {
          router.push('/');
        }
      }
    });
  }, [debouncedQuery, enableAutoSearch, router, searchParams]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 手動送信の場合は即座に検索
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (query.trim()) {
        params.set('q', query.trim());
        router.push(`/search?${params.toString()}`);
      } else {
        params.delete('q');
        // If there are other params (like category), stay on search page
        if (params.toString()) {
          router.push(`/search?${params.toString()}`);
        } else {
          router.push('/');
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} role="search">
      <div className="relative">
        <label htmlFor="course-search" className="sr-only">
          コースを検索
        </label>
        <input
          id="course-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="コースを検索..."
          disabled={isPending}
          aria-label="コース検索"
          aria-describedby={isPending ? 'search-status' : undefined}
          className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <button
        type="submit"
        disabled={isPending}
        aria-label={isPending ? '検索中' : 'コースを検索'}
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? '検索中...' : '検索'}
      </button>
      {isPending && (
        <div id="search-status" className="sr-only" aria-live="polite" aria-atomic="true">
          検索中です。しばらくお待ちください。
        </div>
      )}
    </form>
  );
}
