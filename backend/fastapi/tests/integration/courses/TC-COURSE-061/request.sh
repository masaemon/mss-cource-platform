#!/bin/bash
# TC-COURSE-061: Unauthenticated


RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/instructor/courses" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" )

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
