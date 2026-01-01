#!/bin/bash
# TC-AUTH-023: Validate update bio response

RESPONSE_FILE="actual_response.json"

BIO=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('bio', ''))" 2>/dev/null)

if [ "$BIO" = "This is my updated bio" ]; then
    echo "✓ bio updated correctly"
    exit 0
else
    echo "✗ Expected bio 'This is my updated bio', got '$BIO'"
    exit 1
fi
