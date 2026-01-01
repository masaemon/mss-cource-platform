#!/bin/bash
# TC-AUTH-016: Login with wrong password
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -w "\nHTTP_STATUS:%{http_code}\n" \
  -d '{"email":"existing@example.com","password":"wrongpassword"}'
