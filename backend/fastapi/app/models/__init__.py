# Import all models to ensure they're registered with SQLAlchemy
from app.models.profile import Profile, UserRole
from app.models.category import Category
from app.models.course import Course
from app.models.video import Video
from app.models.video_progress import VideoProgress
from app.models.comment import CourseComment

__all__ = [
    "Profile",
    "UserRole",
    "Category",
    "Course",
    "Video",
    "VideoProgress",
    "CourseComment",
]
