# Ticket #004: コースAPI実装

## 概要
コース関連のCRUD操作、検索、公開/非公開切り替えAPIを実装する。

## 優先度
🟠 **High** - コアビジネス機能

## 見積もり
⏱️ **6-8時間**

## 目的
- コースの作成、更新、削除機能を提供
- 公開コースの一覧表示、検索機能を実装
- 講師が自分のコースを管理できるようにする
- カテゴリーフィルタリング機能を実装

## タスク

### 1. スキーマ定義 (app/schemas/course.py)

- [x] コース作成リクエストスキーマ
- [x] コース更新リクエストスキーマ
- [x] コースレスポンススキーマ
- [x] コース一覧レスポンススキーマ

```python
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime

class CourseCreate(BaseModel):
    title_ja: str = Field(..., min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    thumbnail_url: Optional[HttpUrl] = None
    category_id: str

class CourseUpdate(BaseModel):
    title_ja: Optional[str] = Field(None, min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    thumbnail_url: Optional[HttpUrl] = None
    category_id: Optional[str] = None

class CourseResponse(BaseModel):
    id: str
    title_ja: str
    title_en: Optional[str]
    description_ja: Optional[str]
    description_en: Optional[str]
    thumbnail_url: Optional[str]
    category_id: str
    instructor_id: str
    is_published: bool
    created_at: datetime
    updated_at: datetime

    # Relations
    category: Optional["CategoryResponse"] = None
    instructor: Optional["InstructorResponse"] = None
    video_count: int = 0

    class Config:
        from_attributes = True

class CourseListItem(BaseModel):
    id: str
    title_ja: str
    title_en: Optional[str]
    description_ja: Optional[str]
    thumbnail_url: Optional[str]
    category_id: str
    is_published: bool
    created_at: datetime
    video_count: int

    # Relations
    category: Optional["CategoryResponse"] = None
    instructor: Optional["InstructorResponse"] = None

    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: str
    name_ja: str
    name_en: Optional[str]
    slug: str

    class Config:
        from_attributes = True

class InstructorResponse(BaseModel):
    id: str
    email: str
    avatar_url: Optional[str]
    bio: Optional[str]

    class Config:
        from_attributes = True

class CourseListResponse(BaseModel):
    data: List[CourseListItem]
    total: int
    page: int = 1
    limit: int = 20

class PublishToggleRequest(BaseModel):
    is_published: bool
```

### 2. コースリポジトリ (app/repositories/course.py)

- [x] コース取得クエリ
- [x] コース作成
- [x] コース更新
- [x] コース削除
- [x] 検索・フィルタリング

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.course import Course
from app.models.video import Video
from app.models.category import Category
from app.models.profile import Profile

class CourseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_published_courses(
        self,
        category_id: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Course], int]:
        """公開コースを取得"""
        query = select(Course).where(Course.is_published == True)

        # カテゴリーフィルター
        if category_id:
            query = query.where(Course.category_id == category_id)

        # 検索
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Course.title_ja.ilike(search_term),
                    Course.title_en.ilike(search_term),
                    Course.description_ja.ilike(search_term),
                    Course.description_en.ilike(search_term)
                )
            )

        # 総数を取得
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # リレーションを含めて取得
        query = query.options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.videos)
        ).offset(skip).limit(limit).order_by(Course.created_at.desc())

        result = await self.db.execute(query)
        courses = result.scalars().all()

        return courses, total

    async def get_course_by_id(self, course_id: str) -> Optional[Course]:
        """IDでコースを取得"""
        query = select(Course).where(Course.id == course_id).options(
            selectinload(Course.category),
            selectinload(Course.instructor),
            selectinload(Course.videos)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_instructor_courses(
        self, instructor_id: str
    ) -> List[Course]:
        """講師のコースを全て取得"""
        query = select(Course).where(Course.instructor_id == instructor_id).options(
            selectinload(Course.category),
            selectinload(Course.videos)
        ).order_by(Course.created_at.desc())

        result = await self.db.execute(query)
        return result.scalars().all()

    async def create_course(self, course: Course) -> Course:
        """コースを作成"""
        self.db.add(course)
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def update_course(self, course: Course) -> Course:
        """コースを更新"""
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def delete_course(self, course: Course) -> None:
        """コースを削除"""
        await self.db.delete(course)
        await self.db.commit()
```

### 3. コースエンドポイント実装 (app/api/v1/courses.py)

#### 3.1 公開コース一覧取得
- [x] `GET /api/v1/courses`
- [x] クエリパラメータ: category, search, page, limit

```python
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.session import get_db
from app.schemas.course import CourseListResponse, CourseListItem
from app.repositories.course import CourseRepository

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=CourseListResponse)
async def get_courses(
    category: Optional[str] = Query(None, description="Category ID"),
    search: Optional[str] = Query(None, description="Search keyword"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    """公開コース一覧を取得"""
    skip = (page - 1) * limit
    repo = CourseRepository(db)
    courses, total = await repo.get_published_courses(
        category_id=category,
        search=search,
        skip=skip,
        limit=limit
    )

    return CourseListResponse(
        data=[
            CourseListItem(
                **course.__dict__,
                video_count=len(course.videos) if course.videos else 0
            )
            for course in courses
        ],
        total=total,
        page=page,
        limit=limit
    )
```

#### 3.2 コース詳細取得
- [x] `GET /api/v1/courses/{course_id}`

```python
from app.schemas.course import CourseResponse

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """コース詳細を取得"""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 非公開コースは講師と管理者のみ閲覧可能（認証実装後に追加）

    return CourseResponse(
        **course.__dict__,
        video_count=len(course.videos) if course.videos else 0
    )
```

#### 3.3 コース作成（講師・管理者のみ）
- [x] `POST /api/v1/courses`
- [x] 認証必須、講師または管理者のみ

```python
from app.schemas.course import CourseCreate
from app.api.dependencies import get_current_instructor
from app.models.course import Course
import uuid

@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """コースを作成（講師・管理者のみ）"""
    repo = CourseRepository(db)

    new_course = Course(
        id=str(uuid.uuid4()),
        **course_data.model_dump(),
        instructor_id=current_user.id,
        is_published=False
    )

    created_course = await repo.create_course(new_course)
    return CourseResponse(**created_course.__dict__, video_count=0)
```

#### 3.4 コース更新（講師・管理者のみ）
- [x] `PUT /api/v1/courses/{course_id}`
- [x] 自分のコースまたは管理者のみ編集可能

```python
from app.schemas.course import CourseUpdate
from app.models.profile import UserRole

@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """コースを更新"""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 権限チェック: 自分のコースまたは管理者
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )

    # 更新
    for field, value in course_data.model_dump(exclude_unset=True).items():
        setattr(course, field, value)

    updated_course = await repo.update_course(course)
    return CourseResponse(
        **updated_course.__dict__,
        video_count=len(updated_course.videos) if updated_course.videos else 0
    )
```

#### 3.5 コース削除（講師・管理者のみ）
- [x] `DELETE /api/v1/courses/{course_id}`

```python
@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """コースを削除"""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 権限チェック
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this course"
        )

    await repo.delete_course(course)
    return None
```

#### 3.6 コース公開切り替え（講師・管理者のみ）
- [x] `PATCH /api/v1/courses/{course_id}/publish`

```python
from app.schemas.course import PublishToggleRequest

@router.patch("/{course_id}/publish", response_model=CourseResponse)
async def toggle_publish(
    course_id: str,
    publish_data: PublishToggleRequest,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """コースの公開/非公開を切り替え"""
    repo = CourseRepository(db)
    course = await repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 権限チェック
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to publish this course"
        )

    course.is_published = publish_data.is_published
    updated_course = await repo.update_course(course)

    return CourseResponse(
        **updated_course.__dict__,
        video_count=len(updated_course.videos) if updated_course.videos else 0
    )
