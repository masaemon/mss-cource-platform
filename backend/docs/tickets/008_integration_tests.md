# Ticket #008: 統合テスト実装

## 概要
外部からAPIを叩く統合テストとDBセットアップを実装する。

## 優先度
🟠 **High** - 品質保証の重要項目

## 見積もり
⏱️ **6-8時間**

## 目的
- APIエンドポイントの動作を包括的にテストする
- テスト用DBを自動セットアップする
- CI/CDパイプラインで自動実行できるようにする
- テストデータのフィクスチャを整備する

## タスク

### 1. pytest設定

#### 1.1 pytest.ini作成
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
markers =
    integration: Integration tests
    unit: Unit tests
    slow: Slow running tests
```

#### 1.2 conftest.py作成 (tests/conftest.py)

```python
import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.core.config import settings

# テスト用DB URL
TEST_DATABASE_URL = "mysql+aiomysql://test_user:test_password@localhost:3307/test_mss_course_platform"

# テスト用エンジン
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop():
    """イベントループをセッションスコープで作成"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_test_database():
    """テスト用DBのセットアップとクリーンアップ"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """テスト用DBセッション"""
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """テスト用HTTPクライアント"""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
```

### 2. テストデータフィクスチャ

#### 2.1 ユーザー・認証フィクスチャ (tests/fixtures/auth.py)

```python
import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.profile import Profile, UserRole
from app.core.security import get_password_hash, create_access_token

@pytest.fixture
async def test_user(db_session: AsyncSession) -> Profile:
    """テスト用一般ユーザー"""
    user = Profile(
        id=str(uuid.uuid4()),
        email="user@test.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.USER
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def test_instructor(db_session: AsyncSession) -> Profile:
    """テスト用講師"""
    instructor = Profile(
        id=str(uuid.uuid4()),
        email="instructor@test.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.INSTRUCTOR,
        bio="Test Instructor"
    )
    db_session.add(instructor)
    await db_session.commit()
    await db_session.refresh(instructor)
    return instructor

@pytest.fixture
async def test_admin(db_session: AsyncSession) -> Profile:
    """テスト用管理者"""
    admin = Profile(
        id=str(uuid.uuid4()),
        email="admin@test.com",
        hashed_password=get_password_hash("password123"),
        role=UserRole.ADMIN
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin

@pytest.fixture
def user_token(test_user: Profile) -> str:
    """一般ユーザーのJWTトークン"""
    return create_access_token(data={"sub": test_user.id})

@pytest.fixture
def instructor_token(test_instructor: Profile) -> str:
    """講師のJWTトークン"""
    return create_access_token(data={"sub": test_instructor.id})

@pytest.fixture
def admin_token(test_admin: Profile) -> str:
    """管理者のJWTトークン"""
    return create_access_token(data={"sub": test_admin.id})
```

#### 2.2 コース・動画フィクスチャ (tests/fixtures/courses.py)

```python
import pytest
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.models.course import Course
from app.models.video import Video

@pytest.fixture
async def test_category(db_session: AsyncSession) -> Category:
    """テスト用カテゴリー"""
    category = Category(
        id=str(uuid.uuid4()),
        name_ja="プログラミング",
        name_en="Programming",
        slug="programming"
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category

@pytest.fixture
async def test_course(
    db_session: AsyncSession,
    test_instructor: Profile,
    test_category: Category
) -> Course:
    """テスト用コース"""
    course = Course(
        id=str(uuid.uuid4()),
        title_ja="テストコース",
        title_en="Test Course",
        description_ja="テスト用のコースです",
        category_id=test_category.id,
        instructor_id=test_instructor.id,
        is_published=True
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest.fixture
async def test_videos(
    db_session: AsyncSession,
    test_course: Course
) -> list[Video]:
    """テスト用動画（3本）"""
    videos = []
    for i in range(3):
        video = Video(
            id=str(uuid.uuid4()),
            course_id=test_course.id,
            title_ja=f"動画{i+1}",
            title_en=f"Video {i+1}",
            youtube_url=f"https://www.youtube.com/watch?v=test{i}",
            youtube_video_id=f"test{i}0000000",
            order_number=i + 1
        )
        db_session.add(video)
        videos.append(video)

    await db_session.commit()
    for video in videos:
        await db_session.refresh(video)

    return videos
```

### 3. 統合テストシナリオ

#### 3.1 エンドツーエンドシナリオ (tests/integration/test_e2e_scenarios.py)

```python
import pytest
from httpx import AsyncClient

@pytest.mark.integration
@pytest.mark.asyncio
async def test_complete_course_flow(client: AsyncClient):
    """完全なコース作成〜視聴フロー"""

    # 1. サインアップ
    signup_response = await client.post("/api/v1/auth/signup", json={
        "email": "newuser@test.com",
        "password": "password123"
    })
    assert signup_response.status_code == 201
    user_token = signup_response.json()["access_token"]

    # 2. 講師用アカウント作成（管理者がユーザーを講師に昇格する想定）
    instructor_signup = await client.post("/api/v1/auth/signup", json={
        "email": "newinstructor@test.com",
        "password": "password123"
    })
    instructor_token = instructor_signup.json()["access_token"]

    # 3. カテゴリー取得
    categories_response = await client.get("/api/v1/categories")
    assert categories_response.status_code == 200
    categories = categories_response.json()
    category_id = categories[0]["id"] if categories else None

    # 4. 講師がコース作成
    course_response = await client.post(
        "/api/v1/courses",
        json={
            "title_ja": "統合テストコース",
            "description_ja": "E2Eテスト用",
            "category_id": category_id
        },
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert course_response.status_code == 201
    course = course_response.json()
    course_id = course["id"]

    # 5. 動画追加
    video_response = await client.post(
        f"/api/v1/videos/courses/{course_id}/videos",
        json={
            "title_ja": "レッスン1",
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "order_number": 1
        },
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert video_response.status_code == 201
    video = video_response.json()
    video_id = video["id"]

    # 6. コース公開
    publish_response = await client.patch(
        f"/api/v1/courses/{course_id}/publish",
        json={"is_published": True},
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert publish_response.status_code == 200

    # 7. 一般ユーザーがコース一覧を取得
    courses_response = await client.get("/api/v1/courses")
    assert courses_response.status_code == 200
    assert any(c["id"] == course_id for c in courses_response.json()["data"])

    # 8. コース詳細取得
    course_detail = await client.get(f"/api/v1/courses/{course_id}")
    assert course_detail.status_code == 200

    # 9. 動画視聴完了マーク
    progress_response = await client.post(
        f"/api/v1/progress/videos/{video_id}",
        json={"is_completed": True},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert progress_response.status_code == 200

    # 10. 進捗確認
    progress_check = await client.get(
        f"/api/v1/progress/courses/{course_id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert progress_check.status_code == 200
    progress_data = progress_check.json()
    assert progress_data["completed_videos"] == 1

    # 11. コメント投稿
    comment_response = await client.post(
        f"/api/v1/comments/courses/{course_id}/comments",
        json={"content": "Great course!"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert comment_response.status_code == 201

    # 12. 講師が返信
    reply_response = await client.post(
        f"/api/v1/comments/courses/{course_id}/comments/reply",
        json={"content": "Thank you!"},
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert reply_response.status_code == 201

    # 13. コメント一覧確認
    comments_response = await client.get(
        f"/api/v1/comments/courses/{course_id}/comments"
    )
    assert comments_response.status_code == 200
    comments = comments_response.json()
    assert len(comments) == 2
```

### 4. Docker Compose for Testing

#### docker-compose.test.yml作成
```yaml
version: '3.8'

services:
  test-db:
    image: mysql:8.0
    container_name: mss-test-db
    ports:
      - "3307:3306"
    environment:
      MYSQL_ROOT_PASSWORD: test_root
      MYSQL_DATABASE: test_mss_course_platform
      MYSQL_USER: test_user
      MYSQL_PASSWORD: test_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-ptest_root"]
      interval: 2s
      timeout: 2s
      retries: 10
```

### 5. テスト実行スクリプト (scripts/run_tests.sh)

```bash
#!/bin/bash
set -e

echo "Starting test database..."
docker-compose -f docker-compose.test.yml up -d

echo "Waiting for database to be ready..."
sleep 5

echo "Running integration tests..."
pytest tests/integration/ -v --tb=short

echo "Running all tests with coverage..."
pytest tests/ --cov=app --cov-report=html --cov-report=term

echo "Stopping test database..."
docker-compose -f docker-compose.test.yml down

echo "Tests completed!"
```

### 6. CI/CD用GitHub Actions (.github/workflows/test.yml)

```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test_root
          MYSQL_DATABASE: test_mss_course_platform
          MYSQL_USER: test_user
          MYSQL_PASSWORD: test_password
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping -h localhost"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        cd backend/fastapi
        pip install -r requirements-dev.txt

    - name: Run tests
      env:
        DATABASE_URL: mysql+aiomysql://test_user:test_password@localhost:3306/test_mss_course_platform
        SECRET_KEY: test-secret-key-min-32-characters-long
      run: |
        cd backend/fastapi
        pytest tests/ -v --cov=app --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/fastapi/coverage.xml
```

## 受け入れ基準
- [ ] pytest環境が正しく設定される
- [ ] テスト用DBが自動でセットアップされる
- [ ] すべてのAPIエンドポイントのテストが実装される
- [ ] E2Eシナリオテストが実装される
- [ ] テストカバレッジが80%以上
- [ ] CIパイプラインでテストが自動実行される
- [ ] すべてのテストがパスする

## 技術仕様
- **テストフレームワーク**: pytest + pytest-asyncio
- **HTTPクライアント**: httpx AsyncClient
- **テストDB**: MySQL 8.0（ポート3307）
- **カバレッジ目標**: 80%以上

## テストカテゴリ
1. **Unit Tests**: 個別関数・クラスのテスト
2. **Integration Tests**: API統合テスト
3. **E2E Tests**: エンドツーエンドシナリオテスト

## 参考資料
- [pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)

## 依存関係
**依存するチケット**:
- すべてのAPI実装チケット

**このチケットに依存するチケット**:
- なし

## 備考
- テストデータは各テスト後にロールバック
- テストDBは実際のDBと同じスキーマ
- CI/CDパイプラインは別途設定
