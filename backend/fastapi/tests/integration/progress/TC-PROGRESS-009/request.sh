#!/bin/bash
# TC-PROGRESS-009: Invalid token

TOKEN='invalid_token_12345'
curl -s -X POST "http://localhost:8000/api/v1/progress/videos/video-001" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"is_completed": true}'
