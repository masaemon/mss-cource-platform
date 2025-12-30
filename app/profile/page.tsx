import { createClient } from '@/app/_lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/_lib/actions/auth';
import { ProfileEditForm } from '@/app/profile/_components/ProfileEditForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // プロファイル情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              プロフィール編集
            </h1>

            <ProfileEditForm profile={profile} />
          </div>

          <div className="px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
