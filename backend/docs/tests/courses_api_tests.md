# コースAPI 統合テストケース

## 1. コース一覧取得 API (`GET /api/v1/courses`)

### 正常系

#### TC-COURSE-001: 公開コース一覧を取得
- **前提条件**: 公開コースが3件存在する
- **リクエスト**: `GET /api/v1/courses`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスに `data`, `total`, `page`, `limit` が含まれる
  - `data` は配列
  - `total` >= 3
  - `page` = 1
  - `limit` = 20

#### TC-COURSE-002: カテゴリーでフィルタリング
- **前提条件**: カテゴリーA に2件、カテゴリーB に1件のコースが存在
- **リクエスト**: `GET /api/v1/courses?category={category_a_id}`
- **期待結果**:
  - ステータスコード: 200
  - `data` の件数が2件
  - すべてのコースの `category_id` が `category_a_id`

#### TC-COURSE-003: キーワード検索（タイトル部分一致）
- **前提条件**: タイトルに "Python" を含むコースが2件存在
- **リクエスト**: `GET /api/v1/courses?search=Python`
- **期待結果**:
  - ステータスコード: 200
  - `data` の件数が2件
  - すべてのコースのタイトルに "Python" が含まれる

#### TC-COURSE-004: キーワード検索（説明文部分一致）
- **前提条件**: 説明文に "初心者" を含むコースが1件存在
- **リクエスト**: `GET /api/v1/courses?search=初心者`
- **期待結果**:
  - ステータスコード: 200
  - `data` の件数が1件
  - コースの説明文に "初心者" が含まれる

#### TC-COURSE-005: ページネーション（1ページ目）
- **前提条件**: 公開コースが25件存在
- **リクエスト**: `GET /api/v1/courses?page=1&limit=10`
- **期待結果**:
  - ステータスコード: 200
  - `data` の件数が10件
  - `total` = 25
  - `page` = 1
  - `limit` = 10

#### TC-COURSE-006: ページネーション（2ページ目）
- **前提条件**: 公開コースが25件存在
- **リクエスト**: `GET /api/v1/courses?page=2&limit=10`
- **期待結果**:
  - ステータスコード: 200
  - `data` の件数が10件
  - `page` = 2

#### TC-COURSE-007: ページネーション（最後のページ）
- **前提条件**: 公開コースが25件存在
- **リクエスト**: `GET /api/v1/courses?page=3&limit=10`
- **期待結果**:
  - ステータスコード: 200
  - `data` の件数が5件
  - `page` = 3

#### TC-COURSE-008: 複合フィルタリング（カテゴリー + 検索）
- **リクエスト**: `GET /api/v1/courses?category={category_id}&search=Python`
- **期待結果**:
  - ステータスコード: 200
  - すべてのコースが指定カテゴリーかつタイトル/説明に "Python" を含む

#### TC-COURSE-009: 非公開コースは表示されない
- **前提条件**: 公開コース3件、非公開コース2件が存在
- **リクエスト**: `GET /api/v1/courses`
- **期待結果**:
  - ステータスコード: 200
  - `total` = 3（公開コースのみ）
  - 非公開コースは含まれない

#### TC-COURSE-010: 空の結果（該当なし）
- **リクエスト**: `GET /api/v1/courses?search=存在しないキーワード`
- **期待結果**:
  - ステータスコード: 200
  - `data` = []
  - `total` = 0

### 異常系 - バリデーション

#### TC-COURSE-011: pageが0以下
- **リクエスト**: `GET /api/v1/courses?page=0`
- **期待結果**: ステータスコード 422

#### TC-COURSE-012: pageが負の値
- **リクエスト**: `GET /api/v1/courses?page=-1`
- **期待結果**: ステータスコード 422

#### TC-COURSE-013: limitが0以下
- **リクエスト**: `GET /api/v1/courses?limit=0`
- **期待結果**: ステータスコード 422

