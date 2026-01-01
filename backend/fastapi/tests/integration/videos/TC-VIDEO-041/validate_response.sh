#!/bin/bash
# TC-VIDEO-041: Validate HTTP 204

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:204" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 204 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 204"
    exit 1
fi
