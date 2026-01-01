#!/bin/bash
# TC-CATEGORY-020: Admin updates category (future feature - not implemented yet)

# NOTE: This test is for future functionality
# Currently returns 405 Method Not Allowed as PUT is not implemented

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    echo "Failed to get admin token"
    exit 1
fi

curl -s -X PUT "http://localhost:8000/api/v1/categories/cat-programming-001" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "name_ja": "プログラミング（更新）",
    "name_en": "Programming (Updated)"
  }' | python3 -m json.tool 2>/dev/null || echo "{}"
