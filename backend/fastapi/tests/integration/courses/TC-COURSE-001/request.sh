#!/bin/bash
# TC-COURSE-001: Get public courses list

curl -s -X GET "http://localhost:8000/api/v1/courses" \
  -H "Content-Type: application/json" | python3 -m json.tool
