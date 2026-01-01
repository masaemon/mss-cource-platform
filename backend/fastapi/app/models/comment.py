from sqlalchemy import Column, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin


class CourseComment(Base, TimestampMixin):
    __tablename__ = "course_comments"

    id = Column(CHAR(36), primary_key=True)
    course_id = Column(CHAR(36), ForeignKey("courses.id"), nullable=False, index=True)
    user_id = Column(CHAR(36), ForeignKey("profiles.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_instructor_reply = Column(Boolean, default=False, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="comments")
    user = relationship("Profile")
