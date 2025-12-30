import { createClient } from '@/app/_lib/supabase/server';

export interface GetUsersParams {
  search?: string;
  role?: 'user' | 'instructor' | 'admin';
  page?: number;
  limit?: number;
}

export async function getUsers(params?: GetUsersParams) {
  const supabase = await createClient();
  const { search, role, page = 1, limit = 20 } = params || {};

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // テキスト検索
  if (search) {
    query = query.ilike('email', `%${search}%`);
  }

  // 役割フィルター
  if (role) {
    query = query.eq('role', role);
  }

  // ページネーション
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  query = query.range(start, end);

  const { data: users, count, error } = await query;

  if (error) throw error;

  return { users: users || [], count: count || 0 };
}

export async function getUserStats() {
  const supabase = await createClient();

  // 総ユーザー数
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 役割別ユーザー数
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user');

  const { count: instructorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'instructor');

  const { count: adminCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  // 総コース数
  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true });

  // 公開コース数
  const { count: publishedCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  return {
    totalUsers: totalUsers || 0,
    userCount: userCount || 0,
    instructorCount: instructorCount || 0,
    adminCount: adminCount || 0,
    totalCourses: totalCourses || 0,
    publishedCourses: publishedCourses || 0,
  };
}
