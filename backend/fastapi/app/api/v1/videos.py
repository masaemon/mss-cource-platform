from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.schemas.video import VideoCreate, VideoUpdate, VideoResponse, VideoReorderRequest
from app.repositories.video import VideoRepository
from app.repositories.course import CourseRepository
from app.api.dependencies import get_current_instructor
from app.utils.youtube import extract_youtube_video_id
from app.models.profile import Profile, UserRole
from app.models.video import Video

router = APIRouter(prefix="/videos", tags=["Videos"])


@router.get("/courses/{course_id}/videos", response_model=List[VideoResponse])
async def get_course_videos(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """コースの動画一覧を取得"""
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    video_repo = VideoRepository(db)
    videos = await video_repo.get_course_videos(course_id)

    return [VideoResponse.model_validate(video) for video in videos]


@router.post("/courses/{course_id}/videos", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def create_video(
    course_id: str,
    video_data: VideoCreate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """コースに動画を追加"""
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 権限チェック
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add videos to this course"
        )

    # YouTube video_id を抽出
    youtube_video_id = extract_youtube_video_id(video_data.youtube_url)
    if not youtube_video_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube URL"
        )

    video_repo = VideoRepository(db)

    # order_numberが指定されていない場合は最後に追加
    order_number = video_data.order_number
    if not order_number:
        max_order = await video_repo.get_max_order_number(course_id)
        order_number = max_order + 1

    new_video = Video(
        id=str(uuid.uuid4()),
        course_id=course_id,
        title_ja=video_data.title_ja,
        title_en=video_data.title_en,
        description_ja=video_data.description_ja,
        description_en=video_data.description_en,
        youtube_url=video_data.youtube_url,
        youtube_video_id=youtube_video_id,
        order_number=order_number
    )

    created_video = await video_repo.create_video(new_video)
    return VideoResponse.model_validate(created_video)


@router.put("/{video_id}", response_model=VideoResponse)
async def update_video(
    video_id: str,
    video_data: VideoUpdate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """動画を更新"""
    video_repo = VideoRepository(db)
    video = await video_repo.get_video_by_id(video_id)

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # コースの権限チェック
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(video.course_id)

    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this video"
        )

    # YouTube URLが変更された場合、video_idを再抽出
    if video_data.youtube_url:
        youtube_video_id = extract_youtube_video_id(video_data.youtube_url)
        if not youtube_video_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid YouTube URL"
            )
        video.youtube_video_id = youtube_video_id
        video.youtube_url = video_data.youtube_url

    # 更新
    update_data = video_data.model_dump(exclude_unset=True, exclude={'youtube_url'})
    for field, value in update_data.items():
        setattr(video, field, value)

    updated_video = await video_repo.update_video(video)
    return VideoResponse.model_validate(updated_video)


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: str,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """動画を削除"""
    video_repo = VideoRepository(db)
    video = await video_repo.get_video_by_id(video_id)

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # コースの権限チェック
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(video.course_id)

    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this video"
        )

    await video_repo.delete_video(video)
    return None


@router.patch("/courses/{course_id}/reorder", response_model=List[VideoResponse])
async def reorder_videos(
    course_id: str,
    reorder_data: VideoReorderRequest,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """動画の順序を変更"""
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 権限チェック
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reorder videos"
        )

    video_repo = VideoRepository(db)

    # 各動画のorder_numberを更新
    for item in reorder_data.video_orders:
        video = await video_repo.get_video_by_id(item.video_id)
        if video and video.course_id == course_id:
            video.order_number = item.order_number
            await video_repo.update_video(video)

    # 更新後の動画一覧を返す
    videos = await video_repo.get_course_videos(course_id)
    return [VideoResponse.model_validate(video) for video in videos]
