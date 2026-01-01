#!/bin/bash
# TC-CATEGORY-029: Validate HTTP 200

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "ℹ Data integrity: Check verify.sql for orphaned categories"
exit 0
