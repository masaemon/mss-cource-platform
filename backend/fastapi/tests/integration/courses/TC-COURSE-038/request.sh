#!/bin/bash
# TC-COURSE-038: Unauthenticated


curl -s -X PUT "http://localhost:8000/api/v1/courses/course-001" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"title_ja": "テスト"}'
