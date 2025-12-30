'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { extractYouTubeVideoId } from '@/app/_lib/utils/youtube';
import { logger } from '@/app/_lib/utils/logger';

async function checkCourseOwnership(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single();

  if (!course) {
    throw new Error('Course not found');
  }

  if (course.instructor_id !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Forbidden: You do not own this course');
    }
  }

  return { user, supabase };
}

export async function addVideo(courseId: string, formData: FormData) {
  const { supabase } = await checkCourseOwnership(courseId);

  // Check video limit
  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (count && count >= 10) {
    throw new Error('コースあたりの動画は最大10本までです');
  }

  const youtubeUrl = formData.get('youtube_url') as string;
  const videoId = extractYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    throw new Error('有効なYouTube URLを入力してください');
  }

  // Get next order number
  const { data: lastVideo } = await supabase
    .from('videos')
    .select('order_number')
    .eq('course_id', courseId)
    .order('order_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const orderNumber = (lastVideo?.order_number || 0) + 1;

  const videoData = {
    course_id: courseId,
    title_ja: formData.get('title_ja') as string,
    title_en: (formData.get('title_en') as string) || null,
    description_ja: (formData.get('description_ja') as string) || null,
    description_en: (formData.get('description_en') as string) || null,
    youtube_url: youtubeUrl,
    youtube_video_id: videoId,
    order_number: orderNumber,
  };

  const { error } = await supabase.from('videos').insert(videoData);

  if (error) {
    logger.error('Error adding video:', error);
    throw new Error('Failed to add video');
  }

  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}`);

  return { success: true };
}

export async function updateVideo(videoId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const youtubeUrl = formData.get('youtube_url') as string;
  const extractedVideoId = extractYouTubeVideoId(youtubeUrl);

  if (!extractedVideoId) {
    throw new Error('有効なYouTube URLを入力してください');
  }

  const videoData = {
    title_ja: formData.get('title_ja') as string,
    title_en: (formData.get('title_en') as string) || null,
    description_ja: (formData.get('description_ja') as string) || null,
    description_en: (formData.get('description_en') as string) || null,
    youtube_url: youtubeUrl,
    youtube_video_id: extractedVideoId,
  };

  const { data: video, error } = await supabase
    .from('videos')
    .update(videoData)
    .eq('id', videoId)
    .select('course_id')
    .single();

  if (error) {
    logger.error('Error updating video:', error);
    throw new Error('Failed to update video');
  }

  revalidatePath(`/instructor/courses/${video.course_id}/edit`);
  revalidatePath(`/courses/${video.course_id}`);

  return { success: true };
}

export async function deleteVideo(videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get video info
  const { data: video } = await supabase
    .from('videos')
    .select('course_id, order_number')
    .eq('id', videoId)
    .single();

  if (!video) {
    throw new Error('Video not found');
  }

  // Check ownership
  await checkCourseOwnership(video.course_id);

  // Delete video
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId);

  if (deleteError) {
    logger.error('Error deleting video:', deleteError);
    throw new Error('Failed to delete video');
  }

  // Adjust order numbers of later videos
  const { data: laterVideos } = await supabase
    .from('videos')
    .select('id, order_number')
    .eq('course_id', video.course_id)
    .gt('order_number', video.order_number);

  if (laterVideos && laterVideos.length > 0) {
    for (const v of laterVideos) {
      await supabase
        .from('videos')
        .update({ order_number: v.order_number - 1 })
        .eq('id', v.id);
    }
  }

  revalidatePath(`/instructor/courses/${video.course_id}/edit`);
  revalidatePath(`/courses/${video.course_id}`);

  return { success: true };
}

export async function reorderVideo(
  courseId: string,
  videoId: string,
  direction: 'up' | 'down'
) {
  await checkCourseOwnership(courseId);

  const supabase = await createClient();

  const { data: currentVideo } = await supabase
    .from('videos')
    .select('order_number')
    .eq('id', videoId)
    .single();

  if (!currentVideo) {
    throw new Error('Video not found');
  }

  const newOrder =
    direction === 'up'
      ? currentVideo.order_number - 1
      : currentVideo.order_number + 1;

  if (newOrder < 1) {
    return { success: false, message: 'Already at the top' };
  }

  // Find swap video
  const { data: swapVideo } = await supabase
    .from('videos')
    .select('id')
    .eq('course_id', courseId)
    .eq('order_number', newOrder)
    .maybeSingle();

  if (!swapVideo) {
    return { success: false, message: 'Already at the bottom' };
  }

  // Swap order numbers
  await supabase
    .from('videos')
    .update({ order_number: newOrder })
    .eq('id', videoId);

  await supabase
    .from('videos')
    .update({ order_number: currentVideo.order_number })
    .eq('id', swapVideo.id);

  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}`);

  return { success: true };
}
