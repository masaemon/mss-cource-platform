from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.schemas.progress import (
    VideoProgressUpdate,
    VideoProgressResponse,
    UserProgressSummary,
    CourseProgressDetail,
    VideoProgressItem
)
from app.repositories.progress import ProgressRepository
from app.repositories.video import VideoRepository
from app.repositories.course import CourseRepository
from app.api.dependencies import get_current_user
from app.models.profile import Profile

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.post("/videos/{video_id}", response_model=VideoProgressResponse)
async def update_video_progress(
    video_id: str,
    progress_data: VideoProgressUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """動画の視聴進捗を更新"""
    # 動画が存在するか確認
    video_repo = VideoRepository(db)
    video = await video_repo.get_video_by_id(video_id)

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    progress_repo = ProgressRepository(db)
    progress = await progress_repo.get_or_create_progress(current_user.id, video_id)
    updated_progress = await progress_repo.update_progress(progress, progress_data.is_completed)

    return VideoProgressResponse.model_validate(updated_progress)


@router.get("/courses/{course_id}", response_model=CourseProgressDetail)
async def get_course_progress(
    course_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """ユーザーのコース進捗を取得"""
    # コースが存在するか確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    progress_repo = ProgressRepository(db)
    progress_data = await progress_repo.get_user_course_progress(current_user.id, course_id)

    # videos リストを VideoProgressItem に変換
    videos = [VideoProgressItem(**video) for video in progress_data["videos"]]

    return CourseProgressDetail(
        course_id=course_id,
        total_videos=progress_data["total_videos"],
        completed_videos=progress_data["completed_videos"],
        progress_percentage=progress_data["progress_percentage"],
        videos=videos
    )


@router.get("", response_model=List[UserProgressSummary])
async def get_all_progress(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """ユーザーの全コース進捗サマリーを取得"""
    progress_repo = ProgressRepository(db)
    summaries = await progress_repo.get_user_all_progress(current_user.id)

    return [UserProgressSummary(**summary) for summary in summaries]
