#!/bin/bash
# TC-AUTH-007: Signup without password

curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "email": "test@example.com",
    "display_name": "Test User"
  }'
