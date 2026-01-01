#!/bin/bash
# TC-VIDEO-036: Unauthenticated


curl -s -X PUT "http://localhost:8000/api/v1/videos/video-001" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"title_ja": "テスト"}'
