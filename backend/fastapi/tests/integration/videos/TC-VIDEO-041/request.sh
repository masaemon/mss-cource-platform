#!/bin/bash
# TC-VIDEO-041: Admin deletes other's video

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X DELETE "http://localhost:8000/api/v1/videos/video-004" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP_STATUS:%{http_code}\n"
