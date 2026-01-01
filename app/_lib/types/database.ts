// Database types for type-safe queries

export interface Profile {
  id: string;
  email: string;
  display_name?: string | null;
  avatar_url?: string | null;
  role: 'user' | 'instructor' | 'admin';
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name_ja: string;
  name_en: string;
  slug: string;
  created_at?: string;
}

export interface Course {
  id: string;
  title_ja: string;
  title_en?: string | null;
  description_ja?: string | null;
  description_en?: string | null;
  thumbnail_url?: string | null;
  category_id: string;
  instructor_id: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: Category | null;
  profiles?: Profile | null;
  videos?: Video[] | { count: number };
}

export interface Video {
  id: string;
  course_id: string;
  title_ja: string;
  title_en?: string | null;
  description_ja?: string | null;
  description_en?: string | null;
  youtube_url: string;
  youtube_video_id: string;
  order_number: number;
  duration?: number | null;
  duration_seconds?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  is_completed: boolean;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseComment {
  id: string;
  course_id: string;
  user_id: string;
  content: string;
  is_instructor_reply: boolean;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
}

// Extended types for components
export interface CourseWithRelations extends Course {
  categories: Category | null;
  profiles: Profile | null;
  videos: Video[];
}

export interface VideoWithProgress extends Video {
  video_progress?: VideoProgress[];
}
