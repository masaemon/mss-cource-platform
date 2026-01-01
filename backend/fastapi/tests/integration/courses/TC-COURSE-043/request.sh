#!/bin/bash
# TC-COURSE-043: Delete own course (instructor)

TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"instructor1@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

curl -s -X DELETE "http://localhost:8000/api/v1/courses/course-004" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nHTTP_STATUS:%{http_code}\n"
