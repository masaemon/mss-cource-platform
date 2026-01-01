#!/bin/bash
# TC-COURSE-019: Valid course creation (instructor)

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"instructor1@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X POST "http://localhost:8000/api/v1/courses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"title_ja": "Pythonプログラミング入門", "title_en": "Introduction to Python Programming", "description_ja": "Python基礎を学ぶコース", "description_en": "Learn Python basics", "thumbnail_url": "https://example.com/thumb.jpg", "category_id": "cat-programming-001"}'
