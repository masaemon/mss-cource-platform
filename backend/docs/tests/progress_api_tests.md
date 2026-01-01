# 視聴進捗API 統合テストケース

## 1. 動画進捗更新 API (`POST /api/v1/progress/videos/{video_id}`)

### 正常系

#### TC-PROGRESS-001: 動画を完了としてマーク（初回）
- **前提条件**: ログイン中のユーザー、進捗記録が存在しない動画
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**:
  ```json
  {
    "is_completed": true
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - レスポンスに以下が含まれる:
    - `id`, `user_id`, `video_id`
    - `is_completed` = true
    - `completed_at` がタイムスタンプ（nullでない）
    - `created_at`, `updated_at`
  - データベースに進捗記録が作成される

#### TC-PROGRESS-002: 動画の完了を解除
- **前提条件**: 既に完了マークされている動画
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**:
  ```json
  {
    "is_completed": false
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `is_completed` = false
  - `completed_at` = null

#### TC-PROGRESS-003: 完了→未完了→完了の切り替え
- **前提条件**: 進捗記録が存在する動画
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **手順**:
  1. `is_completed: true` でリクエスト → `completed_at` に値が入る
  2. `is_completed: false` でリクエスト → `completed_at` が null になる
  3. `is_completed: true` でリクエスト → `completed_at` に新しいタイムスタンプが入る
- **期待結果**: すべてのステップで 200、適切に更新される

#### TC-PROGRESS-004: 同じ動画に複数回完了マーク
- **前提条件**: 既に完了マークされている動画
- **リクエスト**:
  ```json
  {
    "is_completed": true
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `is_completed` = true（変更なし）
  - `completed_at` が更新される

#### TC-PROGRESS-005: 自動的に進捗記録を作成（get_or_create）
- **前提条件**: 進捗記録が存在しない動画
- **リクエスト**:
  ```json
  {
    "is_completed": true
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - データベースに新しい進捗記録が作成される
  - `is_completed` = true

### 異常系 - バリデーション

#### TC-PROGRESS-006: is_completedフィールドなし
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**:
  ```json
  {}
  ```
- **期待結果**: ステータスコード 422

#### TC-PROGRESS-007: is_completedがboolean以外
- **リクエスト**:
  ```json
  {
    "is_completed": "true"
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証

#### TC-PROGRESS-008: 未認証で進捗更新
- **リクエストヘッダー**: なし
- **リクエスト**: 有効な進捗データ
- **期待結果**: ステータスコード 403

#### TC-PROGRESS-009: 無効なトークンで進捗更新
- **リクエストヘッダー**: `Authorization: Bearer invalid_token`
- **期待結果**: ステータスコード 401

### 異常系 - ビジネスロジック

#### TC-PROGRESS-010: 存在しない動画IDで進捗更新
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `POST /api/v1/progress/videos/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Video not found"

---

## 2. コース進捗取得 API (`GET /api/v1/progress/courses/{course_id}`)

### 正常系

#### TC-PROGRESS-011: コース進捗を取得（進捗0%）
- **前提条件**: コースに3つの動画があり、すべて未視聴
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `GET /api/v1/progress/courses/{course_id}`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスに以下が含まれる:
    - `course_id`
    - `total_videos` = 3
    - `completed_videos` = 0
    - `progress_percentage` = 0.0
    - `videos` は配列（3要素）
      - 各要素に `video_id`, `title_ja`, `title_en`, `order_number`, `is_completed` が含まれる
      - すべての `is_completed` = false

#### TC-PROGRESS-012: コース進捗を取得（進捗33.33%）
- **前提条件**: コースに3つの動画があり、1つが完了
- **期待結果**:
  - ステータスコード: 200
  - `total_videos` = 3
  - `completed_videos` = 1
  - `progress_percentage` = 33.33
  - `videos` 配列の1要素のみ `is_completed` = true

#### TC-PROGRESS-013: コース進捗を取得（進捗50%）
- **前提条件**: コースに4つの動画があり、2つが完了
- **期待結果**:
  - ステータスコード: 200
  - `total_videos` = 4
  - `completed_videos` = 2
  - `progress_percentage` = 50.0

#### TC-PROGRESS-014: コース進捗を取得（進捗100%）
- **前提条件**: コースに3つの動画があり、すべて完了
- **期待結果**:
  - ステータスコード: 200
  - `total_videos` = 3
  - `completed_videos` = 3
  - `progress_percentage` = 100.0
  - `videos` 配列のすべての要素で `is_completed` = true

#### TC-PROGRESS-015: 動画0件のコースの進捗
- **前提条件**: コースに動画が登録されていない
- **期待結果**:
  - ステータスコード: 200
  - `total_videos` = 0
  - `completed_videos` = 0
  - `progress_percentage` = 0.0
  - `videos` = []（空配列）

#### TC-PROGRESS-016: 進捗パーセンテージの小数点第2位まで
- **前提条件**: コースに3つの動画があり、1つが完了
- **期待結果**:
  - `progress_percentage` = 33.33（小数点第2位まで、切り捨てではなく四捨五入）

#### TC-PROGRESS-017: 動画がorder_number順で返却される
- **前提条件**: order_numberが 3, 1, 2 の順で登録されている
- **期待結果**:
  - `videos` 配列の order_number が 1, 2, 3 の順

#### TC-PROGRESS-018: 他のユーザーの進捗は含まれない
- **前提条件**:
  - ユーザーA: 動画1を完了
  - ユーザーB: 動画2を完了
- **リクエストヘッダー**: `Authorization: Bearer {user_a_token}`
- **期待結果**:
  - 動画1のみ `is_completed` = true
  - 動画2は `is_completed` = false

### 異常系 - 認証

#### TC-PROGRESS-019: 未認証でコース進捗取得
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-PROGRESS-020: 無効なトークンでコース進捗取得
- **リクエストヘッダー**: `Authorization: Bearer invalid_token`
- **期待結果**: ステータスコード 401

### 異常系 - ビジネスロジック

#### TC-PROGRESS-021: 存在しないコースIDで進捗取得
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `GET /api/v1/progress/courses/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

---

## 3. 全コース進捗サマリー取得 API (`GET /api/v1/progress`)

### 正常系

#### TC-PROGRESS-022: 全コース進捗サマリーを取得
- **前提条件**:
  - ユーザーがコースA（3動画中1完了）とコースB（2動画中2完了）の進捗を持っている
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `GET /api/v1/progress`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスは配列（2要素）
  - 各要素に以下が含まれる:
    - `course_id`, `course_title_ja`
    - `total_videos`, `completed_videos`, `progress_percentage`
  - コースAの要素:
    - `total_videos` = 3
    - `completed_videos` = 1
    - `progress_percentage` = 33.33
  - コースBの要素:
    - `total_videos` = 2
    - `completed_videos` = 2
    - `progress_percentage` = 100.0

#### TC-PROGRESS-023: 進捗がない場合
- **前提条件**: ユーザーがまだどのコースも視聴していない
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 200
  - レスポンス: []（空配列）

#### TC-PROGRESS-024: 複数コースの進捗がある場合
- **前提条件**: ユーザーが5つのコースで進捗を持っている
- **期待結果**:
  - ステータスコード: 200
  - レスポンスの配列に5要素

#### TC-PROGRESS-025: 他のユーザーのコース進捗は含まれない
- **前提条件**:
  - ユーザーA: コース1とコース2の進捗あり
  - ユーザーB: コース2とコース3の進捗あり
- **リクエストヘッダー**: `Authorization: Bearer {user_a_token}`
- **期待結果**:
  - コース1とコース2のみ返却される
  - コース3は含まれない

#### TC-PROGRESS-026: 進捗があるが動画が削除されたコース
- **前提条件**: コースに動画3本あり、1本完了後、動画が削除されて現在2本
- **期待結果**:
  - `total_videos` = 2（現在の動画数）
  - `completed_videos` = 削除された動画を除いた完了数
  - 進捗率は現在の動画数で再計算される

### 異常系 - 認証

#### TC-PROGRESS-027: 未認証で全コース進捗取得
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-PROGRESS-028: 無効なトークンで全コース進捗取得
- **リクエストヘッダー**: `Authorization: Bearer invalid_token`
- **期待結果**: ステータスコード 401

---

## 4. 進捗パーセンテージ計算の詳細テスト

### 計算精度テスト

#### TC-PROGRESS-029: 1/3 完了 = 33.33%
- **前提条件**: 3動画中1完了
- **期待結果**: `progress_percentage` = 33.33

#### TC-PROGRESS-030: 2/3 完了 = 66.67%
- **前提条件**: 3動画中2完了
- **期待結果**: `progress_percentage` = 66.67

#### TC-PROGRESS-031: 3/3 完了 = 100.0%
- **前提条件**: 3動画中3完了
- **期待結果**: `progress_percentage` = 100.0

#### TC-PROGRESS-032: 0/3 完了 = 0.0%
- **前提条件**: 3動画中0完了
- **期待結果**: `progress_percentage` = 0.0

#### TC-PROGRESS-033: 1/1 完了 = 100.0%
- **前提条件**: 1動画中1完了
- **期待結果**: `progress_percentage` = 100.0

#### TC-PROGRESS-034: 5/10 完了 = 50.0%
- **前提条件**: 10動画中5完了
- **期待結果**: `progress_percentage` = 50.0

#### TC-PROGRESS-035: 1/7 完了 = 14.29%
- **前提条件**: 7動画中1完了
- **期待結果**: `progress_percentage` = 14.29（小数点第2位まで四捨五入）

---

## 5. completed_at タイムスタンプの確認

### タイムスタンプ管理テスト

#### TC-PROGRESS-036: 完了時にcompleted_atが設定される
- **リクエスト**: `is_completed: true`
- **期待結果**:
  - `completed_at` がnullでない
  - `completed_at` が現在時刻に近い（数秒以内）

#### TC-PROGRESS-037: 未完了時にcompleted_atがnull
- **リクエスト**: `is_completed: false`
- **期待結果**:
  - `completed_at` = null

#### TC-PROGRESS-038: 再度完了時にcompleted_atが更新される
- **前提条件**: completed_at = "2024-01-01T00:00:00Z" の進捗
- **リクエスト**: `is_completed: true`
- **期待結果**:
  - `completed_at` が現在時刻に更新される
  - 古いタイムスタンプとは異なる

---

## 6. ユーザー分離テスト

### プライバシーとセキュリティ

#### TC-PROGRESS-039: ユーザーAの進捗がユーザーBに見えない
- **前提条件**:
  - ユーザーAがコース1で2動画完了
  - ユーザーBが同じコース1を視聴開始
- **リクエストヘッダー**: `Authorization: Bearer {user_b_token}`
- **リクエスト**: `GET /api/v1/progress/courses/{course_1_id}`
- **期待結果**:
  - `completed_videos` = 0
  - すべての動画で `is_completed` = false

#### TC-PROGRESS-040: 他のユーザーの動画進捗を更新できない（暗黙的）
- **前提条件**: ユーザーAの進捗記録が存在
- **リクエストヘッダー**: `Authorization: Bearer {user_b_token}`
- **リクエスト**: 同じ動画に対して進捗更新
- **期待結果**:
  - ユーザーBの進捗記録が新規作成される
  - ユーザーAの進捗記録は変更されない

---

## テスト実行時の注意事項

1. **データベースのクリーンアップ**: 各テストケース実行前にテストデータをクリーンアップする
2. **タイムスタンプの検証**: completed_at が適切に設定・更新されることを確認する
3. **進捗率の計算精度**: 小数点第2位まで四捨五入されることを確認する（33.33, 66.67）
4. **ユーザー分離**: 各ユーザーが自分の進捗のみ閲覧・更新できることを確認する
5. **自動作成**: 進捗記録が存在しない場合、自動的に作成されることを確認する
6. **ユニーク制約**: user_id と video_id の組み合わせでユニークであることを確認する
7. **N+1問題**: コース進捗取得時に動画を一括取得し、追加クエリが発生しないことを確認する
8. **NULL処理**: completed_at が適切に null または タイムスタンプになることを確認する
9. **order_numberソート**: videos 配列が常に order_number 順でソートされることを確認する
10. **パーセンテージ計算**: (completed_videos / total_videos) × 100 の計算が正確であることを確認する
