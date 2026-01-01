# Ticket #007: コメントAPI実装

## 概要
コースへのコメント投稿、講師返信、削除機能を実装する。

## 優先度
🟡 **Medium** - コミュニケーション機能

## 見積もり
⏱️ **3-4時間**

## 目的
- ユーザーがコースにコメントを投稿できる
- 講師がコメントに返信できる
- コメントの削除ができる
- レート制限でスパムを防止

## タスク

### 1. スキーマ定義 (app/schemas/comment.py)

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)

class CommentResponse(BaseModel):
    id: str
    course_id: str
    user_id: str
    content: str
    is_instructor_reply: bool
    created_at: datetime
    updated_at: datetime

    # User info
    user: Optional["CommentUserInfo"] = None

    class Config:
        from_attributes = True

class CommentUserInfo(BaseModel):
    id: str
    email: str
    avatar_url: Optional[str]
    role: str

    class Config:
        from_attributes = True
```

### 2. レート制限追加 (app/core/rate_limit.py)

```python
async def check_comment_rate_limit(request: Request):
    """コメント投稿のレート制限: 5回/分"""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=5, window_seconds=60, endpoint="comment"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many comments. Please slow down."
        )

async def check_instructor_reply_rate_limit(request: Request):
    """講師返信のレート制限: 10回/分"""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=10, window_seconds=60, endpoint="instructor_reply"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many replies. Please slow down."
        )
```

### 3. コメントリポジトリ (app/repositories/comment.py)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.comment import CourseComment

class CommentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_course_comments(self, course_id: str) -> List[CourseComment]:
        """コースのコメントを取得"""
        query = select(CourseComment).where(
            CourseComment.course_id == course_id
        ).options(
            selectinload(CourseComment.user)
        ).order_by(CourseComment.created_at.desc())

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_comment_by_id(self, comment_id: str) -> Optional[CourseComment]:
        """IDでコメントを取得"""
        query = select(CourseComment).where(
            CourseComment.id == comment_id
        ).options(selectinload(CourseComment.user))

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_comment(self, comment: CourseComment) -> CourseComment:
        """コメントを作成"""
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def delete_comment(self, comment: CourseComment) -> None:
        """コメントを削除"""
        await self.db.delete(comment)
        await self.db.commit()
```

### 4. コメントエンドポイント実装 (app/api/v1/comments.py)

#### 4.1 コースのコメント一覧取得
```python
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.schemas.comment import CommentCreate, CommentResponse, CommentUserInfo
from app.repositories.comment import CommentRepository
from app.repositories.course import CourseRepository
from app.api.dependencies import get_current_user, get_current_instructor
from app.core.rate_limit import check_comment_rate_limit, check_instructor_reply_rate_limit
from app.models.profile import Profile, UserRole
from app.models.comment import CourseComment

router = APIRouter(prefix="/comments", tags=["Comments"])

@router.get("/courses/{course_id}/comments", response_model=List[CommentResponse])
async def get_course_comments(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """コースのコメント一覧を取得"""
    # コースの存在確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    comment_repo = CommentRepository(db)
    comments = await comment_repo.get_course_comments(course_id)

    return [
        CommentResponse(
            **comment.__dict__,
            user=CommentUserInfo.from_orm(comment.user) if comment.user else None
        )
        for comment in comments
    ]
```

#### 4.2 コメント投稿（ログインユーザー）
```python
@router.post("/courses/{course_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    request: Request,
    course_id: str,
    comment_data: CommentCreate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_comment_rate_limit)
):
    """コースにコメントを投稿"""
    # コースの存在確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    comment_repo = CommentRepository(db)
    new_comment = CourseComment(
        id=str(uuid.uuid4()),
        course_id=course_id,
        user_id=current_user.id,
        content=comment_data.content,
        is_instructor_reply=False
    )

    created_comment = await comment_repo.create_comment(new_comment)

    # ユーザー情報を含めて返却
    return CommentResponse(
        **created_comment.__dict__,
        user=CommentUserInfo.from_orm(current_user)
    )
```