#### TC-COURSE-014: limitが上限超過（101以上）
- **リクエスト**: `GET /api/v1/courses?limit=101`
- **期待結果**: ステータスコード 422

---

## 2. コース詳細取得 API (`GET /api/v1/courses/{course_id}`)

### 正常系

#### TC-COURSE-015: 公開コースの詳細を取得
- **前提条件**: 公開コースが存在
- **リクエスト**: `GET /api/v1/courses/{course_id}`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスに以下が含まれる:
    - `id`, `title_ja`, `title_en`, `description_ja`, `description_en`
    - `thumbnail_url`, `category_id`, `instructor_id`, `is_published`
    - `created_at`, `updated_at`, `video_count`
    - `category` オブジェクト（name_ja, name_en, slug）
    - `instructor` オブジェクト（id, email, avatar_url, bio）
  - `video_count` が正確

#### TC-COURSE-016: 非公開コースの詳細を取得（講師本人）
- **前提条件**: ログイン中の講師が作成した非公開コース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `GET /api/v1/courses/{course_id}`
- **期待結果**:
  - ステータスコード: 200
  - コース情報が取得できる

### 異常系

#### TC-COURSE-017: 存在しないコースID
- **リクエスト**: `GET /api/v1/courses/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

#### TC-COURSE-018: 非公開コースを一般ユーザーが取得（未実装の場合はスキップ）
- **前提条件**: 他の講師が作成した非公開コース
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: `GET /api/v1/courses/{unpublished_course_id}`
- **期待結果**:
  - ステータスコード: 403 または 404
  - エラーメッセージ: "Not authorized" または "Course not found"

---

## 3. コース作成 API (`POST /api/v1/courses`)

### 正常系

#### TC-COURSE-019: 有効なデータでコース作成（講師）
- **前提条件**: 講師としてログイン済み
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "title_ja": "Pythonプログラミング入門",
    "title_en": "Introduction to Python Programming",
    "description_ja": "Python基礎を学ぶコース",
    "description_en": "Learn Python basics",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "category_id": "valid-category-id"
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - レスポンスに作成されたコース情報が含まれる
  - `instructor_id` がログイン中のユーザーID
  - `is_published` = false（初期値）
  - `video_count` = 0
  - データベースにコースが作成される

#### TC-COURSE-020: 最小限のフィールドでコース作成
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "title_ja": "新しいコース",
    "category_id": "valid-category-id"
  }
  ```
- **期待結果**:
  - ステータスコード: 201
  - `title_en`, `description_ja`, `description_en`, `thumbnail_url` は null

#### TC-COURSE-021: 管理者としてコース作成
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: 有効なコースデータ
- **期待結果**:
  - ステータスコード: 201
  - コースが作成される

### 異常系 - バリデーション

