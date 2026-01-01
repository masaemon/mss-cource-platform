#!/bin/bash
# TC-AUTH-014: Login without password

curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "email": "user@example.com"
  }'
