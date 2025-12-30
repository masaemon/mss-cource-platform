'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(
  userId: string,
  newRole: 'user' | 'instructor' | 'admin'
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 管理者チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Admin only');
  }

  // 自分自身の役割変更を防ぐ
  if (userId === user.id) {
    throw new Error('Cannot change your own role');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;

  revalidatePath('/admin/users');
  revalidatePath('/admin/dashboard');
}
