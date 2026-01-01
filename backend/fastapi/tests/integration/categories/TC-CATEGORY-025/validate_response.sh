#!/bin/bash
# TC-CATEGORY-025: Validate HTTP 200

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "ℹ Cache effectiveness: Manual verification recommended"
exit 0