#### 4.3 講師返信（講師・管理者のみ）
```python
@router.post("/courses/{course_id}/comments/reply", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_instructor_reply(
    request: Request,
    course_id: str,
    comment_data: CommentCreate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_instructor_reply_rate_limit)
):
    """講師としてコメントに返信"""
    # コースの存在確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # コースの講師または管理者のみ返信可能
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only course instructor can reply"
        )

    comment_repo = CommentRepository(db)
    new_comment = CourseComment(
        id=str(uuid.uuid4()),
        course_id=course_id,
        user_id=current_user.id,
        content=comment_data.content,
        is_instructor_reply=True  # 講師返信フラグ
    )

    created_comment = await comment_repo.create_comment(new_comment)

    return CommentResponse(
        **created_comment.__dict__,
        user=CommentUserInfo.from_orm(current_user)
    )
```

#### 4.4 コメント削除
```python
@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """コメントを削除"""
    comment_repo = CommentRepository(db)
    comment = await comment_repo.get_comment_by_id(comment_id)

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # 自分のコメントまたは管理者のみ削除可能
    if comment.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )

    await comment_repo.delete_comment(comment)
    return None
```

### 5. ルーター登録 (app/main.py)

```python
from app.api.v1.comments import router as comments_router

app.include_router(comments_router, prefix="/api/v1")
```

### 6. テスト (tests/integration/test_comments.py)

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_course_comments(client: AsyncClient, course_id: str):
    """コメント一覧取得"""
    response = await client.get(f"/api/v1/comments/courses/{course_id}/comments")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_comment(
    client: AsyncClient,
    user_token: str,
    course_id: str
):
    """コメント投稿"""
    response = await client.post(
        f"/api/v1/comments/courses/{course_id}/comments",
        json={"content": "Great course!"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "Great course!"
    assert data["is_instructor_reply"] is False

@pytest.mark.asyncio
async def test_instructor_reply(
    client: AsyncClient,
    instructor_token: str,
    course_id: str
):
    """講師返信"""
    response = await client.post(
        f"/api/v1/comments/courses/{course_id}/comments/reply",
        json={"content": "Thank you for your feedback!"},
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["is_instructor_reply"] is True

@pytest.mark.asyncio
async def test_delete_own_comment(
    client: AsyncClient,
    user_token: str,
    comment_id: str
):
    """自分のコメント削除"""
    response = await client.delete(
        f"/api/v1/comments/{comment_id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_comment_rate_limit(
    client: AsyncClient,
    user_token: str,
    course_id: str
):
    """コメントレート制限のテスト"""
    # 6回連続でコメント投稿（5回まで成功、6回目は失敗）
    for i in range(6):
        response = await client.post(
            f"/api/v1/comments/courses/{course_id}/comments",
            json={"content": f"Comment {i}"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        if i < 5:
            assert response.status_code == 201
        else:
            assert response.status_code == 429
```

## 受け入れ基準
- [x] コースのコメント一覧が取得できる
- [x] ログインユーザーがコメントを投稿できる
- [x] 講師がコメントに返信できる（is_instructor_reply=true）
- [x] 自分のコメントを削除できる
- [x] 他人のコメントは削除できない
- [x] 管理者はすべてのコメントを削除できる
- [x] レート制限が正しく動作する
- [x] すべてのテストがパスする

## 技術仕様
- **レート制限**:
  - コメント投稿: 5回/分
  - 講師返信: 10回/分
- **コメント長**: 最大5000文字
- **ソート**: 作成日時の降順

## セキュリティ考慮事項
- XSS対策: コメント表示時にサニタイズ（フロントエンド）
- レート制限でスパムを防止
- ログインユーザーのみ投稿可能

## パフォーマンス考慮事項
- course_id にインデックス
- ユーザー情報を selectinload で事前ロード

## 参考資料
- [FastAPI Request Validation](https://fastapi.tiangolo.com/tutorial/body/)

## 依存関係
**依存するチケット**:
- #002 データベース設計
- #003 認証機能実装
- #004 コースAPI実装

**このチケットに依存するチケット**:
- なし

## 備考
- コメント編集機能は将来的に実装予定
- コメントへの返信（スレッド）機能は別チケットで対応
- 通知機能は別チケットで対応
