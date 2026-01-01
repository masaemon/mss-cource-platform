#!/bin/bash
# TC-VIDEO-043: Unauthenticated


curl -s -X DELETE "http://localhost:8000/api/v1/videos/video-001" \
   \
  -w "\nHTTP_STATUS:%{http_code}\n"
