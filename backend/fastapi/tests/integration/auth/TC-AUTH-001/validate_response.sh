#!/bin/bash
# Validate TC-AUTH-001 response

RESPONSE_FILE="actual_response.json"

if [ ! -f "$RESPONSE_FILE" ]; then
    echo "✗ Response file not found"
    exit 1
fi

# Check status code (should be 201)
# Note: curl with -w flag can capture status code

# Validate JSON structure
echo "Validating response structure..."

# Check required fields exist
ACCESS_TOKEN=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('access_token', ''))")
USER_EMAIL=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('user', {}).get('email', ''))")
USER_DISPLAY_NAME=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('user', {}).get('display_name', ''))")
USER_ROLE=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('user', {}).get('role', ''))")

if [ -z "$ACCESS_TOKEN" ]; then
    echo "✗ access_token is missing or empty"
    exit 1
fi

if [ "$USER_EMAIL" != "newuser@example.com" ]; then
    echo "✗ user.email mismatch: expected 'newuser@example.com', got '$USER_EMAIL'"
    exit 1
fi

if [ "$USER_DISPLAY_NAME" != "New User" ]; then
    echo "✗ user.display_name mismatch: expected 'New User', got '$USER_DISPLAY_NAME'"
    exit 1
fi

if [ "$USER_ROLE" != "user" ]; then
    echo "✗ user.role mismatch: expected 'user', got '$USER_ROLE'"
    exit 1
fi

echo "✓ All validations passed"
exit 0
