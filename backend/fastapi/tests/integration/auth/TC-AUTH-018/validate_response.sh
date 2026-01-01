#!/bin/bash
# Validate TC-AUTH-018 response

RESPONSE_FILE="actual_response.json"

if [ ! -f "$RESPONSE_FILE" ]; then
    echo "✗ Response file not found"
    exit 1
fi

echo "Validating response structure..."

# Check required fields
USER_ID=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('id', ''))")
USER_EMAIL=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('email', ''))")
USER_DISPLAY_NAME=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('display_name', ''))")
USER_ROLE=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('role', ''))")
HAS_HASHED_PASSWORD=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print('hashed_password' in data)")

if [ -z "$USER_ID" ]; then
    echo "✗ id is missing or empty"
    exit 1
fi

if [ "$USER_EMAIL" != "existing@example.com" ]; then
    echo "✗ email mismatch: expected 'existing@example.com', got '$USER_EMAIL'"
    exit 1
fi

if [ "$USER_DISPLAY_NAME" != "Existing User" ]; then
    echo "✗ display_name mismatch: expected 'Existing User', got '$USER_DISPLAY_NAME'"
    exit 1
fi

if [ "$USER_ROLE" != "user" ]; then
    echo "✗ role mismatch: expected 'user', got '$USER_ROLE'"
    exit 1
fi

if [ "$HAS_HASHED_PASSWORD" == "True" ]; then
    echo "✗ hashed_password should not be included in response"
    exit 1
fi

echo "✓ All validations passed"
exit 0
