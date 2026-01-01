#!/bin/bash
# TC-COMMENT-005: Sorted by created_at DESC

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/comments/courses/course-001/comments" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
