# 動画API 統合テストケース

## 1. コース動画一覧取得 API (`GET /api/v1/videos/courses/{course_id}/videos`)

### 正常系

#### TC-VIDEO-001: コースの動画一覧を取得
- **前提条件**: コースに3つの動画が登録済み
- **リクエスト**: `GET /api/v1/videos/courses/{course_id}/videos`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスは配列
  - 件数が3件
  - 各動画に以下が含まれる:
    - `id`, `course_id`, `title_ja`, `title_en`
    - `description_ja`, `description_en`
    - `youtube_url`, `youtube_video_id`
    - `order_number`, `duration_seconds`
    - `created_at`, `updated_at`
  - `order_number` の昇順でソートされている

#### TC-VIDEO-002: 動画が0件のコース
- **前提条件**: 動画が登録されていないコース
- **期待結果**:
  - ステータスコード: 200
  - レスポンス: []（空配列）

#### TC-VIDEO-003: order_numberの昇順ソート確認
- **前提条件**: order_number が 3, 1, 2 の順で登録されている
- **期待結果**:
  - レスポンスの order_number が 1, 2, 3 の順

### 異常系

#### TC-VIDEO-004: 存在しないコースID
- **リクエスト**: `GET /api/v1/videos/courses/non-existent-id/videos`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

---

## 2. 動画追加 API (`POST /api/v1/videos/courses/{course_id}/videos`)

### 正常系

#### TC-VIDEO-005: 有効なデータで動画追加（youtube.com/watch形式）
- **前提条件**: 講師としてログイン済み
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "title_ja": "Python入門 第1回",
    "title_en": "Python Intro Lesson 1",
    "description_ja": "変数とデータ型",
    "description_en": "Variables and data types",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - レスポンスに作成された動画情報が含まれる
  - `youtube_video_id` = "dQw4w9WgXcQ"
  - `course_id` が指定したコースID
  - `order_number` = 1
  - データベースに動画が作成される

