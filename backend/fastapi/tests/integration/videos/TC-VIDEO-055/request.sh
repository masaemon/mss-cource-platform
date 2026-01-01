#!/bin/bash
# TC-VIDEO-055: Unauthenticated


curl -s -X PATCH "http://localhost:8000/api/v1/videos/courses/course-001/reorder" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"video_orders": [{"video_id": "video-001", "order_number": 1}]}'
