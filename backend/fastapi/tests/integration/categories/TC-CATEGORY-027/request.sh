#!/bin/bash
# TC-CATEGORY-027: Foreign key relationship with courses

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
