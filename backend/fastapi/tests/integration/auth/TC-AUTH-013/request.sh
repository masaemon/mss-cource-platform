#!/bin/bash
# TC-AUTH-013: Login without email

curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "password": "password123"
  }'
