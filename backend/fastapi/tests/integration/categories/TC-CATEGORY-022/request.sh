#!/bin/bash
# TC-CATEGORY-022: Non-admin cannot manage categories (future feature)

# NOTE: This test is for future functionality
# When implemented, non-admin should get 403 Forbidden

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user1@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    echo "Failed to get user token"
    exit 1
fi

curl -s -X POST "http://localhost:8000/api/v1/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "name_ja": "不正カテゴリー",
    "name_en": "Unauthorized Category",
    "slug": "unauthorized"
  }' | python3 -m json.tool 2>/dev/null || echo "{}"
