# MSS Course Platform BFF - 実装ガイド

## 概要

このドキュメントは、MSS Course PlatformのBackend for Frontend (BFF) をPython FastAPI + MySQLで実装するための完全なガイドです。

## 技術スタック

- **言語**: Python 3.11+
- **フレームワーク**: FastAPI 0.109+
- **ORM**: SQLAlchemy 2.0 (非同期)
- **データベース**: MySQL 8.0
- **認証**: JWT (JSON Web Tokens)
- **マイグレーション**: Alembic
- **テスト**: pytest + httpx
- **環境**: Docker + Docker Compose

## プロジェクト構造

```
backend/
├── fastapi/                    # FastAPIアプリケーション
│   ├── app/
│   │   ├── api/               # APIエンドポイント
│   │   │   └── v1/
│   │   │       ├── auth.py    # 認証エンドポイント
│   │   │       ├── courses.py # コースエンドポイント
│   │   │       ├── videos.py  # 動画エンドポイント
│   │   │       ├── progress.py# 進捗エンドポイント
│   │   │       ├── comments.py# コメントエンドポイント
│   │   │       └── categories.py
│   │   ├── core/              # コア機能
│   │   │   ├── config.py      # 設定管理
│   │   │   ├── security.py    # JWT・パスワード
│   │   │   └── rate_limit.py  # レート制限
│   │   ├── db/                # データベース
│   │   │   ├── base.py        # Base model
│   │   │   └── session.py     # セッション管理
│   │   ├── models/            # SQLAlchemyモデル
│   │   │   ├── profile.py
│   │   │   ├── course.py
│   │   │   ├── video.py
│   │   │   ├── category.py
│   │   │   ├── video_progress.py
│   │   │   └── comment.py
│   │   ├── repositories/      # リポジトリパターン
│   │   │   ├── course.py
│   │   │   ├── video.py
│   │   │   ├── progress.py
│   │   │   └── comment.py
│   │   ├── schemas/           # Pydanticスキーマ
│   │   │   ├── auth.py
│   │   │   ├── course.py
│   │   │   ├── video.py
│   │   │   ├── progress.py
│   │   │   └── comment.py
│   │   ├── utils/             # ユーティリティ
│   │   │   └── youtube.py
│   │   └── main.py            # アプリケーションエントリーポイント
│   ├── tests/
│   │   ├── conftest.py        # テスト設定
│   │   ├── fixtures/          # テストフィクスチャ
│   │   └── integration/       # 統合テスト
│   ├── migrations/            # Alembicマイグレーション
│   ├── scripts/               # ユーティリティスクリプト
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── requirements-dev.txt
├── openapi/
│   └── api-spec.yaml          # OpenAPI仕様書
└── docs/
    ├── README.md              # このファイル
    └── tickets/               # 実装チケット
        ├── 001_environment_setup.md
        ├── 002_database_design.md
        ├── 003_authentication.md
        ├── 004_api_courses.md
        ├── 005_api_videos.md
        ├── 006_api_progress.md
        ├── 007_api_comments.md
        └── 008_integration_tests.md
```

## 実装チケット

実装は以下の順序で進めます:

