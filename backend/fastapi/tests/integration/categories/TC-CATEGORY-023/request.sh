#!/bin/bash
# TC-CATEGORY-023: Concurrent requests (10 simultaneous)

for i in {1..10}; do
    RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
      -H "Content-Type: application/json" \
      -w "\nHTTP_STATUS:%{http_code}\n" &
done

wait

# Get last response for validation
RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
