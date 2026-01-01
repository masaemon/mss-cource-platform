#!/bin/bash
# TC-AUTH-025: Validate clear bio to null

RESPONSE_FILE="actual_response.json"

BIO=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('bio'))" 2>/dev/null)

if [ "$BIO" = "None" ]; then
    echo "✓ bio cleared to null correctly"
    exit 0
else
    echo "✗ Expected bio to be null, got '$BIO'"
    exit 1
fi
