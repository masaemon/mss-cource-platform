import { cache } from 'react';
import { createClient } from '@/app/_lib/supabase/server';
import { logger } from '@/app/_lib/utils/logger';
import type { Video } from '@/app/_lib/types/database';

export const getPublishedCourses = cache(async (categoryId?: string) => {
  const supabase = await createClient();

  let query = supabase
    .from('courses')
    .select(`
      id,
      title_ja,
      title_en,
      description_ja,
      description_en,
      thumbnail_url,
      created_at,
      categories(id, name_ja, name_en, slug),
      profiles!courses_instructor_id_fkey(id, email),
      videos(count)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching courses:', error);
    return [];
  }

  return data;
});

export const getCourse = cache(async (id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      categories(*),
      profiles!courses_instructor_id_fkey(*),
      videos(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    logger.error('Error fetching course:', error);
    return null;
  }

  // Sort videos by order_number
  if (data.videos) {
    data.videos.sort((a: Video, b: Video) => a.order_number - b.order_number);
  }

  return data;
});

export const getCategories = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_ja');

  if (error) {
    logger.error('Error fetching categories:', error);
    return [];
  }

  return data;
});

export const searchCourses = cache(async (query?: string, categoryId?: string) => {
  const supabase = await createClient();

  let dbQuery = supabase
    .from('courses')
    .select(`
      id,
      title_ja,
      title_en,
      description_ja,
      description_en,
      thumbnail_url,
      created_at,
      categories(id, name_ja, name_en, slug),
      profiles!courses_instructor_id_fkey(id, email),
      videos(count)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // Text search (title and description in both languages)
  if (query && query.trim()) {
    dbQuery = dbQuery.or(
      `title_ja.ilike.%${query}%,title_en.ilike.%${query}%,description_ja.ilike.%${query}%,description_en.ilike.%${query}%`
    );
  }

  // Category filter
  if (categoryId) {
    dbQuery = dbQuery.eq('category_id', categoryId);
  }

  const { data, error } = await dbQuery;

  if (error) {
    logger.error('Error searching courses:', error);
    return [];
  }

  return data;
});
