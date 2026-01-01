# 統合テスト実装サマリー

## 実装完了項目

### ディレクトリ構造

```
tests/integration/
├── README.md                    # テスト実行ガイド
├── IMPLEMENTATION_SUMMARY.md    # この文書
├── common_setup.sql             # 共通セットアップSQL
├── run_test.sh                  # 個別テスト実行スクリプト
├── run_all_tests.sh             # 全テスト一括実行スクリプト
├── create_test.sh               # 新規テスト作成テンプレート
│
├── auth/                        # 認証API
│   ├── setup.sql               # Auth API用セットアップSQL
│   ├── test_auth_api.py        # Pytestテストファイル
│   ├── TC-AUTH-001/            # 有効なサインアップ
│   │   ├── request.sh
│   │   ├── validate_response.sh
│   │   ├── verify.sql
│   │   └── expected_db.txt
│   ├── TC-AUTH-010/            # 重複メールエラー
│   │   ├── request.sh
│   │   └── expected_response.json
│   ├── TC-AUTH-012/            # 有効なログイン
│   │   ├── request.sh
│   │   └── validate_response.sh
│   └── TC-AUTH-018/            # ユーザー情報取得
│       ├── request.sh
│       └── validate_response.sh
│
└── courses/                     # コースAPI
    ├── setup.sql               # Courses API用セットアップSQL
    ├── TC-COURSE-001/          # 公開コース一覧取得
    │   ├── request.sh
    │   └── validate_response.sh
    └── TC-COURSE-019/          # コース作成（講師）
        ├── request.sh
        ├── verify.sql
        └── expected_db.txt
```

## 実装された機能

### 1. curlベースのテスト実行

各テストケースは独立したcurlコマンドで実行できます:

```bash
cd tests/integration/auth/TC-AUTH-001
bash request.sh
```

### 2. SQLベースのデータセットアップ

ORMを使用せず、純粋なSQLでテストデータを投入:

```sql
-- setup.sql の例
INSERT INTO profiles (id, email, display_name, hashed_password, role, created_at, updated_at)
VALUES ('user-001', 'user@example.com', 'Test User', '$2b$12$...', 'user', NOW(), NOW());
```

### 3. SQLベースのDB検証

テスト実行後のデータベース状態をSQLで検証:

```sql
-- verify.sql の例
SELECT COUNT(*) as user_count, email, display_name, role
FROM profiles
WHERE email = 'newuser@example.com';
```

期待値との比較:

```
-- expected_db.txt
user_count	email	display_name	role
1	newuser@example.com	New User	user
```

### 4. レスポンス検証

#### 方法A: JSONファイルとの完全一致比較

```json
// expected_response.json
{
    "detail": "Email already registered"
}
```

#### 方法B: カスタム検証スクリプト（動的な値を含む場合）

```bash
# validate_response.sh
ACCESS_TOKEN=$(python3 -c "import json; data=json.load(open('actual_response.json')); print(data.get('access_token', ''))")
if [ -z "$ACCESS_TOKEN" ]; then
    echo "✗ access_token is missing"
    exit 1
fi
```

### 5. Pytestサポート

curlベースのテストをPytestからも実行可能:

```python
def test_TC_AUTH_001_valid_signup(self):
    """TC-AUTH-001: Valid signup"""
    test_dir = self.base_dir / "TC-AUTH-001"
    response = self.run_curl(test_dir / "request.sh")
    assert "access_token" in response
```

### 6. 統合テストランナー

```bash
# 個別テスト実行
./run_test.sh auth TC-AUTH-001

# 全テスト一括実行
./run_all_tests.sh
```

### 7. テンプレート生成ツール

新しいテストケースを簡単に作成:

```bash
./create_test.sh auth TC-AUTH-050 "Test password reset"
```

## テストの実行フロー

### 個別テスト実行時 (`run_test.sh`)

```
1. API共通セットアップSQL実行 (auth/setup.sql)
2. テスト固有セットアップSQL実行 (TC-XXX-NNN/setup.sql) ※あれば
3. APIリクエスト実行 (request.sh)
   → actual_response.json に保存
4. レスポンス検証
   - expected_response.json がある場合: JSONファイルと比較
   - validate_response.sh がある場合: カスタム検証実行
5. DB検証
   - verify.sql 実行 → actual_db.txt に保存
   - expected_db.txt と比較
```

### 全テスト実行時 (`run_all_tests.sh`)

```
1. 共通セットアップSQL実行 (common_setup.sql)
2. 各APIフォルダを順に処理:
   a. APIセットアップSQL実行 (auth/setup.sql など)
   b. TC-XXX-NNN フォルダを検索
   c. 各テストケースを run_test.sh で実行
3. テスト結果サマリーを表示
```

## 実装済みテストケース

### 認証API (4ケース)

