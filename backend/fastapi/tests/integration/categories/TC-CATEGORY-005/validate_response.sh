#!/bin/bash
# TC-CATEGORY-005: Validate HTTP 200 (even if empty)

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

IS_ARRAY=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)
        print('true' if isinstance(data, list) else 'false')
except Exception as e:
    print('false')
")

if [ "$IS_ARRAY" != "true" ]; then
    echo "✗ Response is not an array"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Response is valid array"
exit 0
