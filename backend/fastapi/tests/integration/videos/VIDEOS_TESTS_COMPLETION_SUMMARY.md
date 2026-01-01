# Videos API Integration Tests - 完了サマリー

## 概要

動画API（Videos API）の統合テストケース全60件の実装が完了しました。

## 実装済みテストケース一覧

### 1. GET /api/v1/videos/courses/{course_id}/videos - 動画一覧取得（TC-VIDEO-001 ~ 004）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-VIDEO-001 | コースの動画一覧取得 | HTTP 200 + 配列確認 |
| TC-VIDEO-002 | 空のコース（動画0件） | HTTP 200 + 空配列 |
| TC-VIDEO-003 | order_number昇順ソート | ソート確認 |
| TC-VIDEO-004 | 存在しないコースID | HTTP 404 |

### 2. POST /api/v1/videos/courses/{course_id}/videos - 動画追加（TC-VIDEO-005 ~ 026）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-VIDEO-005 | 有効な動画追加（youtube.com/watch） | HTTP 201 + video_id抽出 |
| TC-VIDEO-006 | 最小限のフィールド | HTTP 201 |
| TC-VIDEO-007 | YouTube短縮URL（youtu.be） | HTTP 201 + video_id抽出 |
| TC-VIDEO-008 | YouTube埋め込み形式（embed） | HTTP 201 + video_id抽出 |
| TC-VIDEO-009 | HTTP（HTTPSなし） | HTTP 201 |
| TC-VIDEO-010 | パラメータ付きYouTube URL | HTTP 201 + video_id抽出 |
| TC-VIDEO-011 | 管理者による動画追加 | HTTP 201 |
| TC-VIDEO-012 | order_number自動採番 | HTTP 201 |
| TC-VIDEO-013 | title_jaなし | HTTP 422 |
| TC-VIDEO-014 | title_jaが空文字 | HTTP 422 |
| TC-VIDEO-015 | title_jaが256文字超 | HTTP 422 |
| TC-VIDEO-016 | title_enが256文字超 | HTTP 422 |
| TC-VIDEO-017 | youtube_urlなし | HTTP 422 |
| TC-VIDEO-018 | 無効なYouTube URL | HTTP 422 |
| TC-VIDEO-019 | video_idが11文字未満 | HTTP 422 |
| TC-VIDEO-020 | order_numberなし | HTTP 422 |
| TC-VIDEO-021 | order_number = 0 | HTTP 422 |
| TC-VIDEO-022 | order_number負の値 | HTTP 422 |
| TC-VIDEO-023 | 未認証 | HTTP 403 |
| TC-VIDEO-024 | 一般ユーザー | HTTP 403 |
| TC-VIDEO-025 | 他講師のコース | HTTP 403 |
| TC-VIDEO-026 | 存在しないコースID | HTTP 404 |

### 3. PUT /api/v1/videos/{video_id} - 動画更新（TC-VIDEO-027 ~ 039）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-VIDEO-027 | タイトル更新 | HTTP 200 |
| TC-VIDEO-028 | YouTube URL変更 | HTTP 200 + video_id更新 |
| TC-VIDEO-029 | 複数フィールド同時更新 | HTTP 200 |
| TC-VIDEO-030 | description_jaをnullに設定 | HTTP 200 |
| TC-VIDEO-031 | 管理者が他講師の動画更新 | HTTP 200 |
| TC-VIDEO-032 | title_jaが空文字 | HTTP 422 |
| TC-VIDEO-033 | title_jaが256文字超 | HTTP 422 |
| TC-VIDEO-034 | 無効なYouTube URL | HTTP 422 |
| TC-VIDEO-035 | order_number = 0 | HTTP 422 |
| TC-VIDEO-036 | 未認証 | HTTP 403 |
| TC-VIDEO-037 | 他講師の動画 | HTTP 403 |
| TC-VIDEO-038 | 一般ユーザー | HTTP 403 |
| TC-VIDEO-039 | 存在しない動画ID | HTTP 404 |

### 4. DELETE /api/v1/videos/{video_id} - 動画削除（TC-VIDEO-040 ~ 046）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-VIDEO-040 | 動画削除 | HTTP 204 |
| TC-VIDEO-041 | 管理者が他講師の動画削除 | HTTP 204 |
| TC-VIDEO-042 | 進捗記録付き動画削除（CASCADE） | HTTP 204 |
| TC-VIDEO-043 | 未認証 | HTTP 403 |
| TC-VIDEO-044 | 他講師の動画 | HTTP 403 |
| TC-VIDEO-045 | 一般ユーザー | HTTP 403 |
| TC-VIDEO-046 | 存在しない動画ID | HTTP 404 |

