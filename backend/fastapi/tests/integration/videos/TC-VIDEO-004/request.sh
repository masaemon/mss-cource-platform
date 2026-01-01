#!/bin/bash
# TC-VIDEO-004: Non-existent course ID

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/videos/courses/non-existent-id/videos" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
