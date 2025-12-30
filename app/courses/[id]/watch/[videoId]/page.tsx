import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/app/_lib/supabase/server';
import { VideoPlayer } from '@/app/_components/video-player';
import { getUserProgress, calculateProgress } from '@/app/_lib/queries/progress';
import { WatchVideoListItem } from '../_components/watch-video-list-item';
import Link from 'next/link';
import type { Video } from '@/app/_lib/types/database';

type Props = {
  params: Promise<{ id: string; videoId: string }>;
};

async function getCourseWithVideos(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*, videos(*), categories(*), profiles!courses_instructor_id_fkey(*)')
    .eq('id', courseId)
    .single();

  if (error) return null;
  return data;
}

async function getVideo(videoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .single();

  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  const video = await getVideo(videoId);

  if (!video) {
    return {
      title: '動画が見つかりません',
    };
  }

  return {
    title: video.title_ja,
    description: video.description_ja,
  };
}

export default async function WatchPage({ params }: Props) {
  const { id: courseId, videoId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証チェック（必要に応じて）
  if (!user) {
    redirect('/login');
  }

  const course = await getCourseWithVideos(courseId);
  const video = await getVideo(videoId);

  if (!course || !video) {
    notFound();
  }

  // コースに動画が含まれているか確認
  const videoInCourse = course.videos?.find((v: Video) => v.id === videoId);
  if (!videoInCourse) {
    notFound();
  }

  // Get progress data for all videos in the course
  const progress = await getUserProgress(user.id, courseId);

  // Create a map of video completion status
  const progressMap = new Map(
    progress.map((p) => [p.video_id, p.is_completed])
  );

  // Calculate overall completion percentage
  const completedCount = progress.filter((p) => p.is_completed).length;
  const totalVideos = course.videos?.length || 0;
  const completionPercentage = calculateProgress(totalVideos, completedCount);

  // 動画をorder_numberでソート
  const sortedVideos = course.videos?.sort(
    (a: Video, b: Video) => a.order_number - b.order_number
  ) || [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Video Player Section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <VideoPlayer
            videoId={video.youtube_video_id}
            title={video.title_ja}
            currentVideoId={videoId}
            userId={user.id}
          />
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="mb-4 text-sm">
              <Link
                href={`/courses/${courseId}`}
                className="text-purple-600 hover:text-purple-700 font-bold"
              >
                ← コースに戻る
              </Link>
            </div>

            {/* Video Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {video.title_ja}
            </h1>

            {/* Video Description */}
            {video.description_ja && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  概要
                </h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {video.description_ja}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Video List */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white">
                  コース内容
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {sortedVideos.length}本の動画
                </p>
                {totalVideos > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        進捗状況
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {sortedVideos.map((v: Video, index: number) => (
                  <WatchVideoListItem
                    key={v.id}
                    video={v}
                    courseId={courseId}
                    currentVideoId={videoId}
                    index={index}
                    isCompleted={progressMap.get(v.id) || false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
