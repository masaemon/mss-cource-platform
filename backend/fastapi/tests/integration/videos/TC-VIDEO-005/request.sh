#!/bin/bash
# TC-VIDEO-005: Valid video (youtube.com/watch)

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"instructor1@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X POST "http://localhost:8000/api/v1/videos/courses/course-001/videos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"title_ja": "Python入門 第1回", "title_en": "Python Intro Lesson 1", "description_ja": "変数とデータ型", "description_en": "Variables and data types", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "order_number": 4}'
