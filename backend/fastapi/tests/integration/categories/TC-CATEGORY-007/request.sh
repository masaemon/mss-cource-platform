#!/bin/bash
# TC-CATEGORY-007: Response time < 500ms

START_TIME=$(python3 -c "import time; print(int(time.time() * 1000))")

RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/categories" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

END_TIME=$(python3 -c "import time; print(int(time.time() * 1000))")

echo "RESPONSE_TIME:$((END_TIME - START_TIME))ms"

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
