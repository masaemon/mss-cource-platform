# Ticket #005: 動画API実装

## 概要
コースに紐づく動画のCRUD操作、順序変更APIを実装する。

## 優先度
🟠 **High** - コアビジネス機能

## 見積もり
⏱️ **4-6時間**

## 目的
- コースに動画を追加・編集・削除する機能を提供
- 動画の表示順序を変更できるようにする
- YouTube動画IDの検証を行う

## タスク

### 1. スキーマ定義 (app/schemas/video.py)

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import re

class VideoCreate(BaseModel):
    title_ja: str = Field(..., min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    youtube_url: str
    order_number: int = Field(..., ge=1)

    @validator('youtube_url')
    def validate_youtube_url(cls, v):
        """YouTube URLを検証してvideo_idを抽出"""
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/embed/([a-zA-Z0-9_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, v)
            if match:
                return v
        raise ValueError('Invalid YouTube URL')

class VideoUpdate(BaseModel):
    title_ja: Optional[str] = Field(None, min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    description_ja: Optional[str] = None
    description_en: Optional[str] = None
    youtube_url: Optional[str] = None
    order_number: Optional[int] = Field(None, ge=1)

    @validator('youtube_url')
    def validate_youtube_url(cls, v):
        if v is None:
            return v
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/embed/([a-zA-Z0-9_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, v)
            if match:
                return v
        raise ValueError('Invalid YouTube URL')

class VideoReorderRequest(BaseModel):
    video_orders: list[dict[str, int]]  # [{"video_id": "uuid", "order_number": 1}, ...]

class VideoResponse(BaseModel):
    id: str
    course_id: str
    title_ja: str
    title_en: Optional[str]
    description_ja: Optional[str]
    description_en: Optional[str]
    youtube_url: str
    youtube_video_id: str
    order_number: int
    duration_seconds: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

### 2. YouTube URL処理ユーティリティ (app/utils/youtube.py)

```python
import re
from typing import Optional

def extract_youtube_video_id(url: str) -> Optional[str]:
    """YouTube URLから video_id を抽出"""
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com/embed/([a-zA-Z0-9_-]{11})'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    return None
```

### 3. 動画リポジトリ (app/repositories/video.py)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.models.video import Video

class VideoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_course_videos(self, course_id: str) -> List[Video]:
        """コースの動画を順序順で取得"""
        query = select(Video).where(
            Video.course_id == course_id
        ).order_by(Video.order_number)

        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_video_by_id(self, video_id: str) -> Optional[Video]:
        """IDで動画を取得"""
        result = await self.db.execute(
            select(Video).where(Video.id == video_id)
        )
        return result.scalar_one_or_none()

    async def create_video(self, video: Video) -> Video:
        """動画を作成"""
        self.db.add(video)
        await self.db.commit()
        await self.db.refresh(video)
        return video

    async def update_video(self, video: Video) -> Video:
        """動画を更新"""
        await self.db.commit()
        await self.db.refresh(video)
        return video

    async def delete_video(self, video: Video) -> None:
        """動画を削除"""
        await self.db.delete(video)
        await self.db.commit()

    async def get_max_order_number(self, course_id: str) -> int:
        """コース内の最大order_numberを取得"""
        result = await self.db.execute(
            select(func.max(Video.order_number)).where(Video.course_id == course_id)
        )
        max_order = result.scalar()
        return max_order if max_order else 0
```

### 4. 動画エンドポイント実装 (app/api/v1/videos.py)

#### 4.1 コースの動画一覧取得
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.schemas.video import VideoCreate, VideoUpdate, VideoResponse, VideoReorderRequest
from app.repositories.video import VideoRepository
from app.repositories.course import CourseRepository
from app.api.dependencies import get_current_instructor
from app.utils.youtube import extract_youtube_video_id
from app.models.profile import Profile, UserRole
from app.models.video import Video

router = APIRouter(prefix="/videos", tags=["Videos"])

@router.get("/courses/{course_id}/videos", response_model=List[VideoResponse])
async def get_course_videos(
    course_id: str,
    db: AsyncSession = Depends(get_db)
):
    """コースの動画一覧を取得"""
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    video_repo = VideoRepository(db)
    videos = await video_repo.get_course_videos(course_id)

    return [VideoResponse.from_orm(video) for video in videos]
```

#### 4.2 動画追加（講師・管理者のみ）
```python
@router.post("/courses/{course_id}/videos", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
async def create_video(
    course_id: str,
    video_data: VideoCreate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """コースに動画を追加"""
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 権限チェック
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to add videos to this course"
        )

    # YouTube video_id を抽出
    youtube_video_id = extract_youtube_video_id(video_data.youtube_url)
    if not youtube_video_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid YouTube URL"
        )

    video_repo = VideoRepository(db)

    # order_numberが指定されていない場合は最後に追加
    if not video_data.order_number:
        max_order = await video_repo.get_max_order_number(course_id)
        video_data.order_number = max_order + 1

    new_video = Video(
        id=str(uuid.uuid4()),
        course_id=course_id,
        **video_data.model_dump(exclude={'youtube_url'}),
        youtube_url=video_data.youtube_url,
        youtube_video_id=youtube_video_id
    )

    created_video = await video_repo.create_video(new_video)
    return VideoResponse.from_orm(created_video)
```

#### 4.3 動画更新（講師・管理者のみ）
```python
@router.put("/{video_id}", response_model=VideoResponse)
async def update_video(
    video_id: str,
    video_data: VideoUpdate,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """動画を更新"""
    video_repo = VideoRepository(db)
    video = await video_repo.get_video_by_id(video_id)

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # コースの権限チェック
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(video.course_id)

    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this video"
        )

    # YouTube URLが変更された場合、video_idを再抽出
    if video_data.youtube_url:
        youtube_video_id = extract_youtube_video_id(video_data.youtube_url)
        if not youtube_video_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid YouTube URL"
            )
        video.youtube_video_id = youtube_video_id

    # 更新
    for field, value in video_data.model_dump(exclude_unset=True, exclude={'youtube_url'}).items():
        setattr(video, field, value)

    if video_data.youtube_url:
        video.youtube_url = video_data.youtube_url

    updated_video = await video_repo.update_video(video)
    return VideoResponse.from_orm(updated_video)
```

#### 4.4 動画削除（講師・管理者のみ）
```python
@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: str,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """動画を削除"""
    video_repo = VideoRepository(db)
    video = await video_repo.get_video_by_id(video_id)

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    # コースの権限チェック
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(video.course_id)

    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this video"
        )

    await video_repo.delete_video(video)
    return None
```

#### 4.5 動画順序変更（講師・管理者のみ）
```python
@router.patch("/courses/{course_id}/reorder", response_model=List[VideoResponse])
async def reorder_videos(
    course_id: str,
    reorder_data: VideoReorderRequest,
    current_user: Profile = Depends(get_current_instructor),
    db: AsyncSession = Depends(get_db)
):
    """動画の順序を変更"""
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # 権限チェック
    if course.instructor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reorder videos"
        )

    video_repo = VideoRepository(db)

    # 各動画のorder_numberを更新
    for item in reorder_data.video_orders:
        video = await video_repo.get_video_by_id(item['video_id'])
        if video and video.course_id == course_id:
            video.order_number = item['order_number']
            await video_repo.update_video(video)

    # 更新後の動画一覧を返す
    videos = await video_repo.get_course_videos(course_id)
    return [VideoResponse.from_orm(video) for video in videos]
```

### 5. ルーター登録 (app/main.py)

```python
from app.api.v1.videos import router as videos_router

app.include_router(videos_router, prefix="/api/v1")
```

### 6. テスト (tests/integration/test_videos.py)

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_course_videos(client: AsyncClient, course_id: str):
    """コースの動画一覧取得"""
    response = await client.get(f"/api/v1/videos/courses/{course_id}/videos")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_video(
    client: AsyncClient,
    instructor_token: str,
    course_id: str
):
    """動画追加"""
    response = await client.post(
        f"/api/v1/videos/courses/{course_id}/videos",
        json={
            "title_ja": "動画タイトル",
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "order_number": 1
        },
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title_ja"] == "動画タイトル"
    assert data["youtube_video_id"] == "dQw4w9WgXcQ"

@pytest.mark.asyncio
async def test_reorder_videos(
    client: AsyncClient,
    instructor_token: str,
    course_id: str,
    video_ids: list[str]
):
    """動画順序変更"""
    response = await client.patch(
        f"/api/v1/videos/courses/{course_id}/reorder",
        json={
            "video_orders": [
                {"video_id": video_ids[1], "order_number": 1},
                {"video_id": video_ids[0], "order_number": 2}
            ]
        },
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert response.status_code == 200
```

## 受け入れ基準
- [x] コースの動画一覧が取得できる
- [x] 講師が動画を追加できる
- [x] YouTube URLから正しくvideo_idが抽出される
- [x] 動画の編集・削除ができる
- [x] 動画の順序を変更できる
- [x] 他人のコースには動画を追加できない
- [x] 無効なYouTube URLは拒否される
- [x] すべてのテストがパスする

## 技術仕様
- **YouTube URL形式**: youtube.com/watch?v=, youtu.be/, youtube.com/embed/ をサポート
- **video_id**: 11文字の英数字と記号
- **順序**: order_numberで管理（1から開始）

## パフォーマンス考慮事項
- course_id と order_number に複合インデックス
- 動画一覧取得時は order_number でソート

## 参考資料
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- [Regular Expressions in Python](https://docs.python.org/3/library/re.html)

## 依存関係
**依存するチケット**:
- #002 データベース設計
- #003 認証機能実装
- #004 コースAPI実装

**このチケットに依存するチケット**:
- #006 進捗API実装

## 備考
- YouTube Data APIを使った動画情報（タイトル、時間）自動取得は将来的に実装予定
- 動画のプレビュー機能は別チケットで対応
