#!/bin/bash
# TC-COURSE-060: Validate instructor courses response

RESPONSE_FILE="actual_response.json"

if grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✓ HTTP status 200 confirmed"
    
    # Validate response is an array
    python3 << 'PYEOF'
import json
data = json.load(open('actual_response.json'))
if not isinstance(data, list):
    print("✗ Response is not an array")
    exit(1)
print("✓ Response is a valid array")
PYEOF
else
    echo "✗ Expected HTTP status 200"
    exit 1
fi
