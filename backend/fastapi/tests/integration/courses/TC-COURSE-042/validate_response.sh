#!/bin/bash
# TC-COURSE-042: Validate HTTP 400

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:400" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 400 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 400"
    exit 1
fi
