from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class VideoCreate(BaseModel):
    title_ja: str = Field(..., min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    youtube_url: str
    order_number: Optional[int] = Field(None, ge=1)

    @field_validator('youtube_url')
    @classmethod
    def validate_youtube_url(cls, v):
        """YouTube URLを検証してvideo_idを抽出"""
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/embed/([a-zA-Z0-9_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, v)
            if match:
                return v
        raise ValueError('Invalid YouTube URL')


class VideoUpdate(BaseModel):
    title_ja: Optional[str] = Field(None, min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    youtube_url: Optional[str] = None
    order_number: Optional[int] = Field(None, ge=1)

    @field_validator('youtube_url')
    @classmethod
    def validate_youtube_url(cls, v):
        if v is None:
            return v
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/embed/([a-zA-Z0-9_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, v)
            if match:
                return v
        raise ValueError('Invalid YouTube URL')


class VideoOrderItem(BaseModel):
    video_id: str
    order_number: int


class VideoReorderRequest(BaseModel):
    video_orders: list[VideoOrderItem]


class VideoResponse(BaseModel):
    id: str
    course_id: str
    title_ja: str
    title_en: Optional[str]
    description_ja: Optional[str]
    description_en: Optional[str]
    youtube_url: str
    youtube_video_id: str
    order_number: int
    duration_seconds: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
