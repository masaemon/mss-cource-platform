#!/bin/bash
# TC-AUTH-006: display_name is 51+ characters

curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d "{
    \"email\": \"test@example.com\",
    \"display_name\": \"$(python3 -c 'print("a" * 51)')\",
    \"password\": \"password123\"
  }"
