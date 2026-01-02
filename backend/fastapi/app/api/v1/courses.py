from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid
from app.db.session import get_db
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseListResponse,
    CourseListItem,
    PublishToggleRequest
)
from app.schemas.video import VideoResponse
from app.repositories.course import CourseRepository
from app.api.dependencies import get_current_instructor, get_current_user
from app.models.course import Course
from app.models.profile import Profile, UserRole

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=CourseListResponse)
async def get_courses(
    category: Optional[str] = Query(None, description="Category ID"),
    search: Optional[str] = Query(None, description="Search keyword"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """Get published courses list."""
    skip = (page - 1) * limit
    repo = CourseRepository(db)
    courses, total = await repo.get_published_courses(
        category_id=category,
        search=search,
        skip=skip,
        limit=limit
    )

    return CourseListResponse(
        data=[
            CourseListItem(
                **course.__dict__,
                video_count=len(course.videos) if course.videos else 0
            )
            for course in courses
        ],
        total=total,
        page=page,
        limit=limit
    )


@router.get("/instructor/courses", response_model=List[CourseResponse])
async def get_instructor_courses(
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Get all courses by the current instructor."""
    repo = CourseRepository(db)
    courses = await repo.get_instructor_courses(current_user.id)

    return [
        CourseResponse(
            **course.__dict__,
            video_count=len(course.videos) if course.videos else 0
        )
        for course in courses
    ]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get course details."""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # videosをVideoResponseに変換
    videos = [VideoResponse.model_validate(video) for video in course.videos] if course.videos else []

    # course.__dict__からvideosを除外
    course_dict = {k: v for k, v in course.__dict__.items() if k != 'videos'}

    return CourseResponse(
        **course_dict,
        videos=videos,
        video_count=len(course.videos) if course.videos else 0
    )


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Create a new course (instructors and admins only)."""
    repo = CourseRepository(db)

    new_course = Course(
        id=str(uuid.uuid4()),
        **course_data.model_dump(),
        instructor_id=current_user.id,
        is_published=False
    )

    created_course = await repo.create_course(new_course)
    
    # Reload to get relations
    created_course = await repo.get_course_by_id(created_course.id)
    
    return CourseResponse(**created_course.__dict__, video_count=0)


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Update a course."""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Permission check: own course or admin
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )

    # Update fields
    for field, value in course_data.model_dump(exclude_unset=True).items():
        setattr(course, field, value)

    updated_course = await repo.update_course(course)
    return CourseResponse(
        **updated_course.__dict__,
        video_count=len(updated_course.videos) if updated_course.videos else 0
    )


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Delete a course."""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Permission check
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this course"
        )

    await repo.delete_course(course)
    return None


@router.patch("/{course_id}/publish", response_model=CourseResponse)
async def toggle_publish(
    course_id: str,
    publish_data: PublishToggleRequest,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """Toggle course publish status."""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Permission check
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to publish this course"
        )

    course.is_published = publish_data.is_published
    updated_course = await repo.update_course(course)

    return CourseResponse(
        **updated_course.__dict__,
        video_count=len(updated_course.videos) if updated_course.videos else 0
    )
