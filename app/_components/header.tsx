import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { Navigation } from './navigation';
import { HeaderActions } from './header-actions';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 3.6v8.55c0 4.55-3.08 8.8-8 9.93-4.92-1.13-8-5.38-8-9.93V7.78l8-3.6z"/>
                <path d="M10.5 14.5l-3-3 1.41-1.41L10.5 11.67l4.59-4.58L16.5 8.5z"/>
              </svg>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                MSS Course
              </span>
            </Link>
          </div>

          <Navigation user={user} profile={profile} />

          <HeaderActions user={user} profile={profile} />
        </div>
      </div>
    </header>
  );
}
