import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.profile import Profile, UserRole
from app.models.category import Category
from app.core.security import get_password_hash


async def create_categories(session: AsyncSession):
    """Create sample categories"""
    categories = [
        {
            "id": str(uuid.uuid4()),
            "name_ja": "プログラミング",
            "name_en": "Programming",
            "slug": "programming",
            "description_ja": "プログラミング関連のコース",
            "description_en": "Programming related courses"
        },
        {
            "id": str(uuid.uuid4()),
            "name_ja": "データサイエンス",
            "name_en": "Data Science",
            "slug": "data-science",
            "description_ja": "データサイエンス関連のコース",
            "description_en": "Data science related courses"
        },
        {
            "id": str(uuid.uuid4()),
            "name_ja": "デザイン",
            "name_en": "Design",
            "slug": "design",
            "description_ja": "デザイン関連のコース",
            "description_en": "Design related courses"
        },
    ]

    for cat_data in categories:
        category = Category(**cat_data)
        session.add(category)

    await session.commit()
    print("✓ Categories created")


async def create_admin_user(session: AsyncSession):
    """Create default admin user"""
    admin = Profile(
        id=str(uuid.uuid4()),
        email="admin@example.com",
        display_name="Admin User",
        role=UserRole.ADMIN,
        hashed_password=get_password_hash("admin123"),
        bio="System Administrator"
    )
    session.add(admin)
    await session.commit()
    print(f"✓ Admin user created: {admin.email} (password: admin123)")


async def main():
    """Main seed function"""
    print("Starting database seeding...")
    async with AsyncSessionLocal() as session:
        try:
            await create_categories(session)
            await create_admin_user(session)
            print("\n✓ Database seeding completed successfully!")
        except Exception as e:
            print(f"✗ Error during seeding: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
