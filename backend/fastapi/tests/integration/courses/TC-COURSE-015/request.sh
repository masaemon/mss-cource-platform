#!/bin/bash
# TC-COURSE-015: Get published course detail

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/courses/course-001" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
