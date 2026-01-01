#!/bin/bash
# TC-COURSE-028: Unauthenticated


curl -s -X POST "http://localhost:8000/api/v1/courses" \
   \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"title_ja": "テストコース", "category_id": "cat-programming-001"}'
