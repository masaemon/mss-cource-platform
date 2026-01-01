#!/bin/bash
# TC-PROGRESS-008: Unauthenticated


curl -s -X POST "http://localhost:8000/api/v1/progress/videos/video-001" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"is_completed": true}'
