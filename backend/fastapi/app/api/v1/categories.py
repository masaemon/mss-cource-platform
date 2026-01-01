from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.session import get_db
from app.models.category import Category
from app.schemas.course import CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all categories."""
    result = await db.execute(select(Category).order_by(Category.name_ja))
    categories = result.scalars().all()
    return [CategoryResponse.model_validate(cat) for cat in categories]