### 5. PATCH /api/v1/videos/courses/{course_id}/reorder - 動画順序変更（TC-VIDEO-047 ~ 060）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-VIDEO-047 | 3つの動画の順序変更 | HTTP 200 |
| TC-VIDEO-048 | 2つの動画入れ替え | HTTP 200 |
| TC-VIDEO-049 | 管理者が他講師のコース順序変更 | HTTP 200 |
| TC-VIDEO-050 | 一部の動画のみ順序変更 | HTTP 200 |
| TC-VIDEO-051 | video_ordersが空配列 | HTTP 422 |
| TC-VIDEO-052 | video_ordersフィールドなし | HTTP 422 |
| TC-VIDEO-053 | video_idなし | HTTP 422 |
| TC-VIDEO-054 | order_numberなし | HTTP 422 |
| TC-VIDEO-055 | 未認証 | HTTP 403 |
| TC-VIDEO-056 | 他講師のコース | HTTP 403 |
| TC-VIDEO-057 | 一般ユーザー | HTTP 403 |
| TC-VIDEO-058 | 存在しないコースID | HTTP 404 |
| TC-VIDEO-059 | 別コースの動画ID指定 | HTTP 200（スキップ） |
| TC-VIDEO-060 | 存在しない動画ID | HTTP 200（スキップ） |

## ファイル構成統計

- **テストケースディレクトリ数**: 60
- **request.sh**: 60ファイル
- **validate_response.sh**: 60ファイル
- **setup.sql**: 1ファイル

## 各APIのテストケース内訳

1. **GET /api/v1/videos/courses/{course_id}/videos**: 4テストケース（一覧取得、ソート確認）
2. **POST /api/v1/videos/courses/{course_id}/videos**: 22テストケース（追加、YouTube URL形式、バリデーション、認可）
3. **PUT /api/v1/videos/{video_id}**: 13テストケース（更新、バリデーション、認可）
4. **DELETE /api/v1/videos/{video_id}**: 7テストケース（削除、CASCADE、認可）
5. **PATCH /api/v1/videos/courses/{course_id}/reorder**: 14テストケース（順序変更、バリデーション、認可）

## テスト実行方法

### 個別テスト実行
```bash
cd /Users/masaemon/mss-dev/claude-code/mss-cource-platform/backend/fastapi/tests/integration
./run_test.sh videos TC-VIDEO-001
```

### 全動画テスト実行
```bash
./run_all_tests.sh videos
```

## 検証項目カバレッジ

### YouTube URL形式対応
- ✅ youtube.com/watch?v=VIDEO_ID
- ✅ youtu.be/VIDEO_ID
- ✅ youtube.com/embed/VIDEO_ID
- ✅ HTTP（HTTPSなし）
- ✅ パラメータ付きURL（&t=10s等）
- ✅ video_id抽出（11文字）

### 入力バリデーション
- ✅ 必須フィールドチェック（title_ja, youtube_url, order_number）
- ✅ 長さチェック（title_ja/title_en: 最大255文字）
- ✅ YouTube URL形式チェック
- ✅ video_id長さチェック（11文字）
- ✅ order_number範囲チェック（>= 1）

### 認証・認可
- ✅ トークンなしアクセス（HTTP 403）
- ✅ 一般ユーザーの講師機能アクセス（HTTP 403）
- ✅ 他講師のコース/動画操作（HTTP 403）
- ✅ 管理者の全動画操作権限

### ビジネスロジック
- ✅ order_number昇順ソート
- ✅ order_number自動採番（最大値+1）
- ✅ YouTube video_id自動抽出
- ✅ CASCADE削除（動画削除時の進捗削除）
- ✅ 動画順序変更（一括更新）

### データ整合性
- ✅ 外部キー制約確認（course_id）
- ✅ video_id自動抽出・保存
- ✅ order_numberの整合性

## 次のステップ

以下のAPI統合テストの実装に進みます：

1. **Progress API**: 40テストケース（TC-PROGRESS-001 ~ TC-PROGRESS-040）
2. **Comments API**: 51テストケース（TC-COMMENT-001 ~ TC-COMMENT-051）
3. **Categories API**: 29テストケース（TC-CATEGORY-001 ~ TC-CATEGORY-029）

**合計残り**: 120テストケース

## 注意事項

- テスト実行前に`videos/setup.sql`でテストデータが作成されます
- テストコース3件（course-001, course-002, course-003）
- テスト動画4件（video-001~004）
- YouTube動画ID検証は実際のYouTube APIを呼ばない（形式チェックのみ）
- パスワードはすべて「password123」

---

**作成日**: 2025-12-31
**ステータス**: ✅ 完了（60/60テストケース）
