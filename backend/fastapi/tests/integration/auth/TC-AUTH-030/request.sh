#!/bin/bash
# TC-AUTH-030: Update profile without authentication
curl -s -X PUT http://localhost:8000/api/v1/auth/profile \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"display_name":"Test"}'
