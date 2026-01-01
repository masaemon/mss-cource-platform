#!/bin/bash
# TC-CATEGORY-013: Validate ID exists and is not empty

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

ALL_HAVE_ID=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        all_valid = all(
            'id' in item and item['id'] and len(item['id']) > 0
            for item in data
        )
        print('true' if all_valid else 'false')
except Exception as e:
    print('false')
")

if [ "$ALL_HAVE_ID" != "true" ]; then
    echo "✗ Some categories don't have valid IDs"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ All categories have valid IDs"
exit 0
