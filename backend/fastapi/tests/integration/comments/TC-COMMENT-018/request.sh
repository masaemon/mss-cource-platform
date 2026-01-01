#!/bin/bash
# TC-COMMENT-018: Invalid token

TOKEN='invalid_token_12345'
curl -s -X POST "http://localhost:8000/api/v1/comments/courses/course-001/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"content": "test"}'
