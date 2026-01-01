#!/bin/bash
# TC-COURSE-004: Search in description

curl -s -X GET "http://localhost:8000/api/v1/courses?search=初心者" \
  -H "Content-Type: application/json" | python3 -m json.tool
