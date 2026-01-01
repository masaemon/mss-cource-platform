#!/bin/bash
# TC-AUTH-020: Get /me with invalid token
curl -s -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token" \
  -w "\nHTTP_STATUS:%{http_code}\n"
