from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id = Column(CHAR(36), primary_key=True)
    name_ja = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description_ja = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
