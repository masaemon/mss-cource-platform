#!/bin/bash
# TC-VIDEO-047: Reorder 3 videos

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"instructor1@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X PATCH "http://localhost:8000/api/v1/videos/courses/course-001/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"video_orders": [{"video_id": "video-003", "order_number": 1}, {"video_id": "video-001", "order_number": 2}, {"video_id": "video-002", "order_number": 3}]}'
