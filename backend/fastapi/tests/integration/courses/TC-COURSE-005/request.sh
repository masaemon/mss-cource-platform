#!/bin/bash
# TC-COURSE-005: Pagination page 1

curl -s -X GET "http://localhost:8000/api/v1/courses?page=1&limit=10" \
  -H "Content-Type: application/json" | python3 -m json.tool
