#!/bin/bash
# TC-COURSE-053: Validate HTTP 422

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:422" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 422 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 422"
    exit 1
fi
