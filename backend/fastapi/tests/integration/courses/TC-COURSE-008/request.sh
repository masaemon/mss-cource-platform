#!/bin/bash
# TC-COURSE-008: Combined filter

curl -s -X GET "http://localhost:8000/api/v1/courses?category=cat-programming-001&search=Python" \
  -H "Content-Type: application/json" | python3 -m json.tool
