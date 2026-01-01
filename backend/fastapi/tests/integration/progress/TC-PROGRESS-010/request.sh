#!/bin/bash
# TC-PROGRESS-010: Non-existent video ID

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user1@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X POST "http://localhost:8000/api/v1/progress/videos/non-existent-id" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"is_completed": true}'
