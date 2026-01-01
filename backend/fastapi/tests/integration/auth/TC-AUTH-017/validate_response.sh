#!/bin/bash
# TC-AUTH-017: Validate login rate limiting (HTTP 429)

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:429" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 429 (rate limit) confirmed"
    exit 0
else
    echo "✗ Expected HTTP status 429"
    exit 1
fi
