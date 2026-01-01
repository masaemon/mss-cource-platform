#!/bin/bash
# TC-COMMENT-038: Unauthenticated


curl -s -X DELETE "http://localhost:8000/api/v1/comments/comment-001" \
   \
  -w "\nHTTP_STATUS:%{http_code}\n"
