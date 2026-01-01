#!/bin/bash
# TC-AUTH-004: Signup without display_name

curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
