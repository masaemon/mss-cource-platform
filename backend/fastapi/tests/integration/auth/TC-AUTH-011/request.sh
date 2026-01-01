#!/bin/bash
# TC-AUTH-011: Rate limit - 4th signup attempt within 1 hour

# Attempt 4 signups rapidly
for i in {1..4}; do
    curl -s -X POST http://localhost:8000/api/v1/auth/signup \
      -H "Content-Type: application/json" \
      -w "\nHTTP_STATUS:%{http_code}\n" \
      -d "{
        \"email\": \"ratetest${i}@example.com\",
        \"display_name\": \"Rate Test ${i}\",
        \"password\": \"password123\"
      }" > /tmp/signup_${i}.txt
    echo "Attempt $i completed"
done

# The 4th attempt should fail with 429
cat /tmp/signup_4.txt
