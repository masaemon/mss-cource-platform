#!/bin/bash
# TC-COURSE-014: limit=101

curl -s -X GET "http://localhost:8000/api/v1/courses?limit=101" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n"
