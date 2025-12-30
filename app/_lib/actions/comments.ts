'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { checkRateLimit, getRateLimitErrorMessage } from '@/app/_lib/utils/rate-limit';

export async function addComment(courseId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Rate limiting: 1ユーザーあたり1分間に5コメントまで
  const rateLimitResult = checkRateLimit({
    identifier: `comment:${user.id}`,
    maxRequests: 5,
    windowSeconds: 60,
  });

  if (!rateLimitResult.allowed) {
    throw new Error(getRateLimitErrorMessage(rateLimitResult));
  }

  if (!content.trim()) {
    throw new Error('コメントを入力してください');
  }

  if (content.length > 1000) {
    throw new Error('コメントは1000文字以内で入力してください');
  }

  const commentData = {
    course_id: courseId,
    user_id: user.id,
    content: content.trim(),
    is_instructor_reply: false,
  };

  const { error } = await supabase.from('course_comments').insert(commentData);

  if (error) throw error;

  revalidatePath(`/courses/${courseId}`);
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // コメントの所有者チェック
  const { data: comment } = await supabase
    .from('course_comments')
    .select('user_id, course_id')
    .eq('id', commentId)
    .single();

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.user_id !== user.id) {
    // 管理者チェック
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Forbidden');
    }
  }

  const { error } = await supabase
    .from('course_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;

  revalidatePath(`/courses/${comment.course_id}`);
}

export async function addInstructorReply(courseId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Rate limiting: 講師も1分間に10コメントまで
  const rateLimitResult = checkRateLimit({
    identifier: `instructor-reply:${user.id}`,
    maxRequests: 10,
    windowSeconds: 60,
  });

  if (!rateLimitResult.allowed) {
    throw new Error(getRateLimitErrorMessage(rateLimitResult));
  }

  // ユーザーの役割チェック
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['instructor', 'admin'].includes(profile.role)) {
    throw new Error('Forbidden: Only instructors and admins can reply');
  }

  // コースの講師チェック（管理者は全コース回答可能）
  const { data: course } = await supabase
    .from('courses')
    .select('instructor_id')
    .eq('id', courseId)
    .single();

  if (profile.role !== 'admin' && course?.instructor_id !== user.id) {
    throw new Error('You can only reply to comments on your own courses');
  }

  if (!content.trim()) {
    throw new Error('回答を入力してください');
  }

  if (content.length > 1000) {
    throw new Error('回答は1000文字以内で入力してください');
  }

  const commentData = {
    course_id: courseId,
    user_id: user.id,
    content: content.trim(),
    is_instructor_reply: true,
  };

  const { error } = await supabase.from('course_comments').insert(commentData);

  if (error) throw error;

  revalidatePath(`/courses/${courseId}`);
}
