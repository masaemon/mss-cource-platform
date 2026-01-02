from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(CHAR(36), primary_key=True)
    title_ja = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=True)
    description_ja = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    category_id = Column(CHAR(36), ForeignKey("categories.id"), nullable=False, index=True)
    instructor_id = Column(CHAR(36), ForeignKey("profiles.id"), nullable=False, index=True)
    is_published = Column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    category = relationship("Category", backref="courses")
    instructor = relationship("Profile", backref="courses")
    videos = relationship("Video", back_populates="course", cascade="all, delete-orphan", order_by="Video.order_number")
    comments = relationship("CourseComment", back_populates="course", cascade="all, delete-orphan")
