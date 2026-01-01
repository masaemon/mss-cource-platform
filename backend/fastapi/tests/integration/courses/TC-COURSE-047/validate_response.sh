#!/bin/bash
# TC-COURSE-047: Validate HTTP 403

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:403" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 403 confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 403"
    exit 1
fi
