#!/bin/bash
# TC-COURSE-003: Search by keyword Python

curl -s -X GET "http://localhost:8000/api/v1/courses?search=Python" \
  -H "Content-Type: application/json" | python3 -m json.tool
