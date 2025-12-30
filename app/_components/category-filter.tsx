'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';

interface Category {
  id: string;
  name_ja: string;
  name_en: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const selectedCategory = searchParams.get('category');

  const handleCategoryChange = (categoryId: string | null) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (categoryId) {
        params.set('category', categoryId);
      } else {
        params.delete('category');
      }

      // Determine the target path
      const targetPath = pathname === '/search' || params.toString() ? '/search' : '/';
      const queryString = params.toString();

      router.push(queryString ? `${targetPath}?${queryString}` : targetPath);
    });
  };

  return (
    <div role="group" aria-label="カテゴリーフィルター" className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryChange(null)}
        disabled={isPending}
        aria-pressed={!selectedCategory}
        aria-label="すべてのカテゴリーを表示"
        className={`px-4 py-2 rounded-full font-medium transition-all ${
          !selectedCategory
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        すべて
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.id)}
          disabled={isPending}
          aria-pressed={selectedCategory === category.id}
          aria-label={`${category.name_ja}カテゴリーでフィルター`}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            selectedCategory === category.id
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {category.name_ja}
        </button>
      ))}
      {isPending && (
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          フィルターを更新中です。しばらくお待ちください。
        </div>
      )}
    </div>
  );
}
