#!/bin/bash
# TC-CATEGORY-001: Validate HTTP 200 and array response

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
        # Remove HTTP_STATUS line
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)
        if isinstance(data, list):
            print(len(data))
        else:
            print(0)
except Exception as e:
    print(0)
")

if [ "$CATEGORY_COUNT" -lt 1 ]; then
    echo "✗ Expected at least 1 category in response"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Response is array with $CATEGORY_COUNT categories"
exit 0
