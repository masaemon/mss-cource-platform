from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from app.models.video_progress import VideoProgress
from app.models.video import Video
from app.models.course import Course
from datetime import datetime
import uuid


class ProgressRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_progress(
        self, user_id: str, video_id: str
    ) -> VideoProgress:
        """進捗を取得、なければ作成"""
        result = await self.db.execute(
            select(VideoProgress).where(
                VideoProgress.user_id == user_id,
                VideoProgress.video_id == video_id
            )
        )
        progress = result.scalar_one_or_none()

        if not progress:
            progress = VideoProgress(
                id=str(uuid.uuid4()),
                user_id=user_id,
                video_id=video_id,
                is_completed=False
            )
            self.db.add(progress)
            await self.db.commit()
            await self.db.refresh(progress)

        return progress

    async def update_progress(
        self, progress: VideoProgress, is_completed: bool
    ) -> VideoProgress:
        """進捗を更新"""
        progress.is_completed = is_completed
        progress.completed_at = datetime.utcnow() if is_completed else None
        await self.db.commit()
        await self.db.refresh(progress)
        return progress

    async def get_user_course_progress(
        self, user_id: str, course_id: str
    ) -> dict:
        """ユーザーのコース進捗を取得"""
        # コースの全動画を取得
        videos_result = await self.db.execute(
            select(Video).where(Video.course_id == course_id).order_by(Video.order_number)
        )
        videos = list(videos_result.scalars().all())

        if not videos:
            return {
                "total_videos": 0,
                "completed_videos": 0,
                "progress_percentage": 0.0,
                "videos": []
            }

        # ユーザーの進捗を取得
        video_ids = [v.id for v in videos]
        progress_result = await self.db.execute(
            select(VideoProgress).where(
                VideoProgress.user_id == user_id,
                VideoProgress.video_id.in_(video_ids)
            )
        )
        progress_list = list(progress_result.scalars().all())
        progress_map = {p.video_id: p for p in progress_list}

        # 動画ごとの進捗情報を構築
        video_progress = []
        completed_count = 0

        for video in videos:
            progress = progress_map.get(video.id)
            is_completed = progress.is_completed if progress else False
            if is_completed:
                completed_count += 1

            video_progress.append({
                "video_id": video.id,
                "title_ja": video.title_ja,
                "title_en": video.title_en,
                "order_number": video.order_number,
                "is_completed": is_completed
            })

        total_videos = len(videos)
        progress_percentage = (completed_count / total_videos * 100) if total_videos > 0 else 0.0

        return {
            "total_videos": total_videos,
            "completed_videos": completed_count,
            "progress_percentage": round(progress_percentage, 2),
            "videos": video_progress
        }

    async def get_user_all_progress(self, user_id: str) -> List[dict]:
        """ユーザーの全コース進捗サマリーを取得"""
        # ユーザーが進捗を持っているコースを取得
        result = await self.db.execute(
            select(Course).join(Video).join(VideoProgress).where(
                VideoProgress.user_id == user_id
            ).distinct()
        )
        courses = list(result.scalars().all())

        summaries = []
        for course in courses:
            progress_data = await self.get_user_course_progress(user_id, course.id)
            summaries.append({
                "course_id": course.id,
                "course_title_ja": course.title_ja,
                **progress_data
            })

        return summaries
