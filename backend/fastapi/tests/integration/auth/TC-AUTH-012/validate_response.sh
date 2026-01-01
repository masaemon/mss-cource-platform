#!/bin/bash
# Validate TC-AUTH-012 response

RESPONSE_FILE="actual_response.json"

if [ ! -f "$RESPONSE_FILE" ]; then
    echo "✗ Response file not found"
    exit 1
fi

echo "Validating response structure..."

# Check required fields
ACCESS_TOKEN=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('access_token', ''))")
TOKEN_TYPE=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('token_type', ''))")
USER_EMAIL=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('user', {}).get('email', ''))")

if [ -z "$ACCESS_TOKEN" ]; then
    echo "✗ access_token is missing or empty"
    exit 1
fi

if [ "$TOKEN_TYPE" != "bearer" ]; then
    echo "✗ token_type mismatch: expected 'bearer', got '$TOKEN_TYPE'"
    exit 1
fi

if [ "$USER_EMAIL" != "existing@example.com" ]; then
    echo "✗ user.email mismatch: expected 'existing@example.com', got '$USER_EMAIL'"
    exit 1
fi

# Save token for other tests
echo "$ACCESS_TOKEN" > /tmp/test_token.txt

echo "✓ All validations passed"
echo "✓ Token saved to /tmp/test_token.txt"
exit 0