#### TC-COURSE-022: title_jaなし
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "category_id": "valid-category-id"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COURSE-023: title_jaが空文字
- **リクエスト**:
  ```json
  {
    "title_ja": "",
    "category_id": "valid-category-id"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COURSE-024: title_jaが256文字以上
- **リクエスト**:
  ```json
  {
    "title_ja": "a" * 256,
    "category_id": "valid-category-id"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COURSE-025: title_enが256文字以上
- **リクエスト**:
  ```json
  {
    "title_ja": "テスト",
    "title_en": "a" * 256,
    "category_id": "valid-category-id"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COURSE-026: category_idなし
- **リクエスト**:
  ```json
  {
    "title_ja": "テストコース"
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COURSE-027: 無効なthumbnail_url形式
- **リクエスト**:
  ```json
  {
    "title_ja": "テストコース",
    "thumbnail_url": "not-a-url",
    "category_id": "valid-category-id"
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証・権限

#### TC-COURSE-028: 未認証でコース作成
- **リクエストヘッダー**: なし
- **リクエスト**: 有効なコースデータ
- **期待結果**: ステータスコード 403

#### TC-COURSE-029: 一般ユーザーがコース作成
- **前提条件**: role = "user" のユーザーでログイン
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **リクエスト**: 有効なコースデータ
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

### 異常系 - ビジネスロジック

#### TC-COURSE-030: 存在しないcategory_id
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "title_ja": "テストコース",
    "category_id": "non-existent-category-id"
  }
  ```
- **期待結果**:
  - ステータスコード: 400 または 422
  - エラーメッセージ: "Category not found" または外部キー制約エラー

---

## 4. コース更新 API (`PUT /api/v1/courses/{course_id}`)

### 正常系

#### TC-COURSE-031: 自分のコースを更新（講師）
- **前提条件**: ログイン中の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "title_ja": "更新されたタイトル",
    "description_ja": "更新された説明"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `title_ja` と `description_ja` が更新される
  - その他のフィールドは変更されない

#### TC-COURSE-032: 一部フィールドのみ更新
- **リクエスト**:
  ```json
  {
    "title_en": "Updated Title"
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `title_en` のみ更新される

#### TC-COURSE-033: 管理者が他の講師のコースを更新
- **前提条件**: 他の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: 有効な更新データ
- **期待結果**:
  - ステータスコード: 200
  - コースが更新される

#### TC-COURSE-034: thumbnail_urlをnullに設定
- **リクエスト**:
  ```json
  {
    "thumbnail_url": null
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `thumbnail_url` が null になる

### 異常系 - バリデーション

#### TC-COURSE-035: title_jaが空文字
- **リクエスト**:
  ```json
  {
    "title_ja": ""
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COURSE-036: title_jaが256文字以上
- **リクエスト**:
  ```json
  {
    "title_ja": "a" * 256
  }
  ```
- **期待結果**: ステータスコード 422

#### TC-COURSE-037: 無効なthumbnail_url形式
- **リクエスト**:
  ```json
  {
    "thumbnail_url": "invalid-url"
  }
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証・権限

#### TC-COURSE-038: 未認証でコース更新
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-COURSE-039: 他の講師のコースを更新
- **前提条件**: 別の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: 有効な更新データ
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to update this course"

#### TC-COURSE-040: 一般ユーザーがコース更新
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

### 異常系 - ビジネスロジック

#### TC-COURSE-041: 存在しないコースIDで更新
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `PUT /api/v1/courses/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

#### TC-COURSE-042: 存在しないcategory_idに変更
- **リクエスト**:
  ```json
  {
    "category_id": "non-existent-category-id"
  }
  ```
- **期待結果**:
  - ステータスコード: 400 または 422
  - エラーメッセージ: "Category not found"

---

## 5. コース削除 API (`DELETE /api/v1/courses/{course_id}`)

### 正常系

#### TC-COURSE-043: 自分のコースを削除（講師）
- **前提条件**: ログイン中の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `DELETE /api/v1/courses/{course_id}`
- **期待結果**:
  - ステータスコード: 204
  - データベースからコースが削除される

#### TC-COURSE-044: 管理者が他の講師のコースを削除
- **前提条件**: 他の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**: `DELETE /api/v1/courses/{course_id}`
- **期待結果**:
  - ステータスコード: 204
  - コースが削除される

### 異常系 - 認証・権限

#### TC-COURSE-045: 未認証でコース削除
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-COURSE-046: 他の講師のコースを削除
- **前提条件**: 別の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to delete this course"

#### TC-COURSE-047: 一般ユーザーがコース削除
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

### 異常系 - ビジネスロジック

#### TC-COURSE-048: 存在しないコースIDで削除
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `DELETE /api/v1/courses/non-existent-id`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

#### TC-COURSE-049: 動画が紐づいているコースの削除（カスケード削除）
- **前提条件**: コースに3つの動画が紐づいている
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `DELETE /api/v1/courses/{course_id}`
- **期待結果**:
  - ステータスコード: 204
  - コースと紐づく動画がすべて削除される（CASCADE設定による）

---

## 6. コース公開切り替え API (`PATCH /api/v1/courses/{course_id}/publish`)

### 正常系

#### TC-COURSE-050: コースを公開する
- **前提条件**: 非公開コース（is_published = false）
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**:
  ```json
  {
    "is_published": true
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `is_published` = true
  - 公開コース一覧に表示されるようになる

#### TC-COURSE-051: コースを非公開にする
- **前提条件**: 公開コース（is_published = true）
- **リクエスト**:
  ```json
  {
    "is_published": false
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - `is_published` = false
  - 公開コース一覧に表示されなくなる

#### TC-COURSE-052: 管理者が他の講師のコースを公開
- **前提条件**: 他の講師が作成した非公開コース
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **リクエスト**:
  ```json
  {
    "is_published": true
  }
  ```
- **期待結果**:
  - ステータスコード: 200
  - コースが公開される

### 異常系 - バリデーション

#### TC-COURSE-053: is_publishedフィールドなし
- **リクエスト**:
  ```json
  {}
  ```
- **期待結果**: ステータスコード 422

### 異常系 - 認証・権限

#### TC-COURSE-054: 未認証でコース公開
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-COURSE-055: 他の講師のコースを公開
- **前提条件**: 別の講師が作成したコース
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Not authorized to publish this course"

#### TC-COURSE-056: 一般ユーザーがコース公開
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

### 異常系 - ビジネスロジック

#### TC-COURSE-057: 存在しないコースIDで公開切り替え
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `PATCH /api/v1/courses/non-existent-id/publish`
- **期待結果**:
  - ステータスコード: 404
  - エラーメッセージ: "Course not found"

---

## 7. 講師のコース一覧取得 API (`GET /api/v1/instructor/courses`)

### 正常系

#### TC-COURSE-058: 講師の全コースを取得
- **前提条件**: ログイン中の講師が3つのコースを作成済み（公開1件、非公開2件）
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **リクエスト**: `GET /api/v1/instructor/courses`
- **期待結果**:
  - ステータスコード: 200
  - レスポンスは配列
  - 件数が3件（公開・非公開両方含む）
  - すべてのコースの `instructor_id` がログイン中のユーザーID

#### TC-COURSE-059: 管理者が自分のコースを取得
- **前提条件**: 管理者が作成したコースが2件存在
- **リクエストヘッダー**: `Authorization: Bearer {admin_token}`
- **期待結果**:
  - ステータスコード: 200
  - 件数が2件

#### TC-COURSE-060: コースを作成していない講師
- **前提条件**: コースを1つも作成していない講師
- **リクエストヘッダー**: `Authorization: Bearer {instructor_token}`
- **期待結果**:
  - ステータスコード: 200
  - レスポンス: []（空配列）

### 異常系 - 認証・権限

#### TC-COURSE-061: 未認証でコース一覧取得
- **リクエストヘッダー**: なし
- **期待結果**: ステータスコード 403

#### TC-COURSE-062: 一般ユーザーが講師コース一覧を取得
- **前提条件**: role = "user" のユーザーでログイン
- **リクエストヘッダー**: `Authorization: Bearer {user_token}`
- **期待結果**:
  - ステータスコード: 403
  - エラーメッセージ: "Instructor or admin role required"

---

## テスト実行時の注意事項

1. **データベースのクリーンアップ**: 各テストケース実行前にテストデータをクリーンアップする
2. **リレーションの確認**: カテゴリー、講師情報が正しくロードされることを確認する
3. **ソート順**: コース一覧は作成日時の降順でソートされることを確認する
4. **N+1問題**: selectinload でリレーションが事前ロードされ、追加クエリが発生しないことを確認する
5. **CASCADE削除**: コース削除時に紐づく動画、進捗、コメントも削除されることを確認する
6. **公開フラグ**: 公開コース一覧には `is_published=true` のコースのみ表示されることを確認する
