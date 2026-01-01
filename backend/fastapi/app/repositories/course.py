from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from app.models.course import Course


class CourseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_published_courses(
        self,
        category_id: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Course], int]:
        """Get published courses with optional filtering."""
        query = select(Course).where(Course.is_published == True)

        # Category filter
        if category_id:
            query = query.where(Course.category_id == category_id)

        # Search
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Course.title_ja.ilike(search_term),
                    Course.title_en.ilike(search_term),
                    Course.description_ja.ilike(search_term),
                    Course.description_en.ilike(search_term)
                )
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Get courses with relations
        query = query.options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.videos)
        ).offset(skip).limit(limit).order_by(Course.created_at.desc())

        result = await self.db.execute(query)
        courses = result.scalars().all()

        return list(courses), total

    async def get_course_by_id(self, course_id: str) -> Optional[Course]:
        """Get course by ID with relations."""
        query = select(Course).where(Course.id == course_id).options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.videos)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_instructor_courses(self, instructor_id: str) -> List[Course]:
        """Get all courses by instructor."""
        query = select(Course).where(Course.instructor_id == instructor_id).options(
            selectinload(Course.category),
            selectinload(Course.videos)
        ).order_by(Course.created_at.desc())

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_course(self, course: Course) -> Course:
        """Create a new course."""
        self.db.add(course)
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def update_course(self, course: Course) -> Course:
        """Update an existing course."""
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def delete_course(self, course: Course) -> None:
        """Delete a course."""
        await self.db.delete(course)
        await self.db.commit()
