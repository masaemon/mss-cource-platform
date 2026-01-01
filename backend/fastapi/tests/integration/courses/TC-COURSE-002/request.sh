#!/bin/bash
# TC-COURSE-002: Filter by category

curl -s -X GET "http://localhost:8000/api/v1/courses?category=cat-programming-001" \
  -H "Content-Type: application/json" | python3 -m json.tool
