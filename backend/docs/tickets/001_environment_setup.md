# Ticket #001: 開発環境構築

## 概要
Python FastAPI BFFの開発環境をDockerベースで構築する。

## 優先度
🔴 **Critical** - 他の全てのチケットの前提条件

## 見積もり
⏱️ **4-6時間**

## 目的
- ローカル開発環境でBFFとMySQLを動作させる
- 開発者が簡単に環境を立ち上げられるようにする
- 本番環境と同等の構成をDockerで再現する

## タスク

### 1. プロジェクト構造作成
- [ ] `backend/fastapi/` ディレクトリ作成
- [ ] 以下のディレクトリ構成を作成:
  ```
  backend/fastapi/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── api/
  │   │   ├── __init__.py
  │   │   └── v1/
  │   │       └── __init__.py
  │   ├── core/
  │   │   ├── __init__.py
  │   │   ├── config.py
  │   │   └── security.py
  │   ├── db/
  │   │   ├── __init__.py
  │   │   ├── session.py
  │   │   └── base.py
  │   ├── models/
  │   │   └── __init__.py
  │   ├── schemas/
  │   │   └── __init__.py
  │   └── utils/
  │       └── __init__.py
  ├── tests/
  │   ├── __init__.py
  │   ├── conftest.py
  │   └── integration/
  │       └── __init__.py
  ├── migrations/
  │   └── versions/
  ├── scripts/
  │   ├── init_db.sh
  │   └── seed_data.py
  ├── .env.example
  ├── .gitignore
  ├── Dockerfile
  ├── docker-compose.yml
  ├── requirements.txt
  ├── requirements-dev.txt
  └── README.md
  ```

### 2. Dockerfile作成
- [ ] Python 3.11以上のベースイメージを使用
- [ ] マルチステージビルドで本番用イメージを最適化
- [ ] 非rootユーザーで実行
- [ ] 必要なパッケージをインストール

**Dockerfile例**:
```dockerfile
# Development stage
FROM python:3.11-slim as development

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy application
COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM python:3.11-slim as production

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 appuser

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY --chown=appuser:appuser ./app ./app

USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3. docker-compose.yml作成
- [ ] FastAPI アプリケーションサービス
- [ ] MySQL 8.0 サービス
- [ ] ボリューム設定（DB永続化、コード同期）
- [ ] ネットワーク設定
- [ ] 環境変数設定

**docker-compose.yml例**:
```yaml
version: '3.8'

services:
  api:
    build:
      context: ./fastapi
      target: development
    container_name: mss-bff-api
    ports:
      - "8000:8000"
    volumes:
      - ./fastapi/app:/app/app
      - ./fastapi/tests:/app/tests
    environment:
      - DATABASE_URL=mysql+aiomysql://mss_user:mss_password@db:3306/mss_course_platform
      - ENVIRONMENT=development
      - DEBUG=true
      - SECRET_KEY=dev-secret-key-change-in-production
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
    networks:
      - mss-network
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: mysql:8.0
    container_name: mss-bff-db
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: mss_course_platform
      MYSQL_USER: mss_user
      MYSQL_PASSWORD: mss_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./fastapi/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot_password"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - mss-network

volumes:
  mysql_data:

networks:
  mss-network:
    driver: bridge
```

### 4. requirements.txt作成
- [ ] FastAPI本体
- [ ] Uvicorn (ASGIサーバー)
- [ ] SQLAlchemy (ORM)
- [ ] aiomysql (非同期MySQL接続)
- [ ] Alembic (マイグレーション)
- [ ] Pydantic settings
- [ ] python-jose (JWT)
- [ ] passlib (パスワードハッシュ)
- [ ] python-multipart (ファイルアップロード)

**requirements.txt例**:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
aiomysql==0.2.0
alembic==1.13.1
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.26.0
```

### 5. requirements-dev.txt作成
- [ ] pytest (テスト)
- [ ] pytest-asyncio (非同期テスト)
- [ ] httpx (APIテストクライアント)
- [ ] black (フォーマッター)
- [ ] ruff (リンター)
- [ ] mypy (型チェック)

**requirements-dev.txt例**:
```txt
-r requirements.txt

pytest==7.4.4
pytest-asyncio==0.23.3
pytest-cov==4.1.0
black==24.1.1
ruff==0.1.14
mypy==1.8.0
```

### 6. 環境変数設定ファイル作成
- [ ] `.env.example` 作成
- [ ] 必要な環境変数を全て定義

**.env.example**:
```env
# Application
ENVIRONMENT=development
DEBUG=true
API_VERSION=v1
PROJECT_NAME=MSS Course Platform BFF

# Database
DATABASE_URL=mysql+aiomysql://mss_user:mss_password@db:3306/mss_course_platform

# Security
SECRET_KEY=your-secret-key-here-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIR=/app/uploads

# Logging
LOG_LEVEL=INFO
```

### 7. 基本的なFastAPIアプリケーション作成
- [ ] `app/main.py` にエントリーポイント作成
- [ ] ヘルスチェックエンドポイント実装
- [ ] CORS設定
- [ ] ロギング設定

**app/main.py例**:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": settings.API_VERSION
    }

@app.get("/")
async def root():
    return {
        "message": "MSS Course Platform BFF API",
        "docs": "/api/docs"
    }
```

### 8. 設定管理実装
- [ ] `app/core/config.py` 作成
- [ ] Pydantic Settingsで環境変数管理

**app/core/config.py例**:
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "MSS Course Platform BFF"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_VERSION: str = "v1"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 9. 起動スクリプト作成
- [ ] `scripts/init_db.sh` でDB初期化スクリプト作成
- [ ] README.md に起動手順を記載

### 10. 動作確認
- [ ] `docker-compose up` で起動
- [ ] `http://localhost:8000/health` にアクセス
- [ ] `http://localhost:8000/api/docs` でSwagger UIを確認
- [ ] MySQL接続確認

## 受け入れ基準
- [ ] `docker-compose up` で環境が正常に起動する
- [ ] ヘルスチェックエンドポイントが正常に応答する
- [ ] Swagger UIでAPIドキュメントが表示される
- [ ] MySQLに接続できることを確認
- [ ] ホットリロードが動作する（コード変更が即座に反映される）
- [ ] READMEに従って新しい開発者が環境を構築できる

## 技術仕様
- **Python**: 3.11以上
- **FastAPI**: 0.109以上
- **MySQL**: 8.0
- **Docker**: 20.10以上
- **Docker Compose**: 2.0以上

## 参考資料
- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [Docker公式ドキュメント](https://docs.docker.com/)
- [MySQL 8.0ドキュメント](https://dev.mysql.com/doc/refman/8.0/en/)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)

## 依存関係
**依存するチケット**: なし

**このチケットに依存するチケット**:
- #002 データベース設計
- #003 認証機能実装
- すべてのAPI実装チケット

## 備考
- 開発環境では `.env` ファイルは `.gitignore` に追加し、`.env.example` のみをコミット
- 本番環境の環境変数は別途環境変数で設定（Dockerコンテナ起動時に注入）
- セキュリティ上、SECRET_KEYは必ず変更すること
