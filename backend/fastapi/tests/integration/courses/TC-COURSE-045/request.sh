#!/bin/bash
# TC-COURSE-045: Unauthenticated


curl -s -X DELETE "http://localhost:8000/api/v1/courses/course-001" \
   \
  -w "\nHTTP_STATUS:%{http_code}\n"