| テストID | 説明 | 検証内容 |
|---------|------|---------|
| TC-AUTH-001 | 有効なサインアップ | レスポンス構造、DBレコード作成、パスワードハッシュ化 |
| TC-AUTH-010 | 重複メールエラー | エラーレスポンス |
| TC-AUTH-012 | 有効なログイン | トークン取得、トークンタイプ |
| TC-AUTH-018 | ユーザー情報取得 | 認証ユーザー情報、hashed_password非表示 |

### コースAPI (2ケース)

| テストID | 説明 | 検証内容 |
|---------|------|---------|
| TC-COURSE-001 | 公開コース一覧取得 | ページネーション、非公開コース除外 |
| TC-COURSE-019 | コース作成（講師） | DBレコード作成、講師ID、is_published=false |

## 今後の実装予定

### 優先度: 高

1. **動画API**
   - TC-VIDEO-001: 動画一覧取得
   - TC-VIDEO-005: 動画追加（YouTube URL検証）
   - TC-VIDEO-047: 動画順序変更

2. **進捗API**
   - TC-PROGRESS-001: 動画完了マーク
   - TC-PROGRESS-011: コース進捗取得
   - TC-PROGRESS-029: 進捗パーセンテージ計算

3. **コメントAPI**
   - TC-COMMENT-008: コメント投稿
   - TC-COMMENT-022: 講師返信
   - TC-COMMENT-034: コメント削除

### 優先度: 中

4. **残りの認証API**
   - バリデーションエラー系（TC-AUTH-002 〜 TC-AUTH-009）
   - レート制限（TC-AUTH-011, TC-AUTH-017）
   - プロフィール更新（TC-AUTH-022 〜 TC-AUTH-030）

5. **残りのコースAPI**
   - フィルタリング・検索（TC-COURSE-002 〜 TC-COURSE-010）
   - コース更新・削除（TC-COURSE-031 〜 TC-COURSE-048）
   - 公開切り替え（TC-COURSE-050 〜 TC-COURSE-057）

### 優先度: 低

6. **カテゴリーAPI**
   - TC-CATEGORY-001: カテゴリー一覧取得（シンプル）

## 技術的な特徴

### 1. ORMを使用しない理由

- **明示性**: SQLを直接記述することで、何が実行されるか明確
- **パフォーマンス**: ORM特有のN+1問題を回避
- **学習曲線**: SQLを知っていれば誰でも理解できる
- **デバッグ**: 実行されるSQLが目に見える

### 2. curlとPytestの両対応

- **curl**: CI/CD環境での軽量実行、デバッグが容易
- **Pytest**: IDEサポート、並列実行、レポート生成

### 3. ファイルベースの期待値管理

- **バージョン管理**: Gitで期待値の変更を追跡できる
- **レビュー容易**: PRで期待値の変更を確認しやすい
- **再利用性**: 同じ期待値を複数テストで共有可能

## ベストプラクティス

### 1. テストの独立性

各テストは独立して実行可能:

```bash
# setup.sql でクリーンアップ
TRUNCATE TABLE profiles;
INSERT INTO profiles VALUES (...);
```

### 2. トークンの管理

```bash
# ログインしてトークンを取得し、一時ファイルに保存
TOKEN=$(curl ... | python3 -c "...")
echo "$TOKEN" > /tmp/test_token.txt

# 他のテストで再利用
TOKEN=$(cat /tmp/test_token.txt)
```

### 3. 動的な値の検証

UUIDやタイムスタンプなど、実行ごとに変わる値は `validate_response.sh` で検証:

```bash
# 存在チェックのみ
if [ -z "$USER_ID" ]; then
    echo "✗ id is missing"
    exit 1
fi
```

### 4. エラーハンドリング

```bash
# curlのステータスコードを取得
curl -w "\nHTTP_STATUS:%{http_code}\n" ...

# Pytestで検証
assert response["detail"] == "Email already registered"
```

## 参考コマンド

```bash
# 全テスト実行
cd tests/integration
./run_all_tests.sh

# 個別テスト実行
./run_test.sh auth TC-AUTH-001

# Pytest実行
pytest auth/test_auth_api.py -v

# 新規テスト作成
./create_test.sh auth TC-AUTH-XXX "Description"

# データベース確認
docker-compose exec db mysql -u mss_user -pmss_password mss_course_platform

# APIログ確認
docker-compose logs api -f
```

## まとめ

この実装により、以下が実現されました:

✅ **SQL直接実行**: ORMを使わず、明示的なデータセットアップ
✅ **curlベース**: シンプルなAPIテスト実行
✅ **DB検証**: SQLでデータベース状態を検証
✅ **期待値ファイル**: JSONとテキストファイルで期待値管理
✅ **Pytest対応**: Pythonテストフレームワークでも実行可能
✅ **拡張性**: テンプレートで簡単に新規テスト追加

合計6テストケースが実装されており、残りの237ケースは同じパターンで実装可能です。
