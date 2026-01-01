#!/bin/bash
# TC-VIDEO-023: Unauthenticated


curl -s -X POST "http://localhost:8000/api/v1/videos/courses/course-001/videos" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"title_ja": "テスト動画", "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "order_number": 1}'
