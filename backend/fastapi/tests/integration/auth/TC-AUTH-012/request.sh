#!/bin/bash
# TC-AUTH-012: Valid login

curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "password123"
  }' | python3 -m json.tool
