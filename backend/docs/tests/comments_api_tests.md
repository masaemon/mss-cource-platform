# コメントAPI 統合テストケース

## 1. コースコメント一覧取得 API (`GET /api/v1/comments/courses/{course_id}/comments`)

### 正常系

#### TC-COMMENT-001: コースのコメント一覧を取得
- **前提条件**: コースに3つのコメントが投稿済み
- **リクエスト**: `GET /api/v1/comments/courses/{course_id}/comments`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスは配列
  - 件数が3件
  - 各コメントに以下が含まれる:
    - `id`, `course_id`, `user_id`, `content`
    - `is_instructor_reply`（boolean）
    - `created_at`, `updated_at`
    - `user` オブジェクト（id, email, avatar_url, role）
  - 作成日時の降順でソートされている

#### TC-COMMENT-002: コメントが0件のコース
- **前提条件**: コメントが投稿されていないコース
- **期待結果**:
  - ステータスコード: 200
  - レスポンス: []（空配列）

#### TC-COMMENT-003: 一般ユーザーと講師のコメントが混在
- **前提条件**:
  - 一般ユーザーのコメント2件（is_instructor_reply=false）
  - 講師の返信1件（is_instructor_reply=true）
- **期待結果**:
  - ステータスコード: 200
  - 一般ユーザーコメントの `is_instructor_reply` = false
  - 講師返信の `is_instructor_reply` = true

#### TC-COMMENT-004: ユーザー情報が正しく含まれる
- **期待結果**:
  - 各コメントの `user` オブジェクトに以下が含まれる:
    - `id`（ユーザーID）
    - `email`
    - `avatar_url`（nullの場合もある）
    - `role`（user/instructor/admin）

#### TC-COMMENT-005: 作成日時の降順ソート確認
- **前提条件**: コメントが時系列で 10:00, 11:00, 12:00 に投稿
- **期待結果**:
  - レスポンスの順序が 12:00, 11:00, 10:00（新しい順）

#### TC-COMMENT-006: 未認証でもコメント一覧を取得可能
- **リクエストヘッダー**: なし
- **期待結果**:
  - ステータスコード: 200
  - コメント一覧が取得できる

### 異常系

#### TC-COMMENT-007: 存在しないコースID
- **リクエスト**: `GET /api/v1/comments/courses/non-existent-id/comments`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

---

## 2. コメント投稿 API (`POST /api/v1/comments/courses/{course_id}/comments`)

### 正常系

