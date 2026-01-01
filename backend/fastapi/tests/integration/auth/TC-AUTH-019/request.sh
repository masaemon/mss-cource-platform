#!/bin/bash
# TC-AUTH-019: Get /me without token
curl -s -X GET http://localhost:8000/api/v1/auth/me \
  -w "\nHTTP_STATUS:%{http_code}\n"
