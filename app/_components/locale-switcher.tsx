'use client';

import { Languages } from 'lucide-react';
import { useState } from 'react';

export function LocaleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale] = useState<'ja' | 'en'>('ja'); // デフォルトは日本語

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="言語切り替え"
        title="言語を切り替え"
      >
        <Languages className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
            <button
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentLocale === 'ja'
                  ? 'font-bold text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => {
                // 将来の実装: ロケール切り替えロジック
                setIsOpen(false);
              }}
            >
              日本語
            </button>
            <button
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentLocale === 'en'
                  ? 'font-bold text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => {
                // 将来の実装: ロケール切り替えロジック
                setIsOpen(false);
              }}
              disabled
              title="現在、英語対応は準備中です"
            >
              English
              <span className="ml-1 text-xs text-gray-400">(準備中)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
