#!/bin/bash
# TC-AUTH-002: Signup without email

curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "display_name": "Test User",
    "password": "password123"
  }'
