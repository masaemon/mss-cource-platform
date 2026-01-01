#!/bin/bash
# TC-CATEGORY-024: Validate HTTP 200

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

CATEGORY_COUNT=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)
        print(len(data) if isinstance(data, list) else 0)
except Exception as e:
    print(0)
")

echo "✓ HTTP status 200 confirmed"
echo "ℹ Category count: $CATEGORY_COUNT (large dataset test)"
exit 0
