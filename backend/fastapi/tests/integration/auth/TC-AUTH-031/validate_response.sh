#!/bin/bash
# TC-AUTH-031: Validate logout response

RESPONSE_FILE="actual_response.json"

SUCCESS=$(python3 -c "import json; data=json.load(open('$RESPONSE_FILE')); print(data.get('success', False))" 2>/dev/null)

if [ "$SUCCESS" = "True" ]; then
    echo "✓ Logout successful"
    exit 0
else
    echo "✗ Expected success: true"
    exit 1
fi
