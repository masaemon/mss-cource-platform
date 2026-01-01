#!/bin/bash
# TC-PROGRESS-035: Validate HTTP 200

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 200 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 200"
    exit 1
fi
