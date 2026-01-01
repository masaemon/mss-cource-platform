#!/bin/bash
# TC-COMMENT-044: User comment has is_instructor_reply=false

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user1@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X POST "http://localhost:8000/api/v1/comments/courses/course-001/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"content": "ユーザーコメント"}'
