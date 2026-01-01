#!/bin/bash
# TC-COURSE-054: Unauthenticated


curl -s -X PATCH "http://localhost:8000/api/v1/courses/course-001/publish" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"is_published": true}'
