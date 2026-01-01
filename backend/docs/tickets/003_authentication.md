# Ticket #003: 認証・認可機能実装

## 概要
JWT認証、パスワードハッシュ化、ユーザー登録・ログイン機能の実装。

## 優先度
🔴 **Critical** - すべての保護されたエンドポイントの前提条件

## 見積もり
⏱️ **6-8時間**

## 目的
- JWT (JSON Web Token) ベースの認証を実装
- パスワードを安全にハッシュ化して保存
- ユーザー登録、ログイン、ログアウト機能を提供
- ロール (user/instructor/admin) ベースの認可を実装
- レート制限でブルートフォース攻撃を防止

## タスク

### 1. セキュリティモジュール実装

#### 1.1 パスワードハッシュ化 (app/core/security.py)
- [x] Passlib + bcrypt でパスワードハッシュ化
- [x] パスワード検証関数実装

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """平文パスワードとハッシュを比較"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化"""
    return pwd_context.hash(password)
```

#### 1.2 JWT トークン生成・検証 (app/core/security.py)
- [x] JWTトークン生成関数
- [x] JWTトークン検証関数
- [x] アクセストークン有効期限設定

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """JWTアクセストークンを生成"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """JWTトークンをデコード"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

### 2. 認証スキーマ定義 (app/schemas/auth.py)

- [x] ログインリクエスト用スキーマ
- [x] サインアップリクエスト用スキーマ
- [x] トークンレスポンス用スキーマ
- [x] ユーザー情報スキーマ

```python
from pydantic import BaseModel, EmailStr, Field
from app.models.profile import UserRole

class SignUpRequest(BaseModel):
    email: EmailStr
    display_name: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    role: UserRole
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)

class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
```

### 3. 依存性注入関数 (app/api/dependencies.py)

#### 3.1 現在のユーザー取得
- [x] Authorizationヘッダーからトークン抽出
- [x] トークンを検証してユーザー情報取得
- [x] 無効なトークンは401エラー

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.profile import Profile, UserRole
from app.core.security import decode_access_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Profile:
    """JWTトークンから現在のユーザーを取得"""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    result = await db.execute(select(Profile).where(Profile.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user
```

#### 3.2 ロールベース認可
- [x] 講師のみアクセス可能な依存性
- [x] 管理者のみアクセス可能な依存性

```python
async def get_current_instructor(
    current_user: Profile = Depends(get_current_user)
) -> Profile:
    """講師または管理者のみアクセス可能"""
    if current_user.role not in [UserRole.INSTRUCTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user

async def get_current_admin(
    current_user: Profile = Depends(get_current_user)
) -> Profile:
    """管理者のみアクセス可能"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
```

### 4. レート制限実装 (app/core/rate_limit.py)

- [x] メモリベースのレート制限実装
- [x] IPアドレスベースの制限
- [x] エンドポイント別の制限設定

```python
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import asyncio

class RateLimiter:
    def __init__(self):
        # {ip_address: {endpoint: [(timestamp, count)]}}
        self.requests: Dict[str, Dict[str, list]] = defaultdict(lambda: defaultdict(list))
        self.lock = asyncio.Lock()

    async def check_rate_limit(
        self,
        request: Request,
        max_requests: int,
        window_seconds: int,
        endpoint: str
    ) -> bool:
        """レート制限をチェック"""
        client_ip = request.client.host
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)

        async with self.lock:
            # 古いリクエストを削除
            self.requests[client_ip][endpoint] = [
                ts for ts in self.requests[client_ip][endpoint]
                if ts > window_start
            ]

            # 現在のリクエスト数をチェック
            if len(self.requests[client_ip][endpoint]) >= max_requests:
                return False

            # 新しいリクエストを記録
            self.requests[client_ip][endpoint].append(now)
            return True

rate_limiter = RateLimiter()

async def check_login_rate_limit(request: Request):
    """ログインエンドポイントのレート制限: 5回/5分"""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=5, window_seconds=300, endpoint="login"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )

async def check_signup_rate_limit(request: Request):
    """サインアップエンドポイントのレート制限: 3回/1時間"""
    is_allowed = await rate_limiter.check_rate_limit(
        request, max_requests=3, window_seconds=3600, endpoint="signup"
    )
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many signup attempts. Please try again later."
        )
```

### 5. 認証エンドポイント実装 (app/api/v1/auth.py)

#### 5.1 サインアップエンドポイント
- [x] `POST /api/v1/auth/signup`
- [x] メールアドレス重複チェック
- [x] パスワードハッシュ化
- [x] 新規ユーザー作成
- [x] JWTトークン返却

```python
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.db.session import get_db
from app.models.profile import Profile, UserRole
from app.schemas.auth import SignUpRequest, LoginRequest, TokenResponse, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rate_limit import check_signup_rate_limit, check_login_rate_limit

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: Request,
    signup_data: SignUpRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_signup_rate_limit)
):
    """新規ユーザー登録"""
    # メールアドレス重複チェック
    result = await db.execute(select(Profile).where(Profile.email == signup_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 新規ユーザー作成
    new_user = Profile(
        id=str(uuid.uuid4()),
        email=signup_data.email,
        display_name=signup_data.display_name,
        hashed_password=get_password_hash(signup_data.password),
        role=UserRole.USER
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # JWTトークン生成
    access_token = create_access_token(data={"sub": new_user.id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(new_user)
    )
```

