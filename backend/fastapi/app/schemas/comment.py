from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class CommentUserInfo(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    role: str

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: str
    course_id: str
    user_id: str
    content: str
    is_instructor_reply: bool
    created_at: datetime
    updated_at: datetime

    # User info
    user: Optional[CommentUserInfo] = None

    class Config:
        from_attributes = True
