#!/bin/bash
# TC-COURSE-006: Pagination page 2

curl -s -X GET "http://localhost:8000/api/v1/courses?page=2&limit=10" \
  -H "Content-Type: application/json" | python3 -m json.tool
