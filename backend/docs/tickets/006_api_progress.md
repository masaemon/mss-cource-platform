# Ticket #006: 視聴進捗API実装

## 概要
ユーザーの動画視聴進捗を管理するAPIを実装する。

## 優先度
🟠 **High** - ユーザー体験の重要機能

## 見積もり
⏱️ **3-4時間**

## 目的
- ユーザーが動画を視聴完了としてマークできる
- ユーザーの視聴進捗を取得できる
- コース全体の進捗率を計算できる

## タスク

### 1. スキーマ定義 (app/schemas/progress.py)

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VideoProgressUpdate(BaseModel):
    is_completed: bool

class VideoProgressResponse(BaseModel):
    id: str
    user_id: str
    video_id: str
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProgressSummary(BaseModel):
    course_id: str
    course_title_ja: str
    total_videos: int
    completed_videos: int
    progress_percentage: float

class CourseProgressDetail(BaseModel):
    course_id: str
    total_videos: int
    completed_videos: int
    progress_percentage: float
    videos: list[dict]  # [{"video_id": "uuid", "title": "...", "is_completed": bool}]
```

### 2. 進捗リポジトリ (app/repositories/progress.py)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from app.models.video_progress import VideoProgress
from app.models.video import Video
from app.models.course import Course
from datetime import datetime

class ProgressRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_progress(
        self, user_id: str, video_id: str
    ) -> VideoProgress:
        """進捗を取得、なければ作成"""
        result = await self.db.execute(
            select(VideoProgress).where(
                VideoProgress.user_id == user_id,
                VideoProgress.video_id == video_id
            )
        )
        progress = result.scalar_one_or_none()

        if not progress:
            import uuid
            progress = VideoProgress(
                id=str(uuid.uuid4()),
                user_id=user_id,
                video_id=video_id,
                is_completed=False
            )
            self.db.add(progress)
            await self.db.commit()
            await self.db.refresh(progress)

        return progress

    async def update_progress(
        self, progress: VideoProgress, is_completed: bool
    ) -> VideoProgress:
        """進捗を更新"""
        progress.is_completed = is_completed
        progress.completed_at = datetime.utcnow() if is_completed else None
        await self.db.commit()
        await self.db.refresh(progress)
        return progress

    async def get_user_course_progress(
        self, user_id: str, course_id: str
    ) -> dict:
        """ユーザーのコース進捗を取得"""
        # コースの全動画を取得
        videos_result = await self.db.execute(
            select(Video).where(Video.course_id == course_id).order_by(Video.order_number)
        )
        videos = videos_result.scalars().all()

        if not videos:
            return {
                "total_videos": 0,
                "completed_videos": 0,
                "progress_percentage": 0.0,
                "videos": []
            }

        # ユーザーの進捗を取得
        video_ids = [v.id for v in videos]
        progress_result = await self.db.execute(
            select(VideoProgress).where(
                VideoProgress.user_id == user_id,
                VideoProgress.video_id.in_(video_ids)
            )
        )
        progress_list = progress_result.scalars().all()
        progress_map = {p.video_id: p for p in progress_list}

        # 動画ごとの進捗情報を構築
        video_progress = []
        completed_count = 0

        for video in videos:
            progress = progress_map.get(video.id)
            is_completed = progress.is_completed if progress else False
            if is_completed:
                completed_count += 1

            video_progress.append({
                "video_id": video.id,
                "title_ja": video.title_ja,
                "title_en": video.title_en,
                "order_number": video.order_number,
                "is_completed": is_completed
            })

        total_videos = len(videos)
        progress_percentage = (completed_count / total_videos * 100) if total_videos > 0 else 0.0

        return {
            "total_videos": total_videos,
            "completed_videos": completed_count,
            "progress_percentage": round(progress_percentage, 2),
            "videos": video_progress
        }

    async def get_user_all_progress(self, user_id: str) -> List[dict]:
        """ユーザーの全コース進捗サマリーを取得"""
        # ユーザーが進捗を持っているコースを取得
        result = await self.db.execute(
            select(Course).join(Video).join(VideoProgress).where(
                VideoProgress.user_id == user_id
            ).distinct()
        )
        courses = result.scalars().all()

        summaries = []
        for course in courses:
            progress_data = await self.get_user_course_progress(user_id, course.id)
            summaries.append({
                "course_id": course.id,
                "course_title_ja": course.title_ja,
                **progress_data
            })

        return summaries
```

### 3. 進捗エンドポイント実装 (app/api/v1/progress.py)

