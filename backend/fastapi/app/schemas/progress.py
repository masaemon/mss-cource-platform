from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VideoProgressUpdate(BaseModel):
    is_completed: bool


class VideoProgressResponse(BaseModel):
    id: str
    user_id: str
    video_id: str
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VideoProgressItem(BaseModel):
    video_id: str
    title_ja: str
    title_en: Optional[str]
    order_number: int
    is_completed: bool


class UserProgressSummary(BaseModel):
    course_id: str
    course_title_ja: str
    total_videos: int
    completed_videos: int
    progress_percentage: float


class CourseProgressDetail(BaseModel):
    course_id: str
    total_videos: int
    completed_videos: int
    progress_percentage: float
    videos: list[VideoProgressItem]
