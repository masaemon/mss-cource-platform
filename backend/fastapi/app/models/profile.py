from sqlalchemy import Column, String, Text, Enum as SQLEnum
from sqlalchemy.dialects.mysql import CHAR
import enum
from app.db.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    USER = "user"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id = Column(CHAR(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(50), nullable=True)
    avatar_url = Column(Text, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    bio = Column(Text, nullable=True)
    hashed_password = Column(String(255), nullable=False)
