#!/bin/bash
# TC-CATEGORY-006: Validate no null values in required fields

RESPONSE_FILE="actual_response.json"

if ! grep -q "HTTP_STATUS:200" "$RESPONSE_FILE" 2>/dev/null; then
    echo "✗ Expected HTTP status 200"
    exit 1
fi

NO_NULLS=$(python3 -c "
import json
try:
    with open('$RESPONSE_FILE', 'r') as f:
        content = f.read()
        json_content = content.split('HTTP_STATUS:')[0]
        data = json.loads(json_content)

        if not isinstance(data, list):
            print('false')
        else:
            # Check required fields are not null/empty
            all_valid = all(
                item.get('id') and
                item.get('name_ja') and
                item.get('name_en') and
                item.get('slug')
                for item in data
            )
            print('true' if all_valid else 'false')
except Exception as e:
    print('false')
")

if [ "$NO_NULLS" != "true" ]; then
    echo "✗ Some categories have null/empty required fields"
    exit 1
fi

echo "✓ HTTP status 200 confirmed"
echo "✓ No null/empty values in required fields"
exit 0
