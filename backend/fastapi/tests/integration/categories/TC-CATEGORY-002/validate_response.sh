#!/bin/bash
# TC-CATEGORY-002: Validate name_ja ascending order

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

IS_SORTED=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        if not isinstance(data, list) or len(data) == 0:
            print('false')
        else:
            names = [item.get('name_ja', '') for item in data if 'name_ja' in item]
            is_sorted = names == sorted(names)
            print('true' if is_sorted else 'false')
except Exception as e:
    print('false')
")

if [ "$IS_SORTED" != "true" ]; then
    echo "✗ Categories are not sorted by name_ja in ascending order"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ Categories sorted by name_ja (ascending)"
exit 0
