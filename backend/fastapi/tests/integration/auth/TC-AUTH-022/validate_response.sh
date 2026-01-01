#!/bin/bash
# TC-AUTH-022: Validate update display_name response

RESPONSE_FILE="actual_response.json"

DISPLAY_NAME=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('display_name', ''))" 2>/dev/null)

if [ "$DISPLAY_NAME" = "Updated Name" ]; then
    echo "✓ display_name updated correctly"
    exit 0
else
    echo "✗ Expected display_name 'Updated Name', got '$DISPLAY_NAME'"
    exit 1
fi
