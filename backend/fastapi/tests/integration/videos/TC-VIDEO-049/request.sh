#!/bin/bash
# TC-VIDEO-049: Admin reorders other's course

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X PATCH "http://localhost:8000/api/v1/videos/courses/course-002/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"video_orders": [{"video_id": "video-004", "order_number": 1}]}'
