# Ticket #002: データベース設計とマイグレーション

## 概要
MySQL用のデータベーススキーマ設計、SQLAlchemyモデル定義、Alembicマイグレーションの実装。

## 優先度
🔴 **Critical** - 全てのAPI実装の前提条件

## 見積もり
⏱️ **6-8時間**

## 目的
- 既存のSupabase PostgreSQLスキーマをMySQLに移植
- SQLAlchemyモデルを定義してORMを使えるようにする
- Alembicでマイグレーション管理を行う
- インデックスを適切に設定してパフォーマンスを確保

## タスク

### 1. Alembic初期化
- [x] Alembicの設定ファイル作成
- [x] `alembic init migrations` 実行
- [x] `alembic.ini` の設定
- [x] `migrations/env.py` の設定（非同期対応）

**alembic.ini設定例**:
```ini
[alembic]
script_location = migrations
prepend_sys_path = .
version_path_separator = os

sqlalchemy.url = mysql+aiomysql://mss_user:mss_password@localhost:3306/mss_course_platform

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### 2. データベースモデル定義

#### 2.1 Baseモデル作成
- [x] `app/db/base.py` に共通のBaseクラス作成
- [x] タイムスタンプ用のMixin作成

**app/db/base.py例**:
```python
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

#### 2.2 Profilesモデル (app/models/profile.py)
- [x] Profileモデル定義
- [x] UserRole ENUM定義

```python
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

    id = Column(CHAR(36), primary_key=True)  # UUID as CHAR(36)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(50), nullable=True)
    avatar_url = Column(Text, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    bio = Column(Text, nullable=True)
    hashed_password = Column(String(255), nullable=False)

    # Relationships
    # courses (instructor_id -> courses)
    # video_progress (user_id -> video_progress)
    # comments (user_id -> course_comments)
```

#### 2.3 Categoriesモデル (app/models/category.py)
- [x] Categoryモデル定義

```python
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

    # Relationships
    # courses (category_id -> courses)
```

#### 2.4 Coursesモデル (app/models/course.py)
- [x] Courseモデル定義
- [x] 外部キー設定

```python
from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin

class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(CHAR(36), primary_key=True)
    title_ja = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=True)
    description_ja = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    category_id = Column(CHAR(36), ForeignKey("categories.id"), nullable=False, index=True)
    instructor_id = Column(CHAR(36), ForeignKey("profiles.id"), nullable=False, index=True)
    is_published = Column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    category = relationship("Category", backref="courses")
    instructor = relationship("Profile", backref="courses")
    videos = relationship("Video", back_populates="course", cascade="all, delete-orphan")
    comments = relationship("CourseComment", back_populates="course", cascade="all, delete-orphan")
```

#### 2.5 Videosモデル (app/models/video.py)
- [x] Videoモデル定義

```python
from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin

class Video(Base, TimestampMixin):
    __tablename__ = "videos"

    id = Column(CHAR(36), primary_key=True)
    course_id = Column(CHAR(36), ForeignKey("courses.id"), nullable=False, index=True)
    title_ja = Column(String(255), nullable=False)
    title_en = Column(String(255), nullable=True)
    description_ja = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)
    youtube_url = Column(String(500), nullable=False)
    youtube_video_id = Column(String(50), nullable=False)
    order_number = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="videos")
    progress = relationship("VideoProgress", back_populates="video", cascade="all, delete-orphan")

    # Composite index for ordering
    __table_args__ = (
        Index('idx_course_order', 'course_id', 'order_number'),
    )
```

#### 2.6 VideoProgressモデル (app/models/video_progress.py)
- [x] VideoProgressモデル定義
- [x] ユニーク制約設定

```python
from sqlalchemy import Column, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin

class VideoProgress(Base, TimestampMixin):
    __tablename__ = "video_progress"

    id = Column(CHAR(36), primary_key=True)
    user_id = Column(CHAR(36), ForeignKey("profiles.id"), nullable=False, index=True)
    video_id = Column(CHAR(36), ForeignKey("videos.id"), nullable=False, index=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("Profile")
    video = relationship("Video", back_populates="progress")

    # Unique constraint
    __table_args__ = (
        UniqueConstraint('user_id', 'video_id', name='uq_user_video'),
    )
```

#### 2.7 CourseCommentsモデル (app/models/comment.py)
- [x] CourseCommentモデル定義

```python
from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import CHAR
from app.db.base import Base, TimestampMixin

class CourseComment(Base, TimestampMixin):
    __tablename__ = "course_comments"

    id = Column(CHAR(36), primary_key=True)
    course_id = Column(CHAR(36), ForeignKey("courses.id"), nullable=False, index=True)
    user_id = Column(CHAR(36), ForeignKey("profiles.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_instructor_reply = Column(Boolean, default=False, nullable=False)

    # Relationships
    course = relationship("Course", back_populates="comments")
    user = relationship("Profile")
```

### 3. データベースセッション管理
- [x] `app/db/session.py` 作成
- [x] 非同期セッション設定
- [x] 依存性注入用の関数作成

**app/db/session.py例**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### 4. 初期マイグレーション作成
- [x] すべてのモデルをインポートする `app/db/base.py` 作成
- [x] 初期マイグレーション生成: `alembic revision --autogenerate -m "Initial schema"`
- [x] マイグレーションファイルをレビュー
- [x] インデックスが適切に作成されているか確認

