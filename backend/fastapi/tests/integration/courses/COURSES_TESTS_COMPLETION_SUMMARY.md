# Courses API Integration Tests - 完了サマリー

## 概要

コースAPI（Courses API）の統合テストケース全62件の実装が完了しました。

## 実装済みテストケース一覧

### 1. GET /api/v1/courses - コース一覧取得（TC-COURSE-001 ~ 014）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-COURSE-001 | 公開コース一覧取得 | レスポンス構造確認 |
| TC-COURSE-002 | カテゴリーフィルター | カテゴリー絞り込み |
| TC-COURSE-003 | キーワード検索（タイトル） | Python検索 |
| TC-COURSE-004 | キーワード検索（説明文） | 説明文検索 |
| TC-COURSE-005 | ページネーション（1ページ目） | page=1, limit=10 |
| TC-COURSE-006 | ページネーション（2ページ目） | page=2 |
| TC-COURSE-007 | ページネーション（最終ページ） | page=3 |
| TC-COURSE-008 | 複合フィルター | カテゴリー+検索 |
| TC-COURSE-009 | 非公開コース非表示 | 公開コースのみ |
| TC-COURSE-010 | 空の結果 | 該当なし |
| TC-COURSE-011 | page=0（バリデーション） | HTTP 422 |
| TC-COURSE-012 | page=-1（バリデーション） | HTTP 422 |
| TC-COURSE-013 | limit=0（バリデーション） | HTTP 422 |
| TC-COURSE-014 | limit=101（バリデーション） | HTTP 422 |

### 2. GET /api/v1/courses/{id} - コース詳細取得（TC-COURSE-015 ~ 018）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-COURSE-015 | 公開コース詳細取得 | 正常系 |
| TC-COURSE-016 | 非公開コース（講師本人） | 認可確認 |
| TC-COURSE-017 | 存在しないコースID | HTTP 404 |
| TC-COURSE-018 | 非公開コース（一般ユーザー） | HTTP 403 |

### 3. POST /api/v1/courses - コース作成（TC-COURSE-019 ~ 030）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-COURSE-019 | 有効なコース作成（講師） | HTTP 201 + レスポンス検証 |
| TC-COURSE-020 | 最小限のフィールド | HTTP 201 |
| TC-COURSE-021 | 管理者によるコース作成 | HTTP 201 |
| TC-COURSE-022 | title_jaなし | HTTP 422 |
| TC-COURSE-023 | title_jaが空文字 | HTTP 422 |
| TC-COURSE-024 | title_jaが256文字超 | HTTP 422 |
| TC-COURSE-025 | title_enが256文字超 | HTTP 422 |
| TC-COURSE-026 | category_idなし | HTTP 422 |
| TC-COURSE-027 | 無効なthumbnail_url | HTTP 422 |
| TC-COURSE-028 | 未認証 | HTTP 403 |
| TC-COURSE-029 | 一般ユーザー | HTTP 403 |
| TC-COURSE-030 | 存在しないcategory_id | HTTP 400 |

### 4. PUT /api/v1/courses/{id} - コース更新（TC-COURSE-031 ~ 042）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-COURSE-031 | 自分のコース更新（講師） | HTTP 200 |
| TC-COURSE-032 | 一部フィールドのみ更新 | HTTP 200 |
| TC-COURSE-033 | 管理者が他講師のコース更新 | HTTP 200 |
| TC-COURSE-034 | thumbnail_urlをnullに設定 | HTTP 200 |
| TC-COURSE-035 | title_jaが空文字 | HTTP 422 |
| TC-COURSE-036 | title_jaが256文字超 | HTTP 422 |
| TC-COURSE-037 | 無効なthumbnail_url | HTTP 422 |
| TC-COURSE-038 | 未認証 | HTTP 403 |
| TC-COURSE-039 | 他講師のコース更新 | HTTP 403 |
| TC-COURSE-040 | 一般ユーザー | HTTP 403 |
| TC-COURSE-041 | 存在しないコースID | HTTP 404 |
| TC-COURSE-042 | 存在しないcategory_id | HTTP 400 |

### 5. DELETE /api/v1/courses/{id} - コース削除（TC-COURSE-043 ~ 049）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-COURSE-043 | 自分のコース削除（講師） | HTTP 204 |
| TC-COURSE-044 | 管理者が他講師のコース削除 | HTTP 204 |
| TC-COURSE-045 | 未認証 | HTTP 403 |
| TC-COURSE-046 | 他講師のコース削除 | HTTP 403 |
| TC-COURSE-047 | 一般ユーザー | HTTP 403 |
| TC-COURSE-048 | 存在しないコースID | HTTP 404 |
| TC-COURSE-049 | 動画付きコース削除（CASCADE） | HTTP 204 |

