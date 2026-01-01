#!/bin/bash
# TC-AUTH-018: Get current user with valid token

# Read token from previous test or login first
if [ -f /tmp/test_token.txt ]; then
    TOKEN=$(cat /tmp/test_token.txt)
else
    # Login to get token
    TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"existing@example.com","password":"password123"}' \
        | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
fi

curl -s -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