#### TC-VIDEO-006: 最小限のフィールドで動画追加
- **リクエスト**:
  ```json
  {
    "title_ja": "動画タイトル",
    "youtube_url": "https://youtu.be/dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - `title_en`, `description_ja`, `description_en` は null

#### TC-VIDEO-007: YouTube短縮URL形式（youtu.be）
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://youtu.be/dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - `youtube_video_id` = "dQw4w9WgXcQ"

#### TC-VIDEO-008: YouTube埋め込み形式（youtube.com/embed）
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - `youtube_video_id` = "dQw4w9WgXcQ"

#### TC-VIDEO-009: HTTPSなしのYouTube URL
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - `youtube_video_id` = "dQw4w9WgXcQ"

#### TC-VIDEO-010: パラメータ付きYouTube URL
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s&feature=youtu.be",
    "order_number": 1
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - `youtube_video_id` = "dQw4w9WgXcQ"

#### TC-VIDEO-011: 管理者として動画追加
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: 有効な動画データ
- **期待結果**:
  - ステータスコード: 201
  - 動画が作成される

#### TC-VIDEO-012: order_numberを自動採番（最大値+1）
- **前提条件**: コースに order_number = 5 の動画が最後に存在
- **リクエスト**: order_number を指定しない（または null）
- **期待結果**:
  - ステータスコード: 201
  - `order_number` = 6（自動的に最大値+1）

### 異常系 - バリデーション

#### TC-VIDEO-013: title_jaなし
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-014: title_jaが空文字
- **リクエスト**:
  ```json
  {
    "title_ja": "",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-015: title_jaが256文字以上
- **リクエスト**:
  ```json
  {
    "title_ja": "a" * 256,
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-016: title_enが256文字以上
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト",
    "title_en": "a" * 256,
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": 1
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-017: youtube_urlなし
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "order_number": 1
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-018: 無効なYouTube URL（完全に無効）
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://example.com/video",
    "order_number": 1
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-019: 無効なYouTube URL（video_idが11文字未満）
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://www.youtube.com/watch?v=short",
    "order_number": 1
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-020: order_numberなし
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-021: order_numberが0以下
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": 0
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-022: order_numberが負の値
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト動画",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order_number": -1
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証・権限

#### TC-VIDEO-023: 未認証で動画追加
- **リクエストヘッダー**: なし
- **リクエスト**: 有効な動画データ
- **期待結果**: ステータスコード 403

#### TC-VIDEO-024: 一般ユーザーが動画追加
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: 有効な動画データ
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

#### TC-VIDEO-025: 他の講師のコースに動画追加
- **前提条件**: 別の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: 有効な動画データ
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to add videos to this course"

### 異常系 - ビジネスロジック

#### TC-VIDEO-026: 存在しないコースIDに動画追加
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `POST /api/v1/videos/courses/non-existent-id/videos`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

---

## 3. 動画更新 API (`PUT /api/v1/videos/{video_id}`)

### 正常系

#### TC-VIDEO-027: 動画のタイトルを更新
- **前提条件**: ログイン中の講師が作成したコースの動画
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "title_ja": "更新されたタイトル"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `title_ja` が更新される
  - その他のフィールドは変更されない

#### TC-VIDEO-028: YouTube URLを変更
- **リクエスト**:
  ```json
  {
    "youtube_url": "https://www.youtube.com/watch?v=new_video_id"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `youtube_url` が更新される
  - `youtube_video_id` = "new_video_id" に自動更新される

#### TC-VIDEO-029: 複数フィールドを同時更新
- **リクエスト**:
  ```json
  {
    "title_ja": "新しいタイトル",
    "description_ja": "新しい説明",
    "order_number": 3
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - 指定したフィールドすべてが更新される

#### TC-VIDEO-030: description_jaをnullに設定
- **リクエスト**:
  ```json
  {
    "description_ja": null
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `description_ja` が null になる

#### TC-VIDEO-031: 管理者が他の講師のコースの動画を更新
- **前提条件**: 他の講師が作成したコースの動画
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: 有効な更新データ
- **期待結果**:
  - ステータスコード: 200
  - 動画が更新される

### 異常系 - バリデーション

#### TC-VIDEO-032: title_jaが空文字
- **リクエスト**:
  ```json
  {
    "title_ja": ""
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-033: title_jaが256文字以上
- **リクエスト**:
  ```json
  {
    "title_ja": "a" * 256
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-034: 無効なYouTube URL
- **リクエスト**:
  ```json
  {
    "youtube_url": "https://invalid-url.com"
  }
  ```
- **期待結果**: ステータスコード 422 または 400

#### TC-VIDEO-035: order_numberが0以下
- **リクエスト**:
  ```json
  {
    "order_number": 0
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証・権限

#### TC-VIDEO-036: 未認証で動画更新
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-VIDEO-037: 他の講師のコースの動画を更新
- **前提条件**: 別の講師が作成したコースの動画
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: 有効な更新データ
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to update this video"

#### TC-VIDEO-038: 一般ユーザーが動画更新
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

### 異常系 - ビジネスロジック

#### TC-VIDEO-039: 存在しない動画IDで更新
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `PUT /api/v1/videos/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Video not found"

---

## 4. 動画削除 API (`DELETE /api/v1/videos/{video_id}`)

### 正常系

#### TC-VIDEO-040: 動画を削除
- **前提条件**: ログイン中の講師が作成したコースの動画
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `DELETE /api/v1/videos/{video_id}`
- **期待結果**:
  - ステータスコード: 204
  - データベースから動画が削除される

#### TC-VIDEO-041: 管理者が他の講師のコースの動画を削除
- **前提条件**: 他の講師が作成したコースの動画
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **期待結果**:
  - ステータスコード: 204
  - 動画が削除される

#### TC-VIDEO-042: 進捗記録が紐づいている動画の削除（カスケード）
- **前提条件**: 動画に視聴進捗が複数紐づいている
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **期待結果**:
  - ステータスコード: 204
  - 動画と紐づく視聴進捗がすべて削除される（CASCADE）

### 異常系 - 認証・権限

#### TC-VIDEO-043: 未認証で動画削除
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-VIDEO-044: 他の講師のコースの動画を削除
- **前提条件**: 別の講師が作成したコースの動画
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to delete this video"

#### TC-VIDEO-045: 一般ユーザーが動画削除
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

### 異常系 - ビジネスロジック

#### TC-VIDEO-046: 存在しない動画IDで削除
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `DELETE /api/v1/videos/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Video not found"

---

## 5. 動画順序変更 API (`PATCH /api/v1/videos/courses/{course_id}/reorder`)

### 正常系

#### TC-VIDEO-047: 3つの動画の順序を変更
- **前提条件**: コースに3つの動画が存在（order_number: 1, 2, 3）
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "video_orders": [
      {"video_id": "video-id-3", "order_number": 1},
      {"video_id": "video-id-1", "order_number": 2},
      {"video_id": "video-id-2", "order_number": 3}
    ]
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - レスポンスは配列
  - 各動画の order_number が更新されている
  - レスポンスが order_number の昇順でソートされている

#### TC-VIDEO-048: 2つの動画の順序を入れ替え
- **前提条件**: 動画A（order=1）と動画B（order=2）が存在
- **リクエスト**:
  ```json
  {
    "video_orders": [
      {"video_id": "video-b-id", "order_number": 1},
      {"video_id": "video-a-id", "order_number": 2}
    ]
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - 動画Bの order_number = 1
  - 動画Aの order_number = 2

#### TC-VIDEO-049: 管理者が他の講師のコースの動画順序を変更
- **前提条件**: 他の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: 有効な順序変更データ
- **期待結果**:
  - ステータスコード: 200
  - 順序が変更される

#### TC-VIDEO-050: 一部の動画のみ順序変更
- **前提条件**: コースに5つの動画が存在
- **リクエスト**: 2つの動画のみ順序変更
- **期待結果**:
  - ステータスコード: 200
  - 指定した2つの動画のみ order_number が更新される

### 異常系 - バリデーション

#### TC-VIDEO-051: video_ordersが空配列
- **リクエスト**:
  ```json
  {
    "video_orders": []
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-052: video_ordersフィールドなし
- **リクエスト**:
  ```json
  {}
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-053: video_idがない
- **リクエスト**:
  ```json
  {
    "video_orders": [
      {"order_number": 1}
    ]
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-VIDEO-054: order_numberがない
- **リクエスト**:
  ```json
  {
    "video_orders": [
      {"video_id": "some-id"}
    ]
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証・権限

#### TC-VIDEO-055: 未認証で順序変更
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-VIDEO-056: 他の講師のコースの動画順序を変更
- **前提条件**: 別の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to reorder videos"

#### TC-VIDEO-057: 一般ユーザーが順序変更
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

### 異常系 - ビジネスロジック

#### TC-VIDEO-058: 存在しないコースIDで順序変更
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `PATCH /api/v1/videos/courses/non-existent-id/reorder`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

#### TC-VIDEO-059: 別のコースの動画IDを指定
- **前提条件**: コースAの順序変更リクエストにコースBの動画IDを含める
- **リクエスト**:
  ```json
  {
    "video_orders": [
      {"video_id": "course-b-video-id", "order_number": 1}
    ]
  }
  ```
- **期待結果**:
  - ステータスコード: 200（スキップされる）
  - または 400（エラー）

#### TC-VIDEO-060: 存在しない動画IDを指定
- **リクエスト**:
  ```json
  {
    "video_orders": [
      {"video_id": "non-existent-video-id", "order_number": 1}
    ]
  }
  ```
- **期待結果**:
  - ステータスコード: 200（スキップされる）
  - または 404（エラー）

---

## テスト実行時の注意事項

1. **データベースのクリーンアップ**: 各テストケース実行前にテストデータをクリーンアップする
2. **YouTube URL検証**: 複数の形式（youtube.com/watch, youtu.be, youtube.com/embed）を必ずテストする
3. **video_id抽出**: YouTube URLから正しく11文字のvideo_idが抽出されることを確認する
4. **order_number**: 動画一覧が常に order_number の昇順でソートされることを確認する
5. **CASCADE削除**: 動画削除時に紐づく視聴進捗も削除されることを確認する
6. **権限チェック**: コースのinstructor_idとログインユーザーIDの一致確認が正しく動作することを確認する
7. **自動採番**: order_numberを指定しない場合、最大値+1が自動的に設定されることを確認する
