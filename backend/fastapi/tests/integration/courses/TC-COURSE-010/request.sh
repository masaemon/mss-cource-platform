#!/bin/bash
# TC-COURSE-010: Empty result

curl -s -X GET "http://localhost:8000/api/v1/courses?search=存在しないキーワード" \
  -H "Content-Type: application/json" | python3 -m json.tool
