#!/bin/bash
# TC-COURSE-012: page=-1

curl -s -X GET "http://localhost:8000/api/v1/courses?page=-1" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n"
