#!/bin/bash
# TC-AUTH-003: Invalid email format

curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "email": "invalid-email",
    "display_name": "Test User",
    "password": "password123"
  }'