```

#### 3.7 講師のコース一覧取得
- [x] `GET /api/v1/instructor/courses`
- [x] ログイン中の講師が自分のコースを全て取得

```python
@router.get("/instructor/courses", response_model=List[CourseResponse])
async def get_instructor_courses(
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """講師の全コースを取得"""
    repo = CourseRepository(db)
    courses = await repo.get_instructor_courses(current_user.id)

    return [
        CourseResponse(
            **course.__dict__,
            video_count=len(course.videos) if course.videos else 0
        )
        for course in courses
    ]
```

### 4. カテゴリーAPI (app/api/v1/categories.py)

- [x] `GET /api/v1/categories` - カテゴリー一覧取得

```python
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
    """カテゴリー一覧を取得"""
    result = await db.execute(select(Category).order_by(Category.name_ja))
    categories = result.scalars().all()
    return [CategoryResponse.from_orm(cat) for cat in categories]
```

### 5. ルーター登録 (app/main.py)

- [x] コースルーター登録
- [x] カテゴリールーター登録

```python
from app.api.v1.courses import router as courses_router
from app.api.v1.categories import router as categories_router

app.include_router(courses_router, prefix="/api/v1")
app.include_router(categories_router, prefix="/api/v1")
```

### 6. テスト (tests/integration/test_courses.py)

- [x] コース一覧取得のテスト
- [x] コース詳細取得のテスト
- [x] コース作成のテスト（講師）
- [x] コース更新のテスト
- [x] コース削除のテスト
- [x] 公開切り替えのテスト
- [x] 検索・フィルタリングのテスト
- [x] 権限エラーのテスト

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_courses(client: AsyncClient):
    """公開コース一覧取得"""
    response = await client.get("/api/v1/courses")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data

@pytest.mark.asyncio
async def test_create_course_unauthorized(client: AsyncClient):
    """認証なしでコース作成（失敗）"""
    response = await client.post("/api/v1/courses", json={
        "title_ja": "新しいコース",
        "category_id": "some-uuid"
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_course_as_instructor(
    client: AsyncClient,
    instructor_token: str,
    category_id: str
):
    """講師としてコース作成（成功）"""
    response = await client.post(
        "/api/v1/courses",
        json={
            "title_ja": "新しいコース",
            "description_ja": "説明",
            "category_id": category_id
        },
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title_ja"] == "新しいコース"
```

## 受け入れ基準
- [x] 公開コース一覧が取得できる
- [x] カテゴリーでフィルタリングできる
- [x] キーワード検索ができる
- [x] ページネーションが動作する
- [x] 講師がコースを作成できる
- [x] 講師が自分のコースを編集・削除できる
- [x] 他人のコースは編集・削除できない
- [x] 管理者はすべてのコースを編集・削除できる
- [x] コースの公開/非公開切り替えができる
- [x] すべてのテストがパスする

## 技術仕様
- **ページネーション**: デフォルト20件/ページ、最大100件
- **検索**: 部分一致（ILIKE）、タイトルと説明を対象
- **ソート**: 作成日時の降順

## パフォーマンス考慮事項
- リレーション（category, instructor, videos）を`selectinload`で事前ロード
- インデックスを活用（is_published, category_id, instructor_id）
- N+1問題を回避

## 参考資料
- [FastAPI Query Parameters](https://fastapi.tiangolo.com/tutorial/query-params/)
- [SQLAlchemy Relationship Loading](https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html)

## 依存関係
**依存するチケット**:
- #001 開発環境構築
- #002 データベース設計
- #003 認証機能実装

**このチケットに依存するチケット**:
- #005 動画API実装
- #007 コメントAPI実装

## 備考
- ファイルアップロード（サムネイル）機能は別チケットで実装
- コースの複製機能は将来的に追加予定
