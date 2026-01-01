#!/bin/bash
# TC-AUTH-001: Valid signup

curl -s -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "display_name": "New User",
    "password": "password123"
  }' | python3 -m json.tool
