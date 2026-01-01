#!/bin/bash
# TC-PROGRESS-028: Invalid token

TOKEN='invalid_token_12345'
RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/progress" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
