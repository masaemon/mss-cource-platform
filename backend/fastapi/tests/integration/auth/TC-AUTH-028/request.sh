#!/bin/bash
# TC-AUTH-028: display_name exceeds 51 characters
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"existing@example.com","password":"password123"}' \
    | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
curl -s -X PUT http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d "{\"display_name\":\"$(python3 -c 'print("a"*51)')\"}"
