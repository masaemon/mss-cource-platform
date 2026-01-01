from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.models.video import Video


class VideoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_course_videos(self, course_id: str) -> List[Video]:
        """コースの動画を順序順で取得"""
        query = select(Video).where(
            Video.course_id == course_id
        ).order_by(Video.order_number)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_video_by_id(self, video_id: str) -> Optional[Video]:
        """IDで動画を取得"""
        result = await self.db.execute(
            select(Video).where(Video.id == video_id)
        )
        return result.scalar_one_or_none()

    async def create_video(self, video: Video) -> Video:
        """動画を作成"""
        self.db.add(video)
        await self.db.commit()
        await self.db.refresh(video)
        return video

    async def update_video(self, video: Video) -> Video:
        """動画を更新"""
        await self.db.commit()
        await self.db.refresh(video)
        return video

    async def delete_video(self, video: Video) -> None:
        """動画を削除"""
        await self.db.delete(video)
        await self.db.commit()

    async def get_max_order_number(self, course_id: str) -> int:
        """コース内の最大order_numberを取得"""
        result = await self.db.execute(
            select(func.max(Video.order_number)).where(Video.course_id == course_id)
        )
        max_order = result.scalar()
        return max_order if max_order else 0