### Phase 1: 基盤構築
1. **[#001 開発環境構築](tickets/001_environment_setup.md)** ⏱️ 4-6h 🔴 Critical
   - Docker環境構築
   - FastAPI基本設定
   - docker-compose.yml作成

2. **[#002 データベース設計](tickets/002_database_design.md)** ⏱️ 6-8h 🔴 Critical
   - SQLAlchemyモデル定義
   - Alembicマイグレーション
   - シードデータ作成

3. **[#003 認証機能実装](tickets/003_authentication.md)** ⏱️ 6-8h 🔴 Critical
   - JWT認証
   - ユーザー登録・ログイン
   - ロールベース認可
   - レート制限

### Phase 2: コアAPI実装
4. **[#004 コースAPI実装](tickets/004_api_courses.md)** ⏱️ 6-8h 🟠 High
   - コースCRUD
   - 検索・フィルタリング
   - 公開/非公開切り替え

5. **[#005 動画API実装](tickets/005_api_videos.md)** ⏱️ 4-6h 🟠 High
   - 動画CRUD
   - YouTube URL処理
   - 順序変更

6. **[#006 進捗API実装](tickets/006_api_progress.md)** ⏱️ 3-4h 🟠 High
   - 視聴進捗管理
   - 進捗率計算

7. **[#007 コメントAPI実装](tickets/007_api_comments.md)** ⏱️ 3-4h 🟡 Medium
   - コメント投稿
   - 講師返信
   - レート制限

### Phase 3: 品質保証
8. **[#008 統合テスト実装](tickets/008_integration_tests.md)** ⏱️ 6-8h 🟠 High
   - pytest環境構築
   - APIテスト
   - E2Eシナリオテスト
   - CI/CD設定

## 見積もりサマリー

| フェーズ | チケット数 | 見積時間 | 優先度 |
|---------|-----------|---------|--------|
| Phase 1 | 3 | 16-22h | Critical |
| Phase 2 | 4 | 16-22h | High/Medium |
| Phase 3 | 1 | 6-8h | High |
| **合計** | **8** | **38-52h** | - |

**推定期間**: 5-7営業日（1人のフルタイム開発者の場合）

## クイックスタート

### 1. 環境構築

```bash
# リポジトリクローン
cd backend/fastapi

# 環境変数設定
cp .env.example .env
# .env を編集して設定

# Docker環境起動
docker-compose up -d

# マイグレーション実行
docker-compose exec api alembic upgrade head

# シードデータ投入
docker-compose exec api python scripts/seed_data.py
```

### 2. APIドキュメント確認

```bash
# Swagger UI
open http://localhost:8000/api/docs

# ReDoc
open http://localhost:8000/api/redoc
```

### 3. テスト実行

```bash
# 統合テスト
docker-compose exec api pytest tests/integration/ -v

# カバレッジ付き全テスト
docker-compose exec api pytest tests/ --cov=app --cov-report=html
```

## 主要なAPIエンドポイント

### 認証
- `POST /api/v1/auth/signup` - ユーザー登録
- `POST /api/v1/auth/login` - ログイン
- `GET /api/v1/auth/me` - 現在のユーザー情報

### コース
- `GET /api/v1/courses` - コース一覧
- `GET /api/v1/courses/{id}` - コース詳細
- `POST /api/v1/courses` - コース作成（講師）
- `PUT /api/v1/courses/{id}` - コース更新
- `PATCH /api/v1/courses/{id}/publish` - 公開切り替え

### 動画
- `GET /api/v1/videos/courses/{courseId}/videos` - 動画一覧
- `POST /api/v1/videos/courses/{courseId}/videos` - 動画追加
- `PUT /api/v1/videos/{id}` - 動画更新
- `PATCH /api/v1/videos/courses/{courseId}/reorder` - 順序変更

### 進捗
- `POST /api/v1/progress/videos/{videoId}` - 進捗更新
- `GET /api/v1/progress/courses/{courseId}` - コース進捗取得
- `GET /api/v1/progress` - 全コース進捗サマリー

### コメント
- `GET /api/v1/comments/courses/{courseId}/comments` - コメント一覧
- `POST /api/v1/comments/courses/{courseId}/comments` - コメント投稿
- `POST /api/v1/comments/courses/{courseId}/comments/reply` - 講師返信
- `DELETE /api/v1/comments/{id}` - コメント削除

## データベーススキーマ

```
profiles (ユーザー)
  ├── id (PK)
  ├── email (UNIQUE)
  ├── role (user/instructor/admin)
  └── hashed_password

categories (カテゴリー)
  ├── id (PK)
  ├── name_ja, name_en
  └── slug (UNIQUE)

courses (コース)
  ├── id (PK)
  ├── title_ja, title_en
  ├── category_id (FK → categories)
  ├── instructor_id (FK → profiles)
  └── is_published

videos (動画)
  ├── id (PK)
  ├── course_id (FK → courses)
  ├── youtube_video_id
  └── order_number

video_progress (進捗)
  ├── id (PK)
  ├── user_id (FK → profiles)
  ├── video_id (FK → videos)
  ├── is_completed
  └── UNIQUE(user_id, video_id)

course_comments (コメント)
  ├── id (PK)
  ├── course_id (FK → courses)
  ├── user_id (FK → profiles)
  ├── content
  └── is_instructor_reply
```

## セキュリティ

### 認証・認可
- JWT (JSON Web Tokens) による認証
- ロールベース認可 (user/instructor/admin)
- パスワードはbcryptでハッシュ化

### レート制限
- ログイン: 5回/5分
- サインアップ: 3回/1時間
- コメント投稿: 5回/分
- 講師返信: 10回/分

### その他
- CORS設定（Next.jsアプリからのアクセスのみ許可）
- HTTPS通信（本番環境）
- 環境変数で機密情報を管理

## 開発ガイドライン

### コーディング規約
- **フォーマッター**: Black
- **リンター**: Ruff
- **型チェック**: mypy
- **命名規則**: PEP 8に準拠

### コミットメッセージ
```
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正

## トラブルシューティング

### DB接続エラー
```bash
# MySQLが起動しているか確認
docker-compose ps

# ログを確認
docker-compose logs db

# 再起動
docker-compose restart db
```

### マイグレーションエラー
```bash
# マイグレーション履歴を確認
docker-compose exec api alembic history

# 1つ前に戻す
docker-compose exec api alembic downgrade -1

# 最新に更新
docker-compose exec api alembic upgrade head
```

### テスト失敗
```bash
# テストDBをリセット
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d

# キャッシュをクリア
docker-compose exec api pytest --cache-clear
```

## パフォーマンス最適化

### データベース
- 適切なインデックス設定
- N+1問題の回避（`selectinload`使用）
- コネクションプール設定

### API
- ページネーション実装
- レスポンスキャッシング（Redis導入時）
- 非同期処理の活用

## デプロイ

### 本番環境への移行準備
1. 環境変数の設定
2. SECRET_KEYの生成（32文字以上のランダム文字列）
3. CORS設定の確認
4. DBバックアップ設定
5. ログ監視設定

### 推奨環境
- **CPU**: 2コア以上
- **メモリ**: 4GB以上
- **ストレージ**: 20GB以上
- **OS**: Ubuntu 22.04 LTS

## 参考資料

### 公式ドキュメント
- [FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Pydantic](https://docs.pydantic.dev/)
- [Alembic](https://alembic.sqlalchemy.org/)
- [pytest](https://docs.pytest.org/)

### ベストプラクティス
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)
- [SQLAlchemy Best Practices](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)

## サポート

### 質問・相談
- プロジェクトのIssueを作成
- 開発チームにSlackで連絡

### バグ報告
1. 再現手順を記載
2. 期待される動作と実際の動作を明記
3. エラーログを添付

## ライセンス

このプロジェクトは社内専用です。

---

**作成日**: 2025-12-31
**最終更新**: 2025-12-31
**バージョン**: 1.0.0
