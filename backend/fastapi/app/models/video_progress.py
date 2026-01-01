from sqlalchemy import Column, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin


class VideoProgress(Base, TimestampMixin):
    __tablename__ = "video_progress"

    id = Column(CHAR(36), primary_key=True)
    user_id = Column(CHAR(36), ForeignKey("profiles.id"), nullable=False, index=True)
    video_id = Column(CHAR(36), ForeignKey("videos.id"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("Profile")
    video = relationship("Video", back_populates="progress")

    # Unique constraint
    __table_args__ = (
        UniqueConstraint('user_id', 'video_id', name='uq_user_video'),
    )