#### 5.2 ログインエンドポイント
- [x] `POST /api/v1/auth/login`
- [x] メールアドレスとパスワードで認証
- [x] JWTトークン返却

```python
@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(check_login_rate_limit)
):
    """ログイン"""
    # ユーザー検索
    result = await db.execute(select(Profile).where(Profile.email == login_data.email))
    user = result.scalar_one_or_none()

    # ユーザーが存在しないまたはパスワードが一致しない
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # JWTトークン生成
    access_token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )
```

#### 5.3 ログアウトエンドポイント
- [x] `POST /api/v1/auth/logout`
- [x] クライアント側でトークンを削除（サーバー側では何もしない）

```python
@router.post("/logout")
async def logout():
    """ログアウト（クライアント側でトークンを削除）"""
    return {"success": True, "message": "Logged out successfully"}
```

#### 5.4 現在のユーザー情報取得
- [x] `GET /api/v1/auth/me`
- [x] ログイン中のユーザー情報を返却

```python
from app.api.dependencies import get_current_user

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Profile = Depends(get_current_user)):
    """現在のユーザー情報を取得"""
    return UserResponse.from_orm(current_user)
```

#### 5.5 プロフィール更新
- [x] `PUT /api/v1/auth/profile`
- [x] 表示名とbioを更新

```python
from app.schemas.auth import ProfileUpdateRequest

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Profile = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """ユーザープロフィールを更新"""
    # display_nameのバリデーション（必須ではないが、指定する場合は1文字以上）
    if profile_data.display_name is not None:
        if not profile_data.display_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Display name cannot be empty"
            )
        current_user.display_name = profile_data.display_name.strip()

    # bioの更新
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio.strip() if profile_data.bio else None

    await db.commit()
    await db.refresh(current_user)

    return UserResponse.from_orm(current_user)
```

#### 5.6 パスワードリセット（オプション）
- [x] `POST /api/v1/auth/reset-password`
- [x] メールアドレスを受け取り、リセットトークンを生成
- [x] `POST /api/v1/auth/reset-password/confirm`
- [x] トークンと新しいパスワードでパスワードをリセット

### 6. ルーターの登録 (app/main.py)

- [x] 認証ルーターをアプリに登録

```python
from app.api.v1.auth import router as auth_router

app.include_router(auth_router, prefix="/api/v1")
```

### 7. 認証テスト (tests/integration/test_auth.py)

- [x] サインアップのテスト
- [x] ログインのテスト
- [x] 無効なトークンのテスト
- [x] レート制限のテスト
- [x] ロールベース認可のテスト

```python
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_signup():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/v1/auth/signup", json={
            "email": "test@example.com",
            "display_name": "Test User",
            "password": "password123"
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@example.com"
        assert data["user"]["display_name"] == "Test User"

@pytest.mark.asyncio
async def test_login():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # まずユーザーを作成
        await client.post("/api/v1/auth/signup", json={
            "email": "login@example.com",
            "display_name": "Login User",
            "password": "password123"
        })

        # ログイン
        response = await client.post("/api/v1/auth/login", json={
            "email": "login@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

@pytest.mark.asyncio
async def test_invalid_token():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer invalid_token"
        })
        assert response.status_code == 401
```

### 8. セキュリティ設定の最終確認

- [x] SECRET_KEYが本番環境で適切に設定されているか確認
- [x] トークン有効期限が適切か確認
- [x] HTTPS使用を強制する設定（本番環境）
- [x] CORS設定が適切か確認

## 受け入れ基準
- [x] ユーザー登録ができる
- [x] ログインでJWTトークンが取得できる
- [x] 無効なトークンは401エラーが返る
- [x] 保護されたエンドポイントに有効なトークンでアクセスできる
- [x] ロールベース認可が正しく動作する（講師・管理者のみのエンドポイント）
- [x] レート制限が正しく動作する
- [x] パスワードがハッシュ化されてDBに保存される
- [x] すべての認証テストがパスする

## 技術仕様
- **JWT**: python-jose ライブラリ使用
- **パスワードハッシュ**: bcrypt (Passlib経由)
- **トークン有効期限**: 30分（設定可能）
- **レート制限**: メモリベース（本番環境ではRedis推奨）

## セキュリティ考慮事項
- パスワードは必ずハッシュ化して保存
- JWTのSECRET_KEYは32文字以上のランダム文字列
- トークンの有効期限を適切に設定
- レート制限でブルートフォース攻撃を防止
- HTTPS通信を強制（本番環境）
- センシティブな情報（パスワード）をログに出力しない

## 参考資料
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT.io](https://jwt.io/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [python-jose Documentation](https://python-jose.readthedocs.io/)

## 依存関係
**依存するチケット**:
- #001 開発環境構築
- #002 データベース設計

**このチケットに依存するチケット**:
- すべての保護されたAPIエンドポイント

## 備考
- レート制限はメモリベースのため、複数サーバーでは動作しない。本番環境ではRedisを使用することを推奨
- リフレッシュトークンは現時点では実装しない（必要に応じて後で追加）
- OAuth2（Google、GitHub等）連携は別チケットで対応
