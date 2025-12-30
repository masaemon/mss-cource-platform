'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkRateLimit, getRateLimitErrorMessage } from '@/app/_lib/utils/rate-limit';

export async function signIn(
  prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください' };
  }

  // Rate limiting: 1メールアドレスあたり5分間に5回まで
  const rateLimitResult = checkRateLimit({
    identifier: `login:${email}`,
    maxRequests: 5,
    windowSeconds: 300, // 5分
  });

  if (!rateLimitResult.allowed) {
    return { error: getRateLimitErrorMessage(rateLimitResult) };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUp(
  prevState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください' };
  }

  // Rate limiting: 1メールアドレスあたり1時間に3回まで
  const rateLimitResult = checkRateLimit({
    identifier: `signup:${email}`,
    maxRequests: 3,
    windowSeconds: 3600, // 1時間
  });

  if (!rateLimitResult.allowed) {
    return { error: getRateLimitErrorMessage(rateLimitResult) };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/verify-email');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function resetPassword(
  prevState: { error: string; success?: undefined } | { success: string; error?: undefined } | null,
  formData: FormData
) {
  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'メールアドレスを入力してください' };
  }

  // Rate limiting: 1メールアドレスあたり1時間に3回まで
  const rateLimitResult = checkRateLimit({
    identifier: `reset:${email}`,
    maxRequests: 3,
    windowSeconds: 3600, // 1時間
  });

  if (!rateLimitResult.allowed) {
    return { error: getRateLimitErrorMessage(rateLimitResult) };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/profile`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'パスワードリセット用のメールを送信しました' };
}
