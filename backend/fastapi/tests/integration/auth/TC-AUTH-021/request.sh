#!/bin/bash
# TC-AUTH-021: Get /me with expired token
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxfQ.invalid"
curl -s -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $EXPIRED_TOKEN" \
  -w "\nHTTP_STATUS:%{http_code}\n"
