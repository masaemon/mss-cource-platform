# 統合テスト クイックスタート

## 5分で始める統合テスト

### 1. 前提条件の確認

```bash
# Dockerコンテナが起動していることを確認
docker-compose ps

# 以下のコンテナが起動している必要があります:
# - api (FastAPI)
# - db (MySQL)
```

### 2. 最初のテストを実行

```bash
# テストディレクトリに移動
cd backend/fastapi/tests/integration

# 個別のテストを実行
./run_test.sh auth TC-AUTH-001
```

**期待される出力:**
```
=========================================
Running Test: auth/TC-AUTH-001
=========================================
[1/5] Running setup SQL...
[2/5] Running test-specific setup SQL...
[3/5] Executing API request...
[4/5] Comparing response...
✓ Response matches expected
[5/5] Verifying database state...
✓ Database state matches expected
=========================================
Test completed: auth/TC-AUTH-001
=========================================
```

### 3. 全テストを実行

```bash
./run_all_tests.sh
```

### 4. Pytestで実行

```bash
# 特定のAPIのテストを実行
pytest auth/test_auth_api.py -v

# 特定のテストケースのみ実行
pytest auth/test_auth_api.py::TestAuthAPI::test_TC_AUTH_001_valid_signup -v
```

## 利用可能なテストケース

### 認証API (4ケース実装済み)

```bash
# TC-AUTH-001: 有効なサインアップ
./run_test.sh auth TC-AUTH-001

# TC-AUTH-010: 重複メールエラー
./run_test.sh auth TC-AUTH-010

# TC-AUTH-012: 有効なログイン
./run_test.sh auth TC-AUTH-012

# TC-AUTH-018: ユーザー情報取得
./run_test.sh auth TC-AUTH-018
```

### コースAPI (2ケース実装済み)

```bash
# TC-COURSE-001: 公開コース一覧取得
./run_test.sh courses TC-COURSE-001

# TC-COURSE-019: コース作成（講師）
./run_test.sh courses TC-COURSE-019
```

### 動画API (1ケース実装済み)

```bash
# TC-VIDEO-005: 動画追加（YouTube URL検証）
./run_test.sh videos TC-VIDEO-005
```

## 新しいテストの作成

### ステップ1: テンプレートから作成

```bash
./create_test.sh auth TC-AUTH-050 "Test password reset"
```

### ステップ2: request.sh を編集

```bash
cd auth/TC-AUTH-050
nano request.sh
```

例:
```bash
#!/bin/bash
# TC-AUTH-050: Test password reset

curl -s -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }' | python3 -m json.tool
```

### ステップ3: validate_response.sh を編集

```bash
nano validate_response.sh
```

### ステップ4: verify.sql を編集（必要に応じて）

```bash
nano verify.sql
```

### ステップ5: テストを実行

```bash
cd ../..
./run_test.sh auth TC-AUTH-050
```

## トラブルシューティング

### Q: "Connection refused" エラーが出る

```bash
# APIコンテナが起動しているか確認
docker-compose ps api

# ログを確認
docker-compose logs api

# 再起動
docker-compose restart api
```

### Q: テストがタイムアウトする

```bash
# APIサーバーが起動するまで待つ
sleep 10

# ヘルスチェック
curl http://localhost:8000/health
```

### Q: "Database error" が出る

```bash
# MySQLが起動しているか確認
docker-compose ps db

# データベースに手動接続
docker-compose exec db mysql -u mss_user -pmss_password mss_course_platform

# テーブルを確認
SHOW TABLES;
```

### Q: レスポンスが期待値と一致しない

```bash
# 実際のレスポンスを確認
cd auth/TC-AUTH-001
cat actual_response.json

# 期待値を確認
cat expected_response.json

# 差分を確認
diff expected_response.json actual_response.json
```

## よくある使い方

### 1. 開発中のAPIをテスト

```bash
# コードを変更
vim app/api/v1/auth.py

# テストを実行
./run_test.sh auth TC-AUTH-001

# 失敗した場合、エラーを確認
docker-compose logs api
```

### 2. CI/CDパイプラインで使用

```yaml
# .github/workflows/test.yml
- name: Run integration tests
  run: |
    cd backend/fastapi/tests/integration
    ./run_all_tests.sh
```

### 3. 特定のシナリオのみテスト

```bash
# 認証関連のみ
cd auth
for dir in TC-AUTH-*/; do
    ../run_test.sh auth $(basename $dir)
done
```

## ベストプラクティス

### 1. テスト前にデータをクリーンアップ

各 `setup.sql` でデータをクリーンアップ:

```sql
TRUNCATE TABLE profiles;
INSERT INTO profiles VALUES (...);
```

### 2. トークンを再利用

```bash
# ログインしてトークンを保存
TOKEN=$(curl ... | python3 -c "...")
echo "$TOKEN" > /tmp/test_token.txt

# 他のテストで再利用
TOKEN=$(cat /tmp/test_token.txt)
```

### 3. 動的な値は validate_response.sh でチェック

```bash
# UUIDやタイムスタンプは存在チェックのみ
if [ -z "$USER_ID" ]; then
    echo "✗ id is missing"
    exit 1
fi
```

## 次のステップ

1. **より多くのテストケースを実装**: 残り236ケース
2. **Pytestテストを拡張**: 並列実行、カバレッジレポート
3. **CI/CD統合**: GitHub Actions, GitLab CI
4. **パフォーマンステスト**: 負荷テスト、ストレステスト

## リソース

- [詳細なREADME](README.md)
- [実装サマリー](IMPLEMENTATION_SUMMARY.md)
- [テストケース仕様](../../docs/tests/)
- [API仕様（チケット）](../../docs/tickets/)

---

**質問やフィードバック**: チケット #008 Integration Tests を参照
