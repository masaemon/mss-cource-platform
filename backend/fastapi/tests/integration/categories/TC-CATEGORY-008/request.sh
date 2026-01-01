#!/bin/bash
# TC-CATEGORY-008: CORS headers present

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -v 2>&1 | grep -i "access-control" > cors_headers.txt

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
