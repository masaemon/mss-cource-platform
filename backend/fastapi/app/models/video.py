from sqlalchemy import Column, String, Text, Integer, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin


class Video(Base, TimestampMixin):
    __tablename__ = "videos"

    id = Column(CHAR(36), primary_key=True)
    course_id = Column(CHAR(36), ForeignKey("courses.id"), nullable=False, index=True)
    title_ja = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=True)
    description_ja = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    youtube_url = Column(String(500), nullable=False)
    youtube_video_id = Column(String(50), nullable=False)
    order_number = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="videos")
    progress = relationship("VideoProgress", back_populates="video", cascade="all, delete-orphan")

    # Composite index for ordering
    __table_args__ = (
        Index('idx_course_order', 'course_id', 'order_number'),
    )
