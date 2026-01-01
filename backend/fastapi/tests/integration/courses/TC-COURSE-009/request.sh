#!/bin/bash
# TC-COURSE-009: Unpublished courses not shown

curl -s -X GET "http://localhost:8000/api/v1/courses" \
  -H "Content-Type: application/json" | python3 -m json.tool