#### TC-COMMENT-008: 有効なコメントを投稿
- **前提条件**: ログイン中の一般ユーザー
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**:
  ```json
  {
    "content": "とても分かりやすい講座でした！ありがとうございます。"
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - レスポンスに作成されたコメント情報が含まれる
  - `content` = "とても分かりやすい講座でした！ありがとうございます。"
  - `is_instructor_reply` = false
  - `user_id` = ログイン中のユーザーID
  - `course_id` = 指定したコースID
  - `user` オブジェクトが含まれる
  - データベースにコメントが作成される

#### TC-COMMENT-009: 長文コメント（5000文字）
- **リクエスト**:
  ```json
  {
    "content": "a" * 5000
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - コメントが作成される

#### TC-COMMENT-010: 短いコメント（1文字）
- **リクエスト**:
  ```json
  {
    "content": "a"
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - コメントが作成される

#### TC-COMMENT-011: 講師もコメント投稿可能
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: 有効なコメントデータ
- **期待結果**:
  - ステータスコード: 201
  - `is_instructor_reply` = false（通常のコメント投稿の場合）

#### TC-COMMENT-012: 管理者もコメント投稿可能
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: 有効なコメントデータ
- **期待結果**:
  - ステータスコード: 201
  - `is_instructor_reply` = false

#### TC-COMMENT-013: 改行を含むコメント
- **リクエスト**:
  ```json
  {
    "content": "1行目\n2行目\n3行目"
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - 改行が保持される

### 異常系 - バリデーション

#### TC-COMMENT-014: contentフィールドなし
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**:
  ```json
  {}
  ```
- **期待結果**: ステータスコード 422

#### TC-COMMENT-015: contentが空文字
- **リクエスト**:
  ```json
  {
    "content": ""
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COMMENT-016: contentが5001文字以上
- **リクエスト**:
  ```json
  {
    "content": "a" * 5001
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証

#### TC-COMMENT-017: 未認証でコメント投稿
- **リクエストヘッダー**: なし
- **リクエスト**: 有効なコメントデータ
- **期待結果**: ステータスコード 403

#### TC-COMMENT-018: 無効なトークンでコメント投稿
- **リクエストヘッダー**: `Authorization: Bearer invalid_token`
- **期待結果**: ステータスコード 401

### 異常系 - ビジネスロジック

#### TC-COMMENT-019: 存在しないコースIDにコメント投稿
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `POST /api/v1/comments/courses/non-existent-id/comments`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

### セキュリティ - レート制限

#### TC-COMMENT-020: レート制限（5回/分）- 5回目まで成功
- **前提条件**: 同一IPから1分以内に4回投稿済み
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: 有効なコメントデータ（5回目）
- **期待結果**:
  - ステータスコード: 201
  - コメントが作成される

#### TC-COMMENT-021: レート制限（5回/分）- 6回目は失敗
- **前提条件**: 同一IPから1分以内に5回投稿済み
- **リクエスト**: 有効なコメントデータ（6回目）
- **期待結果**:
  - ステータスコード: 429
  - エラーメッセージ: "Too many comments. Please slow down."

---

## 3. 講師返信 API (`POST /api/v1/comments/courses/{course_id}/comments/reply`)

### 正常系

#### TC-COMMENT-022: 講師としてコメントに返信
- **前提条件**: ログイン中の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "content": "ご質問ありがとうございます。こちらについては..."
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - `is_instructor_reply` = true
  - `user_id` = ログイン中の講師ID
  - `user` オブジェクトの `role` = "instructor" または "admin"

#### TC-COMMENT-023: 管理者がどのコースにも返信可能
- **前提条件**: 他の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: 有効な返信データ
- **期待結果**:
  - ステータスコード: 201
  - `is_instructor_reply` = true

#### TC-COMMENT-024: 講師返信も長文5000文字まで可能
- **リクエスト**:
  ```json
  {
    "content": "a" * 5000
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - 返信が作成される

### 異常系 - バリデーション

#### TC-COMMENT-025: contentフィールドなし
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {}
  ```
- **期待結果**: ステータスコード 422

#### TC-COMMENT-026: contentが空文字
- **リクエスト**:
  ```json
  {
    "content": ""
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COMMENT-027: contentが5001文字以上
- **リクエスト**:
  ```json
  {
    "content": "a" * 5001
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証・権限

#### TC-COMMENT-028: 未認証で講師返信
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-COMMENT-029: 一般ユーザーが講師返信
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: 有効な返信データ
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

#### TC-COMMENT-030: 他の講師のコースに返信
- **前提条件**: 別の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: 有効な返信データ
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Only course instructor can reply"

### 異常系 - ビジネスロジック

#### TC-COMMENT-031: 存在しないコースIDに講師返信
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `POST /api/v1/comments/courses/non-existent-id/comments/reply`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

### セキュリティ - レート制限

#### TC-COMMENT-032: 講師返信レート制限（10回/分）- 10回目まで成功
- **前提条件**: 同一IPから1分以内に9回返信済み
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: 有効な返信データ（10回目）
- **期待結果**:
  - ステータスコード: 201
  - 返信が作成される

#### TC-COMMENT-033: 講師返信レート制限（10回/分）- 11回目は失敗
- **前提条件**: 同一IPから1分以内に10回返信済み
- **リクエスト**: 有効な返信データ（11回目）
- **期待結果**:
  - ステータスコード: 429
  - エラーメッセージ: "Too many replies. Please slow down."

---

## 4. コメント削除 API (`DELETE /api/v1/comments/{comment_id}`)

### 正常系

#### TC-COMMENT-034: 自分のコメントを削除
- **前提条件**: ログイン中のユーザーが投稿したコメント
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `DELETE /api/v1/comments/{comment_id}`
- **期待結果**:
  - ステータスコード: 204
  - データベースからコメントが削除される

#### TC-COMMENT-035: 講師が自分のコメントを削除
- **前提条件**: 講師が投稿したコメント
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **期待結果**:
  - ステータスコード: 204
  - コメントが削除される

#### TC-COMMENT-036: 管理者が他のユーザーのコメントを削除
- **前提条件**: 一般ユーザーが投稿したコメント
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **期待結果**:
  - ステータスコード: 204
  - コメントが削除される

#### TC-COMMENT-037: 管理者が講師の返信を削除
- **前提条件**: 講師の返信（is_instructor_reply=true）
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **期待結果**:
  - ステータスコード: 204
  - 返信が削除される

### 異常系 - 認証・権限

#### TC-COMMENT-038: 未認証でコメント削除
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-COMMENT-039: 他のユーザーのコメントを削除
- **前提条件**: ユーザーAが投稿したコメント
- **リクエストヘッダー**: `Authorization: Bearer {user_b_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to delete this comment"

#### TC-COMMENT-040: 講師が他のユーザーのコメントを削除（管理者でない）
- **前提条件**: 一般ユーザーが投稿したコメント
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`（管理者ではない講師）
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to delete this comment"

#### TC-COMMENT-041: 一般ユーザーが講師の返信を削除
- **前提条件**: 講師の返信
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to delete this comment"

### 異常系 - ビジネスロジック

#### TC-COMMENT-042: 存在しないコメントIDで削除
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `DELETE /api/v1/comments/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Comment not found"

#### TC-COMMENT-043: 既に削除されたコメントを再度削除
- **前提条件**: 既に削除されたコメント
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Comment not found"

---

## 5. is_instructor_reply フラグの確認

### is_instructor_reply フラグテスト

#### TC-COMMENT-044: 一般ユーザーのコメントはis_instructor_reply=false
- **前提条件**: 一般ユーザーがコメント投稿
- **期待結果**:
  - `/comments` で投稿したコメントの `is_instructor_reply` = false

#### TC-COMMENT-045: 講師の返信はis_instructor_reply=true
- **前提条件**: 講師が `/comments/reply` で返信
- **期待結果**:
  - `is_instructor_reply` = true

#### TC-COMMENT-046: 講師が通常のコメントを投稿した場合
- **前提条件**: 講師が `/comments` エンドポイントで投稿（`/reply` ではない）
- **期待結果**:
  - `is_instructor_reply` = false

#### TC-COMMENT-047: 管理者の返信もis_instructor_reply=true
- **前提条件**: 管理者が `/comments/reply` で返信
- **期待結果**:
  - `is_instructor_reply` = true

---

## 6. ユーザー情報の埋め込み確認

### user オブジェクトのテスト

#### TC-COMMENT-048: コメント一覧でユーザー情報が含まれる
- **前提条件**: コメントが複数存在
- **リクエスト**: `GET /api/v1/comments/courses/{course_id}/comments`
- **期待結果**:
  - 各コメントの `user` オブジェクトに以下が含まれる:
    - `id`
    - `email`
    - `avatar_url`（nullの場合もある）
    - `role`

#### TC-COMMENT-049: コメント投稿時にユーザー情報が返却される
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `POST /api/v1/comments/courses/{course_id}/comments`
- **期待結果**:
  - レスポンスの `user` オブジェクトにログインユーザーの情報が含まれる

#### TC-COMMENT-050: 講師返信時にユーザー情報が返却される
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `POST /api/v1/comments/courses/{course_id}/comments/reply`
- **期待結果**:
  - レスポンスの `user` オブジェクトに講師の情報が含まれる
  - `user.role` = "instructor" または "admin"

#### TC-COMMENT-051: ユーザーが削除されたコメント（存在しないユーザー）
- **前提条件**: コメント投稿後にユーザーアカウントが削除された
- **リクエスト**: `GET /api/v1/comments/courses/{course_id}/comments`
- **期待結果**:
  - コメントは表示される
  - `user` = null またはエラーが発生しない

---

## テスト実行時の注意事項

1. **データベースのクリーンアップ**: 各テストケース実行前にテストデータをクリーンアップする
2. **ユーザー情報のロード**: selectinload で user リレーションが事前ロードされることを確認する
3. **ソート順**: コメント一覧が作成日時の降順でソートされることを確認する
4. **is_instructor_reply フラグ**: 通常のコメント（false）と講師返信（true）が正しく区別されることを確認する
5. **レート制限**: コメント投稿（5回/分）と講師返信（10回/分）が正しく動作することを確認する
6. **権限チェック**: 自分のコメントまたは管理者のみ削除できることを確認する
7. **CASCADE削除**: コース削除時に紐づくコメントも削除されることを確認する（データベース制約）
8. **XSS対策**: フロントエンド側でコメント表示時にサニタイズされることを確認（API側では保存のみ）
9. **改行・特殊文字**: 改行やHTMLタグが含まれたコメントが正しく保存・取得されることを確認する
10. **NULL処理**: ユーザーが削除された場合など、user が null でもエラーが発生しないことを確認する
