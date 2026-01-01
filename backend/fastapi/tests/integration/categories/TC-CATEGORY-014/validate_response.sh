#!/bin/bash
# TC-CATEGORY-014: Validate required fields for dropdown

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

HAS_DROPDOWN_FIELDS=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        # Check all categories have id and name fields for dropdown
        all_valid = all(
            'id' in item and item['id'] and
            ('name_ja' in item or 'name_en' in item)
            for item in data
        )
        print('true' if all_valid else 'false')
except Exception as e:
    print('false')
")

if [ "$HAS_DROPDOWN_FIELDS" != "true" ]; then
    echo "✗ Missing required fields for dropdown usage"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ All categories have fields suitable for dropdown"
exit 0
