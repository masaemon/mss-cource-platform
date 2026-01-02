from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Any
from datetime import datetime

# VideoResponseは後でmodel_rebuildで解決
VideoResponse = Any


class CourseCreate(BaseModel):
    title_ja: str = Field(..., min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category_id: str


class CourseUpdate(BaseModel):
    title_ja: Optional[str] = Field(None, min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category_id: Optional[str] = None


class CategoryResponse(BaseModel):
    id: str
    name_ja: str
    name_en: Optional[str]
    slug: str

    class Config:
        from_attributes = True


class InstructorResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]

    class Config:
        from_attributes = True


class CourseResponse(BaseModel):
    id: str
    title_ja: str
    title_en: Optional[str]
    description_ja: Optional[str]
    description_en: Optional[str]
    thumbnail_url: Optional[str]
    category_id: str
    instructor_id: str
    is_published: bool
    created_at: datetime
    updated_at: datetime

    # Relations
    category: Optional[CategoryResponse] = None
    instructor: Optional[InstructorResponse] = None
    videos: List[VideoResponse] = []
    video_count: int = 0

    class Config:
        from_attributes = True


class CourseListItem(BaseModel):
    id: str
    title_ja: str
    title_en: Optional[str]
    description_ja: Optional[str]
    thumbnail_url: Optional[str]
    category_id: str
    is_published: bool
    created_at: datetime
    video_count: int

    # Relations
    category: Optional[CategoryResponse] = None
    instructor: Optional[InstructorResponse] = None

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    data: List[CourseListItem]
    total: int
    page: int = 1
    limit: int = 20


class PublishToggleRequest(BaseModel):
    is_published: bool
