#!/bin/bash
# TC-AUTH-024: Validate update both fields response

RESPONSE_FILE="actual_response.json"

DISPLAY_NAME=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('display_name', ''))" 2>/dev/null)
BIO=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('bio', ''))" 2>/dev/null)

if [ "$DISPLAY_NAME" = "New Display Name" ] && [ "$BIO" = "New bio description" ]; then
    echo "✓ Both fields updated correctly"
    exit 0
else
    echo "✗ Expected display_name 'New Display Name' and bio 'New bio description'"
    echo "Got display_name: '$DISPLAY_NAME', bio: '$BIO'"
    exit 1
fi
