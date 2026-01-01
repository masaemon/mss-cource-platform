#!/bin/bash
# TC-VIDEO-001: Get course videos list

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/videos/courses/course-001/videos" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
