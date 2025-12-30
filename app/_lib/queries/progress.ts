import { createClient } from '@/app/_lib/supabase/server';

export async function getUserProgress(userId: string, courseId: string) {
  const supabase = await createClient();

  // コースの動画IDを取得
  const { data: videos } = await supabase
    .from('videos')
    .select('id')
    .eq('course_id', courseId);

  const videoIds = videos?.map((v) => v.id) || [];

  if (videoIds.length === 0) {
    return [];
  }

  // 進捗データを取得
  const { data: progress } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .in('video_id', videoIds);

  return progress || [];
}

export async function getVideoProgress(userId: string, videoId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('video_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .single();

  return data;
}

export async function getAllUserProgress(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('video_progress')
    .select('*, videos!inner(*, courses!inner(*))')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  return data || [];
}

export function calculateProgress(totalVideos: number, completedCount: number) {
  if (totalVideos === 0) return 0;
  return Math.round((completedCount / totalVideos) * 100);
}
