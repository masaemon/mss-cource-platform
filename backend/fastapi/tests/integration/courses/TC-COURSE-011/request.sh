#!/bin/bash
# TC-COURSE-011: page=0

curl -s -X GET "http://localhost:8000/api/v1/courses?page=0" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n"
