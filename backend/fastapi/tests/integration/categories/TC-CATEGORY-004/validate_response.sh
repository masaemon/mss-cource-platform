#!/bin/bash
# TC-CATEGORY-004: Validate HTTP 200 without authentication

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200 for unauthenticated access"
    exit 1
fi

echo "✓ HTTP status 200 confirmed (unauthenticated access allowed)"
exit 0
