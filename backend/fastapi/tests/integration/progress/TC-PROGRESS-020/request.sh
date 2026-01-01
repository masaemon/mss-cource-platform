#!/bin/bash
# TC-PROGRESS-020: Invalid token

TOKEN='invalid_token_12345'
RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/progress/courses/course-001" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
