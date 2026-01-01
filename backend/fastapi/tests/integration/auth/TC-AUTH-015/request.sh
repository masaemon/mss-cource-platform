#!/bin/bash
# TC-AUTH-015: Login with non-existent email

curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'
