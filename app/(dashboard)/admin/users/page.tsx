import { createClient } from '@/app/_lib/supabase/server';
import { getUsers } from '@/app/_lib/queries/users';
import { redirect } from 'next/navigation';
import { UserTable } from './_components/user-table';
import { UserSearch } from './_components/user-search';

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: 'user' | 'instructor' | 'admin';
    page?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 管理者チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  const params = await searchParams;
  const { search, role, page } = params;
  const { users, count } = await getUsers({
    search,
    role,
    page: page ? parseInt(page) : 1,
  });

  const currentPage = page ? parseInt(page) : 1;
  const totalPages = Math.ceil(count / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ユーザー管理</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {count}人のユーザーが登録されています
        </p>
      </div>

      <UserSearch />

      <UserTable
        users={users}
        currentUserId={user.id}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
