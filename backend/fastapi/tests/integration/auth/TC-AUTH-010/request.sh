#!/bin/bash
# TC-AUTH-010: Duplicate email signup

RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{
    "email": "existing@example.com",
    "display_name": "Test User",
    "password": "password123"
  }')

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
