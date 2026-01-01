#!/bin/bash
# TC-COMMENT-017: Unauthenticated


curl -s -X POST "http://localhost:8000/api/v1/comments/courses/course-001/comments" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"content": "test"}'