### 6. PATCH /api/v1/courses/{id}/publish - 公開切り替え（TC-COURSE-050 ~ 057）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-COURSE-050 | コースを公開 | HTTP 200 |
| TC-COURSE-051 | コースを非公開 | HTTP 200 |
| TC-COURSE-052 | 管理者が他講師のコース公開 | HTTP 200 |
| TC-COURSE-053 | is_publishedフィールドなし | HTTP 422 |
| TC-COURSE-054 | 未認証 | HTTP 403 |
| TC-COURSE-055 | 他講師のコース公開 | HTTP 403 |
| TC-COURSE-056 | 一般ユーザー | HTTP 403 |
| TC-COURSE-057 | 存在しないコースID | HTTP 404 |

### 7. GET /api/v1/instructor/courses - 講師コース一覧（TC-COURSE-058 ~ 062）

| テストケース | 説明 | 検証内容 |
|------------|------|---------|
| TC-COURSE-058 | 講師の全コース取得 | HTTP 200 + 配列確認 |
| TC-COURSE-059 | 管理者が自分のコース取得 | HTTP 200 |
| TC-COURSE-060 | コースなし講師 | HTTP 200 + 空配列 |
| TC-COURSE-061 | 未認証 | HTTP 403 |
| TC-COURSE-062 | 一般ユーザー | HTTP 403 |

## ファイル構成統計

- **テストケースディレクトリ数**: 62
- **request.sh**: 62ファイル
- **validate_response.sh**: 62ファイル

## 各APIのテストケース内訳

1. **GET /api/v1/courses**: 14テストケース（一覧取得、フィルター、ページネーション、バリデーション）
2. **GET /api/v1/courses/{id}**: 4テストケース（詳細取得、権限確認）
3. **POST /api/v1/courses**: 12テストケース（作成、バリデーション、認可）
4. **PUT /api/v1/courses/{id}**: 12テストケース（更新、バリデーション、認可）
5. **DELETE /api/v1/courses/{id}**: 7テストケース（削除、認可、CASCADE）
6. **PATCH /api/v1/courses/{id}/publish**: 8テストケース（公開切り替え、認可）
7. **GET /api/v1/instructor/courses**: 5テストケース（講師コース一覧、認可）

## テスト実行方法

### 個別テスト実行
```bash
cd /Users/masaemon/mss-dev/claude-code/mss-cource-platform/backend/fastapi/tests/integration
./run_test.sh courses TC-COURSE-001
```

### 全コーステスト実行
```bash
./run_all_tests.sh courses
```

## 検証項目カバレッジ

### 入力バリデーション
- ✅ 必須フィールドチェック（title_ja, category_id）
- ✅ 長さチェック（title_ja/title_en: 最大255文字）
- ✅ URL形式チェック（thumbnail_url）
- ✅ ページネーションバリデーション（page >= 1, limit 1-100）

### 認証・認可
- ✅ トークンなしアクセス（HTTP 403）
- ✅ 一般ユーザーの講師機能アクセス（HTTP 403）
- ✅ 他講師のコース操作（HTTP 403）
- ✅ 管理者の全コース操作権限

### ビジネスロジック
- ✅ 公開/非公開フラグによる表示制御
- ✅ カテゴリーフィルタリング
- ✅ キーワード検索（タイトル・説明文）
- ✅ ページネーション
- ✅ CASCADE削除（コース削除時の動画削除）
- ✅ 講師自身のコース一覧取得

### データ整合性
- ✅ 外部キー制約確認（category_id）
- ✅ コース作成時のinstructor_id自動設定
- ✅ is_published初期値（false）

## 次のステップ

以下のAPI統合テストの実装に進みます：

1. **Videos API**: 60テストケース（TC-VIDEO-001 ~ TC-VIDEO-060）
2. **Progress API**: 40テストケース（TC-PROGRESS-001 ~ TC-PROGRESS-040）
3. **Comments API**: 51テストケース（TC-COMMENT-001 ~ TC-COMMENT-051）
4. **Categories API**: 29テストケース（TC-CATEGORY-001 ~ TC-CATEGORY-029）

**合計残り**: 180テストケース

## 注意事項

- テスト実行前に`courses/setup.sql`でテストデータが作成されます
- 講師ユーザー（instructor1@example.com, instructor2@example.com）
- 管理者ユーザー（admin@example.com）
- 一般ユーザー（user@example.com）
- テストコース5件（公開3件、非公開2件）
- パスワードはすべて「password123」

---

**作成日**: 2025-12-31
**ステータス**: ✅ 完了（62/62テストケース）
