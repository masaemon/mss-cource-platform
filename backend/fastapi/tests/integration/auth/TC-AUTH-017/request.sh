#!/bin/bash
# TC-AUTH-017: Login rate limit
for i in {1..6}; do
    curl -s -X POST http://localhost:8000/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"existing@example.com","password":"wrong"}' > /tmp/login_$i.txt
done
cat /tmp/login_6.txt
grep -q "429" /tmp/login_6.txt && echo "HTTP_STATUS:429"