#### 3.1 動画の進捗更新
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.progress import (
    VideoProgressUpdate,
    VideoProgressResponse,
    UserProgressSummary,
    CourseProgressDetail
)
from app.repositories.progress import ProgressRepository
from app.repositories.video import VideoRepository
from app.api.dependencies import get_current_user
from app.models.profile import Profile

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.post("/videos/{video_id}", response_model=VideoProgressResponse)
async def update_video_progress(
    video_id: str,
    progress_data: VideoProgressUpdate,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """動画の視聴進捗を更新"""
    # 動画が存在するか確認
    video_repo = VideoRepository(db)
    video = await video_repo.get_video_by_id(video_id)

    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )

    progress_repo = ProgressRepository(db)
    progress = await progress_repo.get_or_create_progress(current_user.id, video_id)
    updated_progress = await progress_repo.update_progress(progress, progress_data.is_completed)

    return VideoProgressResponse.from_orm(updated_progress)
```

#### 3.2 コースの進捗取得
```python
@router.get("/courses/{course_id}", response_model=CourseProgressDetail)
async def get_course_progress(
    course_id: str,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """ユーザーのコース進捗を取得"""
    from app.repositories.course import CourseRepository

    # コースが存在するか確認
    course_repo = CourseRepository(db)
    course = await course_repo.get_course_by_id(course_id)

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    progress_repo = ProgressRepository(db)
    progress_data = await progress_repo.get_user_course_progress(current_user.id, course_id)

    return CourseProgressDetail(
        course_id=course_id,
        **progress_data
    )
```

#### 3.3 全コースの進捗サマリー取得
```python
from typing import List

@router.get("", response_model=List[UserProgressSummary])
async def get_all_progress(
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """ユーザーの全コース進捗サマリーを取得"""
    progress_repo = ProgressRepository(db)
    summaries = await progress_repo.get_user_all_progress(current_user.id)

    return [UserProgressSummary(**summary) for summary in summaries]
```

### 4. ルーター登録 (app/main.py)

```python
from app.api.v1.progress import router as progress_router

app.include_router(progress_router, prefix="/api/v1")
```

### 5. テスト (tests/integration/test_progress.py)

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_update_video_progress(
    client: AsyncClient,
    user_token: str,
    video_id: str
):
    """動画進捗を更新"""
    response = await client.post(
        f"/api/v1/progress/videos/{video_id}",
        json={"is_completed": True},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_completed"] is True
    assert data["completed_at"] is not None

@pytest.mark.asyncio
async def test_get_course_progress(
    client: AsyncClient,
    user_token: str,
    course_id: str
):
    """コース進捗を取得"""
    response = await client.get(
        f"/api/v1/progress/courses/{course_id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_videos" in data
    assert "completed_videos" in data
    assert "progress_percentage" in data

@pytest.mark.asyncio
async def test_progress_percentage_calculation(
    client: AsyncClient,
    user_token: str,
    course_with_3_videos: dict
):
    """進捗率の計算が正しいか確認"""
    course_id = course_with_3_videos["course_id"]
    video_ids = course_with_3_videos["video_ids"]

    # 1本目を完了
    await client.post(
        f"/api/v1/progress/videos/{video_ids[0]}",
        json={"is_completed": True},
        headers={"Authorization": f"Bearer {user_token}"}
    )

    # 進捗確認
    response = await client.get(
        f"/api/v1/progress/courses/{course_id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    data = response.json()
    assert data["total_videos"] == 3
    assert data["completed_videos"] == 1
    assert data["progress_percentage"] == 33.33
```

## 受け入れ基準
- [x] 動画の視聴完了をマークできる
- [x] 視聴完了を解除できる
- [x] コース全体の進捗率が正しく計算される
- [x] ユーザーは自分の進捗のみ更新・閲覧できる
- [x] 進捗がない動画にアクセスすると自動で作成される
- [x] すべてのテストがパスする

## 技術仕様
- **進捗率計算**: (完了動画数 / 総動画数) × 100
- **ユニーク制約**: user_id と video_id の組み合わせでユニーク
- **completed_at**: 完了時にタイムスタンプを記録、未完了時はnull

## パフォーマンス考慮事項
- user_id と video_id にインデックス
- ユニーク複合インデックスで高速検索
- N+1問題を回避（一括取得）

## 参考資料
- [SQLAlchemy Upsert](https://docs.sqlalchemy.org/en/20/orm/queryguide/dml.html)

## 依存関係
**依存するチケット**:
- #002 データベース設計
- #003 認証機能実装
- #005 動画API実装

**このチケットに依存するチケット**:
- なし

## 備考
- 視聴時間の記録は将来的に実装予定（duration_secondsフィールドを活用）
- バッジ・実績機能は別チケットで対応
