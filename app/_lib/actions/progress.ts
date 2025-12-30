'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleVideoProgress(
  videoId: string,
  isCompleted: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('video_progress').upsert(
    {
      user_id: user.id,
      video_id: videoId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,video_id',
    }
  );

  if (error) {
    console.error('Error toggling progress:', error);
    throw error;
  }

  // キャッシュを再検証
  revalidatePath('/courses/[id]', 'page');
  revalidatePath('/courses/[id]/watch/[videoId]', 'page');
  revalidatePath('/profile', 'page');

  return { success: true };
}
