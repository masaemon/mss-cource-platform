#!/bin/bash
# TC-VIDEO-039: Validate HTTP 404

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:404" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 404 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 404"
    exit 1
fi
