#!/bin/bash
# TC-COMMENT-018: Validate HTTP 401

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:401" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 401 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 401"
    exit 1
fi
