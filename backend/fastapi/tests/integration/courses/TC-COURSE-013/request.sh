#!/bin/bash
# TC-COURSE-013: limit=0

curl -s -X GET "http://localhost:8000/api/v1/courses?limit=0" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n"
