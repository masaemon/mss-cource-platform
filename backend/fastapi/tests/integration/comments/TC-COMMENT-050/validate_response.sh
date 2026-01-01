#!/bin/bash
# TC-COMMENT-050: Validate HTTP 201

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:201" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 201 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 201"
    exit 1
fi
