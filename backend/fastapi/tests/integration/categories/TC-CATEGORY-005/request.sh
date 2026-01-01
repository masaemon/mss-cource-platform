#!/bin/bash
# TC-CATEGORY-005: Empty result handling (delete all categories first)

# Note: This test requires manual setup to delete all categories
# For safety, we just verify empty array response handling

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
