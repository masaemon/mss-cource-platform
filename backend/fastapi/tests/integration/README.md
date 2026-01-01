# 統合テスト実行ガイド

## 概要

このディレクトリには、MSS Course Platform BFF の統合テストが含まれています。

### テスト構成

- **API別フォルダ**: `auth/`, `courses/`, `videos/`, `progress/`, `comments/`, `categories/`
- **テストケース別サブフォルダ**: 各APIフォルダ内に `TC-XXX-NNN/` 形式のフォルダ
- **curlベース**: 各テストはcurlコマンドで実行可能
- **Pytestベース**: Pythonのテストフレームワークでも実行可能

### ファイル構成

各テストケースフォルダには以下のファイルが含まれます:

```
TC-XXX-NNN/
├── request.sh              # curlコマンドでAPIリクエストを実行
├── setup.sql               # (オプション) テスト固有の事前データ投入SQL
├── expected_response.json  # (オプション) 期待されるレスポンス
├── validate_response.sh    # (オプション) レスポンス検証スクリプト
├── verify.sql              # (オプション) DB検証用SQL
└── expected_db.txt         # (オプション) DB検証の期待値
```

## 前提条件

1. Dockerコンテナが起動していること
   ```bash
   docker-compose up -d
   ```

2. APIサーバーが起動していること（ポート8000）

3. MySQLデータベースが起動していること

## テスト実行方法

### 方法1: 個別のテストを実行（curlベース）

```bash
# シンプルな実行
cd tests/integration/auth/TC-AUTH-001
bash request.sh

# ヘルパースクリプトを使用（推奨）
cd tests/integration
./run_test.sh auth TC-AUTH-001
```

### 方法2: Pytestで実行

```bash
# すべてのテストを実行
pytest tests/integration/auth/test_auth_api.py -v

# 特定のテストのみ実行
pytest tests/integration/auth/test_auth_api.py::TestAuthAPI::test_TC_AUTH_001_valid_signup -v
```

### 方法3: すべてのテストを一括実行

```bash
cd tests/integration
./run_all_tests.sh
```

## テストの追加方法

### 1. 新しいテストケースを追加

```bash
# テストケースディレクトリを作成
mkdir -p tests/integration/auth/TC-AUTH-XXX

# 必要なファイルを作成
cd tests/integration/auth/TC-AUTH-XXX
touch request.sh validate_response.sh verify.sql expected_db.txt
chmod +x request.sh validate_response.sh
```

### 2. request.sh を作成

```bash
#!/bin/bash
# TC-AUTH-XXX: テストの説明

curl -s -X POST http://localhost:8000/api/v1/auth/endpoint \
  -H "Content-Type: application/json" \
  -d '{
    "field": "value"
  }' | python3 -m json.tool
```

### 3. verify.sql を作成（DB検証が必要な場合）

```sql
-- Verify database state
SELECT
    column1,
    column2
FROM table_name
WHERE condition;
```

### 4. expected_db.txt を作成

```
column1	column2
value1	value2
```

### 5. Pytestに追加（オプション）

```python
def test_TC_AUTH_XXX_description(self):
    """TC-AUTH-XXX: Description"""
    test_dir = self.base_dir / "TC-AUTH-XXX"

    # Execute API request
    response = self.run_curl(test_dir / "request.sh")

    # Validate response
    assert "expected_field" in response

    # Verify database state
    if (test_dir / "verify.sql").exists():
        verify_output = self.run_sql(test_dir / "verify.sql")
        assert "expected_value" in verify_output
```

## テストデータについて

### 共通セットアップ

各APIフォルダの `setup.sql` で共通のテストデータを投入します:

- **カテゴリー**: 3つ（プログラミング、デザイン、ビジネス）
- **ユーザー**: 講師、管理者、一般ユーザー
- **コース**: 公開コース2つ、非公開コース1つ

### パスワード

テスト用ユーザーのパスワードは以下の通り:

- 講師: `instructor123`
- 管理者: `admin123`
- 一般ユーザー: `user123`
- 既存ユーザー（Auth用）: `password123`

### トークンの受け渡し

テスト間でトークンを共有する場合は `/tmp/test_token.txt` に保存します:

```bash
# ログインしてトークンを保存
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"user123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
echo "$TOKEN" > /tmp/test_token.txt

# 他のテストで使用
TOKEN=$(cat /tmp/test_token.txt)
```

## トラブルシューティング

### 1. DBに接続できない

```bash
# コンテナが起動しているか確認
docker-compose ps

# MySQLに手動接続してみる
docker-compose exec db mysql -u mss_user -pmss_password mss_course_platform
```

### 2. APIが応答しない

```bash
# APIコンテナのログを確認
docker-compose logs api

# APIコンテナを再起動
docker-compose restart api
```

### 3. テストが失敗する

```bash
# setup.sqlを手動実行してデータを確認
docker-compose exec -T db mysql -u mss_user -pmss_password mss_course_platform < tests/integration/auth/setup.sql

# レスポンスを確認
cd tests/integration/auth/TC-AUTH-001
bash request.sh
cat actual_response.json
```

### 4. DB検証が失敗する

```bash
# SQLを手動実行して結果を確認
docker-compose exec db mysql -u mss_user -pmss_password mss_course_platform -e "SELECT * FROM profiles WHERE email = 'newuser@example.com';"
```

## CI/CDでの実行

GitHub Actionsなどで実行する場合:

```yaml
- name: Run integration tests
  run: |
    docker-compose up -d
    sleep 10  # Wait for services to be ready
    cd backend/fastapi/tests/integration
    ./run_all_tests.sh
```

## 既知の問題

- タイムスタンプやUUIDを含むレスポンスは完全一致検証ができないため、validate_response.sh で個別にチェック
- テストの実行順序によってはデータの競合が発生する可能性あり（setup.sqlでクリーンアップ）

## 参考資料

- [テストケース仕様書](../../docs/tests/)
- [API仕様（チケット）](../../docs/tickets/)
