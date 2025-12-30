import { createClient } from '@/app/_lib/supabase/server';

export async function getCourseComments(courseId: string) {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from('course_comments')
    .select(
      `
      *,
      profiles (
        id,
        email,
        avatar_url,
        role
      )
    `
    )
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return comments || [];
}

export async function getCommentCount(courseId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('course_comments')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (error) throw error;

  return count || 0;
}
