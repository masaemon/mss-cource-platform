-- サンプル講座作成用SQLスクリプト
-- Supabase SQL Editorで実行してください

-- 1. 講師アカウントの作成（既存のユーザーを講師に昇格）
-- 注: 実際のユーザーIDに置き換えてください
-- UPDATE profiles SET role = 'instructor' WHERE email = 'your-email@example.com';

-- 2. カテゴリーの確認（既存のカテゴリーIDを使用）
-- SELECT id, name_ja FROM categories;

-- 3. サンプル講座の作成
-- 注: instructor_id と category_id を実際の値に置き換えてください

-- 講座1: Next.js入門
INSERT INTO courses (
  id,
  title_ja,
  title_en,
  description_ja,
  description_en,
  instructor_id,
  category_id,
  thumbnail_url,
  is_published,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Next.js 15 完全入門',
  'Complete Guide to Next.js 15',
  'Next.js 15の基礎から応用まで、App Routerを使った最新の開発手法を学びます。Server ComponentsやServer Actionsなど、最新機能を実践的に解説します。',
  'Learn Next.js 15 from basics to advanced topics, including App Router, Server Components, and Server Actions with practical examples.',
  (SELECT id FROM profiles WHERE role IN ('instructor', 'admin') LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'programming' LIMIT 1),
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  true,
  now(),
  now()
) RETURNING id;

-- 講座2: TypeScript実践
INSERT INTO courses (
  id,
  title_ja,
  title_en,
  description_ja,
  description_en,
  instructor_id,
  category_id,
  thumbnail_url,
  is_published,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'TypeScript実践入門',
  'Practical TypeScript Guide',
  'TypeScriptの基本から、型システムの深い理解、ジェネリクス、ユーティリティ型まで実践的に学習します。実際のプロジェクトで使える技術を習得できます。',
  'Master TypeScript from fundamentals to advanced topics including generics and utility types with real-world project examples.',
  (SELECT id FROM profiles WHERE role IN ('instructor', 'admin') LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'programming' LIMIT 1),
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  true,
  now(),
  now()
) RETURNING id;

-- 講座3: React Hooks完全ガイド
INSERT INTO courses (
  id,
  title_ja,
  title_en,
  description_ja,
  description_en,
  instructor_id,
  category_id,
  thumbnail_url,
  is_published,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'React Hooks完全ガイド',
  'Complete React Hooks Guide',
  'useState、useEffect、useContextなどの基本フックから、カスタムフックの作成まで、React Hooksを完全マスターします。',
  'Master React Hooks from basics like useState and useEffect to creating custom hooks for reusable logic.',
  (SELECT id FROM profiles WHERE role IN ('instructor', 'admin') LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'programming' LIMIT 1),
  'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
  true,
  now(),
  now()
) RETURNING id;

-- 講座4: Tailwind CSS デザイン入門
INSERT INTO courses (
  id,
  title_ja,
  title_en,
  description_ja,
  description_en,
  instructor_id,
  category_id,
  thumbnail_url,
  is_published,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Tailwind CSSでモダンUIデザイン',
  'Modern UI Design with Tailwind CSS',
  'Tailwind CSSを使って、レスポンシブで美しいUIを効率的に構築する方法を学びます。ダークモード対応やカスタマイズ方法も解説します。',
  'Learn to build responsive and beautiful UIs efficiently with Tailwind CSS, including dark mode and customization.',
  (SELECT id FROM profiles WHERE role IN ('instructor', 'admin') LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'design' LIMIT 1),
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
  true,
  now(),
  now()
) RETURNING id;

-- 講座5: Supabaseバックエンド開発
INSERT INTO courses (
  id,
  title_ja,
  title_en,
  description_ja,
  description_en,
  instructor_id,
  category_id,
  thumbnail_url,
  is_published,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Supabaseで学ぶバックエンド開発',
  'Backend Development with Supabase',
  'Supabaseを使った認証、データベース設計、Row Level Security、リアルタイム機能の実装方法を実践的に学びます。',
  'Learn authentication, database design, Row Level Security, and real-time features with Supabase through practical examples.',
  (SELECT id FROM profiles WHERE role IN ('instructor', 'admin') LIMIT 1),
  (SELECT id FROM categories WHERE slug = 'programming' LIMIT 1),
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  true,
  now(),
  now()
) RETURNING id;

-- 動画データは講座作成後、UIから追加するか、以下のようなINSERT文で追加できます
-- 注: course_id を実際の値に置き換えてください

-- 例: Next.js入門講座の動画
/*
INSERT INTO videos (
  course_id,
  title_ja,
  title_en,
  description_ja,
  description_en,
  youtube_url,
  youtube_video_id,
  order_number,
  duration_seconds
) VALUES
  ((SELECT id FROM courses WHERE title_ja = 'Next.js 15 完全入門'), 'はじめに - コース概要', 'Introduction - Course Overview', 'このコースで学べる内容を紹介します', 'Overview of what you will learn in this course', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 1, 300),
  ((SELECT id FROM courses WHERE title_ja = 'Next.js 15 完全入門'), 'Next.js のインストール', 'Installing Next.js', 'Next.js プロジェクトのセットアップ方法', 'How to set up a Next.js project', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 2, 600),
  ((SELECT id FROM courses WHERE title_ja = 'Next.js 15 完全入門'), 'App Router の基礎', 'App Router Basics', 'App Router の基本的な使い方を学びます', 'Learn the basics of App Router', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 3, 900);
*/

-- 実行後の確認
SELECT
  c.id,
  c.title_ja,
  c.is_published,
  p.email as instructor_email,
  cat.name_ja as category
FROM courses c
JOIN profiles p ON c.instructor_id = p.id
JOIN categories cat ON c.category_id = cat.id
ORDER BY c.created_at DESC;
