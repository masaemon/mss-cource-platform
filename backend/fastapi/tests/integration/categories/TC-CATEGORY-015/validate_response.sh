#!/bin/bash
# TC-CATEGORY-015: Validate categories can be used for filtering

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

HAS_FILTER_FIELDS=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        # Check all categories have id for filtering
        all_valid = all('id' in item and item['id'] for item in data)
        print('true' if all_valid else 'false')
except Exception as e:
    print('false')
")

if [ "$HAS_FILTER_FIELDS" != "true" ]; then
    echo "✗ Categories missing ID for filtering"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Categories have IDs for filtering"
exit 0
