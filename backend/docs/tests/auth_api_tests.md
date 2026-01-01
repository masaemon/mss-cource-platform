# 認証API 統合テストケース

## 1. サインアップ API (`POST /api/v1/auth/signup`)

### 正常系

#### TC-AUTH-001: 有効なデータでサインアップ
- **前提条件**: なし
- **リクエスト**:
  ```json
  {
    "email": "newuser@example.com",
    "display_name": "New User",
    "password": "password123"
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - レスポンスに `access_token` が含まれる
  - レスポンスに `user` オブジェクトが含まれる
  - `user.email` が "newuser@example.com"
  - `user.display_name` が "New User"
  - `user.role` が "user"
  - データベースにユーザーが作成される
  - パスワードがハッシュ化されて保存される

### 異常系 - バリデーション

#### TC-AUTH-002: メールアドレスなし
- **リクエスト**:
  ```json
  {
    "display_name": "Test User",
    "password": "password123"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-003: 無効なメールアドレス形式
- **リクエスト**:
  ```json
  {
    "email": "invalid-email",
    "display_name": "Test User",
    "password": "password123"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-004: display_nameなし
- **リクエスト**:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-005: display_nameが空文字
- **リクエスト**:
  ```json
  {
    "email": "test@example.com",
    "display_name": "",
    "password": "password123"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-006: display_nameが51文字以上
- **リクエスト**:
  ```json
  {
    "email": "test@example.com",
    "display_name": "a" * 51,
    "password": "password123"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-007: パスワードなし
- **リクエスト**:
  ```json
  {
    "email": "test@example.com",
    "display_name": "Test User"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-008: パスワードが6文字未満
- **リクエスト**:
  ```json
  {
    "email": "test@example.com",
    "display_name": "Test User",
    "password": "pass"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-009: パスワードが100文字超過
- **リクエスト**:
  ```json
  {
    "email": "test@example.com",
    "display_name": "Test User",
    "password": "a" * 101
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - ビジネスロジック

#### TC-AUTH-010: 既に登録済みのメールアドレス
- **前提条件**: "existing@example.com" が既に登録済み
- **リクエスト**:
  ```json
  {
    "email": "existing@example.com",
    "display_name": "Test User",
    "password": "password123"
  }
  ```
- **期待結果**:
  - ステータスコード: 400
  - エラーメッセージ: "Email already registered"

### セキュリティ

#### TC-AUTH-011: レート制限 - 1時間に4回目のサインアップ
- **前提条件**: 同一IPから1時間以内に3回サインアップ済み
- **期待結果**:
  - ステータスコード: 429
  - エラーメッセージ: "Too many signup attempts"

---

## 2. ログイン API (`POST /api/v1/auth/login`)

### 正常系

#### TC-AUTH-012: 有効な認証情報でログイン
- **前提条件**: ユーザー "user@example.com" が登録済み
- **リクエスト**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - レスポンスに `access_token` が含まれる
  - レスポンスに `user` オブジェクトが含まれる
  - `token_type` が "bearer"

### 異常系 - バリデーション

#### TC-AUTH-013: メールアドレスなし
- **リクエスト**:
  ```json
  {
    "password": "password123"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-014: パスワードなし
- **リクエスト**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証失敗

#### TC-AUTH-015: 存在しないメールアドレス
- **リクエスト**:
  ```json
  {
    "email": "nonexistent@example.com",
    "password": "password123"
  }
  ```
- **期待結果**:
  - ステータスコード: 401
  - エラーメッセージ: "Incorrect email or password"

#### TC-AUTH-016: 間違ったパスワード
- **前提条件**: ユーザー "user@example.com" が登録済み
- **リクエスト**:
  ```json
  {
    "email": "user@example.com",
    "password": "wrongpassword"
  }
  ```
- **期待結果**:
  - ステータスコード: 401
  - エラーメッセージ: "Incorrect email or password"

### セキュリティ

#### TC-AUTH-017: レート制限 - 5分間に6回目のログイン試行
- **前提条件**: 同一IPから5分以内に5回ログイン試行済み
- **期待結果**:
  - ステータスコード: 429
  - エラーメッセージ: "Too many login attempts"

---

## 3. 現在のユーザー情報取得 API (`GET /api/v1/auth/me`)

### 正常系

#### TC-AUTH-018: 有効なトークンでユーザー情報取得
- **前提条件**: 有効なアクセストークンを取得済み
- **リクエストヘッダー**: `Authorization: Bearer {valid_token}`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスに `id`, `email`, `display_name`, `role` が含まれる
  - `hashed_password` は含まれない

### 異常系

#### TC-AUTH-019: トークンなし
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-AUTH-020: 無効なトークン
- **リクエストヘッダー**: `Authorization: Bearer invalid_token`
- **期待結果**: ステータスコード 401

#### TC-AUTH-021: 期限切れトークン
- **前提条件**: 有効期限切れのトークン
- **リクエストヘッダー**: `Authorization: Bearer {expired_token}`
- **期待結果**: ステータスコード 401

---

## 4. プロフィール更新 API (`PUT /api/v1/auth/profile`)

### 正常系

#### TC-AUTH-022: display_nameのみ更新
- **前提条件**: ログイン済み
- **リクエスト**:
  ```json
  {
    "display_name": "Updated Name"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `display_name` が "Updated Name" に更新される
  - データベースも更新される

#### TC-AUTH-023: bioのみ更新
- **前提条件**: ログイン済み
- **リクエスト**:
  ```json
  {
    "bio": "This is my bio"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `bio` が "This is my bio" に更新される

#### TC-AUTH-024: display_nameとbioを両方更新
- **前提条件**: ログイン済み
- **リクエスト**:
  ```json
  {
    "display_name": "New Name",
    "bio": "New bio"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - 両方のフィールドが更新される

#### TC-AUTH-025: bioをnullにクリア
- **前提条件**: ログイン済み、bioが設定済み
- **リクエスト**:
  ```json
  {
    "bio": null
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `bio` がnullになる

### 異常系 - バリデーション

#### TC-AUTH-026: display_nameが空文字
- **リクエスト**:
  ```json
  {
    "display_name": ""
  }
  ```
- **期待結果**: ステータスコード 400

#### TC-AUTH-027: display_nameが空白のみ
- **リクエスト**:
  ```json
  {
    "display_name": "   "
  }
  ```
- **期待結果**: ステータスコード 400

#### TC-AUTH-028: display_nameが51文字以上
- **リクエスト**:
  ```json
  {
    "display_name": "a" * 51
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-AUTH-029: bioが500文字超過
- **リクエスト**:
  ```json
  {
    "bio": "a" * 501
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証

#### TC-AUTH-030: 未認証でプロフィール更新
- **前提条件**: トークンなし
- **期待結果**: ステータスコード 403

---

## 5. ログアウト API (`POST /api/v1/auth/logout`)

### 正常系

#### TC-AUTH-031: ログアウト成功
- **期待結果**:
  - ステータスコード: 200
  - レスポンスに success: true が含まれる
  - （注: サーバーサイドでは何も処理しない、クライアント側でトークン削除）

---

## テスト実行時の注意事項

1. **データベースのクリーンアップ**: 各テストケース実行前にテストデータをクリーンアップする
2. **レート制限のリセット**: レート制限のテストを実行する際は、適切にリセットまたは待機する
3. **トークンの検証**: JWTトークンが正しいペイロード（sub, exp, iat）を含むことを確認する
4. **パスワードのハッシュ化**: データベースに平文パスワードが保存されていないことを確認する
5. **セキュリティヘッダー**: WWW-Authenticate ヘッダーが適切に設定されることを確認する
