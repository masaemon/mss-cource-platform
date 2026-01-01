#!/bin/bash
# TC-COURSE-007: Pagination last page

curl -s -X GET "http://localhost:8000/api/v1/courses?page=3&limit=10" \
  -H "Content-Type: application/json" | python3 -m json.tool
