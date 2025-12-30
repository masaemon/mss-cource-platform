'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { logger } from '@/app/_lib/utils/logger';

async function checkInstructorRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['instructor', 'admin'].includes(profile.role)) {
    throw new Error('Forbidden: Instructor or admin role required');
  }

  return { user, profile };
}

export async function createCourse(formData: FormData) {
  const { user } = await checkInstructorRole();

  const courseData = {
    title_ja: formData.get('title_ja') as string,
    title_en: formData.get('title_en') as string,
    description_ja: formData.get('description_ja') as string,
    description_en: formData.get('description_en') as string,
    category_id: formData.get('category_id') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    instructor_id: user.id,
    is_published: false,
  };

  // Validation
  if (!courseData.title_ja || !courseData.category_id) {
    throw new Error('Title (Japanese) and Category are required');
  }

  if (courseData.title_ja.length > 100) {
    throw new Error('タイトル（日本語）は100文字以内で入力してください');
  }

  if (courseData.title_en && courseData.title_en.length > 100) {
    throw new Error('タイトル（英語）は100文字以内で入力してください');
  }

  if (courseData.description_ja && courseData.description_ja.length > 1000) {
    throw new Error('説明（日本語）は1000文字以内で入力してください');
  }

  if (courseData.description_en && courseData.description_en.length > 1000) {
    throw new Error('説明（英語）は1000文字以内で入力してください');
  }

  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from('courses')
    .insert(courseData)
    .select()
    .single();

  if (error) {
    logger.error('Error creating course:', error);
    throw new Error('Failed to create course');
  }

  revalidatePath('/instructor/dashboard');
  revalidatePath('/');
  redirect(`/instructor/courses/${course.id}/edit`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await checkInstructorRole();

  const courseData = {
    title_ja: formData.get('title_ja') as string,
    title_en: formData.get('title_en') as string,
    description_ja: formData.get('description_ja') as string,
    description_en: formData.get('description_en') as string,
    category_id: formData.get('category_id') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    updated_at: new Date().toISOString(),
  };

  // Validation
  if (!courseData.title_ja || !courseData.category_id) {
    throw new Error('Title (Japanese) and Category are required');
  }

  if (courseData.title_ja.length > 100) {
    throw new Error('タイトル（日本語）は100文字以内で入力してください');
  }

  if (courseData.title_en && courseData.title_en.length > 100) {
    throw new Error('タイトル（英語）は100文字以内で入力してください');
  }

  if (courseData.description_ja && courseData.description_ja.length > 1000) {
    throw new Error('説明（日本語）は1000文字以内で入力してください');
  }

  if (courseData.description_en && courseData.description_en.length > 1000) {
    throw new Error('説明（英語）は1000文字以内で入力してください');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('courses')
    .update(courseData)
    .eq('id', courseId);

  if (error) {
    logger.error('Error updating course:', error);
    throw new Error('Failed to update course');
  }

  revalidatePath('/instructor/dashboard');
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/');

  return { success: true };
}

export async function deleteCourse(courseId: string) {
  await checkInstructorRole();

  const supabase = await createClient();
  const { error } = await supabase.from('courses').delete().eq('id', courseId);

  if (error) {
    logger.error('Error deleting course:', error);
    throw new Error('Failed to delete course');
  }

  revalidatePath('/instructor/dashboard');
  revalidatePath('/');
  redirect('/instructor/dashboard');
}

export async function togglePublish(courseId: string, isPublished: boolean) {
  await checkInstructorRole();

  const supabase = await createClient();
  const { error } = await supabase
    .from('courses')
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId);

  if (error) {
    logger.error('Error toggling publish status:', error);
    throw new Error('Failed to update publish status');
  }

  revalidatePath('/instructor/dashboard');
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/');

  return { success: true };
}
