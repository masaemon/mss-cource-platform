#!/bin/bash
# TC-AUTH-027: Validate whitespace display_name error (HTTP 400)

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:400" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 400 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 400"
    exit 1
fi
