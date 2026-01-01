from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.comment import CourseComment


class CommentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_course_comments(self, course_id: str) -> List[CourseComment]:
        """コースのコメントを取得"""
        query = select(CourseComment).where(
            CourseComment.course_id == course_id
        ).options(
            selectinload(CourseComment.user)
        ).order_by(CourseComment.created_at.desc())

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_comment_by_id(self, comment_id: str) -> Optional[CourseComment]:
        """IDでコメントを取得"""
        query = select(CourseComment).where(
            CourseComment.id == comment_id
        ).options(selectinload(CourseComment.user))

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_comment(self, comment: CourseComment) -> CourseComment:
        """コメントを作成"""
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def delete_comment(self, comment: CourseComment) -> None:
        """コメントを削除"""
        await self.db.delete(comment)
        await self.db.commit()