**migrations/env.py設定**:
```python
from logging.config import fileConfig
from sqlalchemy import pool
from alembic import context
from app.db.base import Base
from app.core.config import settings

# Import all models
from app.models.profile import Profile
from app.models.category import Category
from app.models.course import Course
from app.models.video import Video
from app.models.video_progress import VideoProgress
from app.models.comment import CourseComment

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())
```

### 5. シードデータ作成
- [x] `scripts/seed_data.py` 作成
- [x] サンプルカテゴリデータ
- [x] 管理者ユーザー作成

**scripts/seed_data.py例**:
```python
import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.profile import Profile, UserRole
from app.models.category import Category
from app.core.security import get_password_hash

async def create_categories(session: AsyncSession):
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
    print("Categories created")

async def create_admin_user(session: AsyncSession):
    admin = Profile(
        id=str(uuid.uuid4()),
        email="admin@example.com",
        role=UserRole.ADMIN,
        hashed_password=get_password_hash("admin123"),
        bio="System Administrator"
    )
    session.add(admin)
    await session.commit()
    print(f"Admin user created: {admin.email}")

async def main():
    async with AsyncSessionLocal() as session:
        await create_categories(session)
        await create_admin_user(session)

if __name__ == "__main__":
    asyncio.run(main())
```

### 6. マイグレーション実行スクリプト
- [x] `scripts/init_db.sh` 作成

**scripts/init_db.sh**:
```bash
#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."
while ! mysqladmin ping -h"db" -u"root" -p"root_password" --silent; do
    sleep 1
done

echo "Running migrations..."
alembic upgrade head

echo "Seeding data..."
python scripts/seed_data.py

echo "Database initialized successfully!"
```

### 7. モデル単体テスト
- [ ] `tests/models/test_profile.py` 作成
- [ ] 各モデルの基本的なCRUD操作をテスト

### 8. インデックス最適化
- [ ] よく検索されるカラムにインデックスを追加
  - `profiles.email` (UNIQUE INDEX)
  - `categories.slug` (UNIQUE INDEX)
  - `courses.is_published` (INDEX)
  - `courses.category_id` (INDEX)
  - `courses.instructor_id` (INDEX)
  - `videos.course_id, order_number` (COMPOSITE INDEX)
  - `video_progress.user_id` (INDEX)
  - `video_progress.video_id` (INDEX)
  - `video_progress.user_id, video_id` (UNIQUE COMPOSITE)
  - `course_comments.course_id` (INDEX)
  - `course_comments.user_id` (INDEX)

### 9. マイグレーション動作確認
- [x] `docker-compose up` で環境起動
- [x] `docker-compose exec api alembic upgrade head` 実行
- [x] MySQLにログインしてテーブル確認
- [x] シードデータ投入確認

## 受け入れ基準
- [x] すべてのテーブルがMySQLに作成される
- [x] 外部キー制約が正しく設定される
- [x] インデックスが適切に作成される
- [x] Alembicマイグレーションが正常に実行される
- [x] シードデータが正常に投入される
- [ ] `alembic downgrade -1` でロールバックできる
- [x] すべてのリレーションシップが正しく動作する

## 技術仕様
- **ORM**: SQLAlchemy 2.0 (非同期対応)
- **マイグレーション**: Alembic
- **データベース**: MySQL 8.0
- **文字コード**: utf8mb4
- **照合順序**: utf8mb4_unicode_ci

## データベース設計図

```
profiles (ユーザー・講師・管理者)
├── id (PK, CHAR(36))
├── email (UNIQUE, INDEX)
├── role (ENUM: user/instructor/admin)
├── hashed_password
└── timestamps

categories (カテゴリー)
├── id (PK, CHAR(36))
├── name_ja, name_en
├── slug (UNIQUE, INDEX)
└── timestamps

courses (コース)
├── id (PK, CHAR(36))
├── title_ja, title_en
├── description_ja, description_en
├── category_id (FK -> categories, INDEX)
├── instructor_id (FK -> profiles, INDEX)
├── is_published (INDEX)
└── timestamps

videos (動画)
├── id (PK, CHAR(36))
├── course_id (FK -> courses, INDEX)
├── title_ja, title_en
├── youtube_video_id
├── order_number (COMPOSITE INDEX with course_id)
└── timestamps

video_progress (視聴進捗)
├── id (PK, CHAR(36))
├── user_id (FK -> profiles, INDEX)
├── video_id (FK -> videos, INDEX)
├── is_completed
├── UNIQUE(user_id, video_id)
└── timestamps

course_comments (コメント)
├── id (PK, CHAR(36))
├── course_id (FK -> courses, INDEX)
├── user_id (FK -> profiles, INDEX)
├── content
├── is_instructor_reply
└── timestamps
```

## 参考資料
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [MySQL 8.0 Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)
- [FastAPI with SQLAlchemy](https://fastapi.tiangolo.com/tutorial/sql-databases/)

## 依存関係
**依存するチケット**:
- #001 開発環境構築

**このチケットに依存するチケット**:
- #003 認証機能実装
- すべてのAPI実装チケット

## 備考
- UUIDはMySQLでは `CHAR(36)` として保存（PostgreSQLの`UUID`型はMySQLにない）
- MySQLでは `ENUM` 型を使用（PostgreSQLのカスタムENUM型とは異なる）
- タイムスタンプは `DATETIME` 型を使用
- すべてのテーブルで `utf8mb4` 文字セットを使用（絵文字対応）
